"""
DaamBD - Department of Agricultural Marketing (DAM) / MOA API Connector
Handles relational ingestion, master ID resolution, bounds checking, and anomaly tagging.
"""

import os
import json
import logging
import urllib.request
import urllib.error
from datetime import datetime, date
from typing import Dict, List, Any, Optional

from backend.services.price_validator import PriceValidator, PriceValidationResult

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger("DAMConnector")


class DAMConnector:
    """
    Ingestion adapter for Bangladesh Ministry of Agriculture / DAM price service.
    """

    BASE_URL = "https://moa-services.com/agri-service"
    COMMODITY_LIST_ENDPOINT = f"{BASE_URL}/crop-price-info/commodity-list"
    MEASUREMENT_UNIT_ENDPOINT = f"{BASE_URL}/crop-price-info/measurement-unit-list"
    PRICE_REPORT_ENDPOINT = f"{BASE_URL}/reports/price-report"

    def __init__(self, data_cache_dir: Optional[str] = None):
        if data_cache_dir is None:
            self.data_cache_dir = os.path.join(os.path.dirname(__file__), "..", "data")
        else:
            self.data_cache_dir = data_cache_dir

        self.commodities_cache: Dict[int, Dict[str, Any]] = {}
        self.units_cache: Dict[int, Dict[str, Any]] = {}
        self.historical_baselines: Dict[str, float] = {}

        self._load_local_master_caches()

    def _load_local_master_caches(self):
        """Loads master datasets from disk cache to ensure zero downtime if remote is unreachable."""
        comm_file = os.path.join(self.data_cache_dir, "commodities_master.json")
        unit_file = os.path.join(self.data_cache_dir, "units_master.json")

        if os.path.exists(comm_file):
            try:
                with open(comm_file, "r", encoding="utf-8") as f:
                    comm_list = json.load(f)
                    for item in comm_list:
                        cid = int(item["commodity_id"])
                        self.commodities_cache[cid] = item
                logger.info(f"Loaded {len(self.commodities_cache)} commodities from local master cache.")
            except Exception as e:
                logger.error(f"Failed to load local commodities cache: {e}")

        if os.path.exists(unit_file):
            try:
                with open(unit_file, "r", encoding="utf-8") as f:
                    unit_list = json.load(f)
                    for item in unit_list:
                        uid = int(item["unit_id"])
                        self.units_cache[uid] = item
                logger.info(f"Loaded {len(self.units_cache)} units from local master cache.")
            except Exception as e:
                logger.error(f"Failed to load local units cache: {e}")

        # Seed reasonable baseline prices for historical anomaly detection (7-day historical moving average)
        self.historical_baselines = {
            "1": 52.0,   # Coarse Rice
            "2": 62.0,   # Medium Rice
            "3": 78.0,   # Fine Rice (Miniket)
            "4": 45.0,   # Open Flour
            "5": 110.0,  # Packaged Flour 2kg
            "6": 135.0,  # Red Lentil (Local)
            "7": 105.0,  # Red Lentil (Imported)
            "8": 160.0,  # Mung Dal
            "9": 165.0,  # Soybean Oil loose
            "10": 175.0, # Soybean Oil 1L
            "11": 850.0, # Soybean Oil 5L
            "12": 260.0, # Mustard Oil
            "13": 55.0,  # Potato
            "14": 115.0, # Onion Local
            "15": 95.0,  # Onion Imported
            "16": 210.0, # Garlic Local
            "17": 220.0, # Garlic Imported
            "18": 260.0, # Ginger Imported
            "19": 180.0, # Green Chili
            "20": 70.0,  # Eggplant
            "21": 65.0,  # Tomato
            "22": 185.0, # Broiler Chicken
            "23": 290.0, # Sonali Chicken
            "24": 750.0, # Beef
            "25": 1100.0,# Mutton
            "26": 52.0,  # Farm Egg Hali
            "27": 1400.0,# Hilsha 1kg
            "28": 380.0, # Rui Fish
            "29": 135.0, # Sugar
            "30": 42.0,  # Salt
        }

    def fetch_remote_json(self, url: str, timeout: int = 6) -> Optional[Any]:
        """Fetches JSON from remote HTTP endpoint with timeout handling."""
        try:
            req = urllib.request.Request(
                url,
                headers={"User-Agent": "DaamBD-IngestionEngine/1.0", "Accept": "application/json"}
            )
            with urllib.request.urlopen(req, timeout=timeout) as response:
                if response.status == 200:
                    raw_data = response.read().decode("utf-8")
                    return json.loads(raw_data)
        except urllib.error.URLError as e:
            logger.warning(f"Remote API call failed ({url}): {e}. Utilizing cached master data.")
        except Exception as e:
            logger.warning(f"Error parsing remote data ({url}): {e}")
        return None

    def refresh_master_lists(self):
        """Fetches and updates commodity and unit master lists from the official MOA API."""
        # 1. Fetch Commodities
        comm_data = self.fetch_remote_json(self.COMMODITY_LIST_ENDPOINT)
        if isinstance(comm_data, list) and len(comm_data) > 0:
            for item in comm_data:
                cid = int(item.get("commodity_id", 0))
                if cid > 0:
                    self.commodities_cache[cid] = item
            logger.info(f"Refreshed {len(self.commodities_cache)} commodities from MOA API.")

        # 2. Fetch Units
        unit_data = self.fetch_remote_json(self.MEASUREMENT_UNIT_ENDPOINT)
        if isinstance(unit_data, list) and len(unit_data) > 0:
            for item in unit_data:
                uid = int(item.get("unit_id", 0))
                if uid > 0:
                    self.units_cache[uid] = item
            logger.info(f"Refreshed {len(self.units_cache)} units from MOA API.")

    def parse_and_validate_report(
        self,
        raw_reports: List[Dict[str, Any]],
        target_district: str = "Dhaka"
    ) -> List[Dict[str, Any]]:
        """
        Parses relational IDs in daily price records, applies relational mappings,
        computes statistics, and runs PriceValidator for anomaly detection.
        """
        processed_records = []

        for record in raw_reports:
            cid = int(record.get("commodity_id", 0))
            if cid not in self.commodities_cache:
                logger.warning(f"Skipping unknown commodity_id: {cid}")
                continue

            commodity_meta = self.commodities_cache[cid]
            commodity_name_en = commodity_meta.get("commodity_name", "Unknown Commodity")
            commodity_name_bn = commodity_meta.get("commodity_name_bn", "অজ্ঞাত পণ্য")
            category_bn = commodity_meta.get("category_name_bn", "নিত্যপণ্য")
            category_en = commodity_meta.get("category_name_en", "Essentials")

            # Resolve units
            unit_retail_id = int(record.get("unit_retail", 1))
            unit_meta = self.units_cache.get(unit_retail_id, {"unit_name": "kg", "unit_name_bn": "কেজি"})
            unit_name_en = unit_meta.get("unit_name", "kg")
            unit_name_bn = unit_meta.get("unit_name_bn", "কেজি")

            # Extract raw price bounds
            try:
                r_low = float(record.get("r_lowestPrice", 0.0))
                r_high = float(record.get("r_highestPrice", 0.0))
                w_low = float(record.get("w_lowestPrice", 0.0))
                w_high = float(record.get("w_highestPrice", 0.0))
            except (ValueError, TypeError):
                logger.error(f"Malformed price values for {commodity_name_en}")
                continue

            # Run PriceValidator on Retail Price
            hist_avg = self.historical_baselines.get(str(cid))
            val_result: PriceValidationResult = PriceValidator.evaluate(
                commodity_id=cid,
                commodity_name=commodity_name_en,
                raw_min=r_low,
                raw_max=r_high,
                historical_avg=hist_avg,
                unit=unit_name_en
            )

            # Check previous price to calculate movement
            prev_price = hist_avg if hist_avg else val_result.sanitized_avg
            price_change = round(val_result.sanitized_avg - prev_price, 2)
            pct_change = round((price_change / prev_price) * 100, 1) if prev_price > 0 else 0.0

            if price_change > 0:
                movement = "up"
            elif price_change < 0:
                movement = "down"
            else:
                movement = "stable"

            # Parse report date
            report_date_str = record.get("report_date", datetime.now().strftime("%Y-%m-%d"))

            processed_item = {
                "commodity_id": cid,
                "commodity_name_bn": commodity_name_bn,
                "commodity_name_en": commodity_name_en,
                "category_bn": category_bn,
                "category_en": category_en,
                "district_en": record.get("district_name_en", target_district),
                "district_bn": self._translate_district(record.get("district_name_en", target_district)),
                "retail": {
                    "min_price": val_result.sanitized_min,
                    "max_price": val_result.sanitized_max,
                    "avg_price": val_result.sanitized_avg,
                    "unit_en": unit_name_en,
                    "unit_bn": unit_name_bn,
                },
                "wholesale": {
                    "min_price": w_low if w_low > 0 else round(val_result.sanitized_min * 0.88, 2),
                    "max_price": w_high if w_high > 0 else round(val_result.sanitized_max * 0.88, 2),
                    "avg_price": round((w_low + w_high) / 2.0, 2) if (w_low > 0 and w_high > 0) else round(val_result.sanitized_avg * 0.88, 2),
                    "unit_en": unit_name_en,
                    "unit_bn": unit_name_bn,
                },
                "anomaly_status": val_result.anomaly_status,
                "anomaly_reasons": val_result.reasons,
                "price_change": abs(price_change),
                "movement": movement,
                "pct_change": pct_change,
                "source": {
                    "code": "DAM_MOA",
                    "name_bn": "কৃষি বিপণন অধিদপ্তর (DAM)",
                    "name_en": "Dept. of Agricultural Marketing (DAM)",
                    "trust_level": "official_gov",
                    "verified": True
                },
                "report_date": report_date_str,
                "collected_at": datetime.now().isoformat()
            }

            processed_records.append(processed_item)

        return processed_records

    def _translate_district(self, district_en: str) -> str:
        dist_map = {
            "Dhaka": "ঢাকা",
            "Chattogram": "চট্টগ্রাম",
            "Rajshahi": "রাজশাহী",
            "Khulna": "খুলনা",
            "Sylhet": "সিলেট",
            "Barishal": "বরিশাল",
            "Rangpur": "রংপুর",
            "Mymensingh": "ময়মনসিংহ",
            "Bogura": "বগুড়া",
            "Cumilla": "কুমিল্লা"
        }
        return dist_map.get(district_en, district_en)

    def generate_synthetic_daily_report(self, district: str = "Dhaka") -> List[Dict[str, Any]]:
        """
        Provides realistic daily market price reports structured exactly as returned by MOA / DAM.
        Includes typical real-world prices and realistic variations.
        """
        today_str = date.today().strftime("%Y-%m-%d")

        # District specific price skew factor
        skew_factors = {
            "Dhaka": 1.0,
            "Chattogram": 1.04,
            "Rajshahi": 0.92,
            "Khulna": 0.94,
            "Sylhet": 1.06,
            "Barishal": 0.96,
            "Rangpur": 0.90,
            "Bogura": 0.89,
        }
        factor = skew_factors.get(district, 1.0)

        raw_feed = [
            {"commodity_id": 1, "unit_retail": 1, "unit_wholesale": 5, "r_lowestPrice": round(50 * factor), "r_highestPrice": round(54 * factor), "w_lowestPrice": round(46 * factor), "w_highestPrice": round(49 * factor), "report_date": today_str, "district_name_en": district},
            {"commodity_id": 2, "unit_retail": 1, "unit_wholesale": 5, "r_lowestPrice": round(60 * factor), "r_highestPrice": round(65 * factor), "w_lowestPrice": round(56 * factor), "w_highestPrice": round(59 * factor), "report_date": today_str, "district_name_en": district},
            {"commodity_id": 3, "unit_retail": 1, "unit_wholesale": 5, "r_lowestPrice": round(75 * factor), "r_highestPrice": round(82 * factor), "w_lowestPrice": round(70 * factor), "w_highestPrice": round(74 * factor), "report_date": today_str, "district_name_en": district},
            {"commodity_id": 4, "unit_retail": 1, "unit_wholesale": 5, "r_lowestPrice": round(42 * factor), "r_highestPrice": round(48 * factor), "w_lowestPrice": round(38 * factor), "w_highestPrice": round(41 * factor), "report_date": today_str, "district_name_en": district},
            {"commodity_id": 6, "unit_retail": 1, "unit_wholesale": 5, "r_lowestPrice": round(130 * factor), "r_highestPrice": round(140 * factor), "w_lowestPrice": round(122 * factor), "w_highestPrice": round(128 * factor), "report_date": today_str, "district_name_en": district},
            {"commodity_id": 9, "unit_retail": 1, "unit_wholesale": 5, "r_lowestPrice": round(162 * factor), "r_highestPrice": round(168 * factor), "w_lowestPrice": round(154 * factor), "w_highestPrice": round(158 * factor), "report_date": today_str, "district_name_en": district},
            {"commodity_id": 10, "unit_retail": 6, "unit_wholesale": 6, "r_lowestPrice": 175, "r_highestPrice": 175, "w_lowestPrice": 168, "w_highestPrice": 170, "report_date": today_str, "district_name_en": district},
            {"commodity_id": 13, "unit_retail": 1, "unit_wholesale": 5, "r_lowestPrice": round(52 * factor), "r_highestPrice": round(58 * factor), "w_lowestPrice": round(46 * factor), "w_highestPrice": round(50 * factor), "report_date": today_str, "district_name_en": district},
            {"commodity_id": 14, "unit_retail": 1, "unit_wholesale": 5, "r_lowestPrice": round(110 * factor), "r_highestPrice": round(120 * factor), "w_lowestPrice": round(98 * factor), "w_highestPrice": round(105 * factor), "report_date": today_str, "district_name_en": district},
            {"commodity_id": 15, "unit_retail": 1, "unit_wholesale": 5, "r_lowestPrice": round(90 * factor), "r_highestPrice": round(100 * factor), "w_lowestPrice": round(82 * factor), "w_highestPrice": round(88 * factor), "report_date": today_str, "district_name_en": district},
            {"commodity_id": 16, "unit_retail": 1, "unit_wholesale": 5, "r_lowestPrice": round(200 * factor), "r_highestPrice": round(220 * factor), "w_lowestPrice": round(185 * factor), "w_highestPrice": round(195 * factor), "report_date": today_str, "district_name_en": district},
            {"commodity_id": 18, "unit_retail": 1, "unit_wholesale": 5, "r_lowestPrice": round(250 * factor), "r_highestPrice": round(270 * factor), "w_lowestPrice": round(230 * factor), "w_highestPrice": round(245 * factor), "report_date": today_str, "district_name_en": district},
            {"commodity_id": 19, "unit_retail": 1, "unit_wholesale": 5, "r_lowestPrice": round(170 * factor), "r_highestPrice": round(190 * factor), "w_lowestPrice": round(145 * factor), "w_highestPrice": round(160 * factor), "report_date": today_str, "district_name_en": district},
            {"commodity_id": 20, "unit_retail": 1, "unit_wholesale": 5, "r_lowestPrice": round(65 * factor), "r_highestPrice": round(75 * factor), "w_lowestPrice": round(52 * factor), "w_highestPrice": round(60 * factor), "report_date": today_str, "district_name_en": district},
            {"commodity_id": 21, "unit_retail": 1, "unit_wholesale": 5, "r_lowestPrice": round(60 * factor), "r_highestPrice": round(70 * factor), "w_lowestPrice": round(48 * factor), "w_highestPrice": round(55 * factor), "report_date": today_str, "district_name_en": district},
            {"commodity_id": 22, "unit_retail": 1, "unit_wholesale": 5, "r_lowestPrice": round(180 * factor), "r_highestPrice": round(190 * factor), "w_lowestPrice": round(165 * factor), "w_highestPrice": round(172 * factor), "report_date": today_str, "district_name_en": district},
            {"commodity_id": 23, "unit_retail": 1, "unit_wholesale": 5, "r_lowestPrice": round(280 * factor), "r_highestPrice": round(300 * factor), "w_lowestPrice": round(260 * factor), "w_highestPrice": round(272 * factor), "report_date": today_str, "district_name_en": district},
            {"commodity_id": 24, "unit_retail": 1, "unit_wholesale": 5, "r_lowestPrice": 750, "r_highestPrice": 780, "w_lowestPrice": 710, "w_highestPrice": 730, "report_date": today_str, "district_name_en": district},
            {"commodity_id": 25, "unit_retail": 1, "unit_wholesale": 5, "r_lowestPrice": 1050, "r_highestPrice": 1150, "w_lowestPrice": 1000, "w_highestPrice": 1050, "report_date": today_str, "district_name_en": district},
            {"commodity_id": 26, "unit_retail": 7, "unit_wholesale": 7, "r_lowestPrice": round(50 * factor), "r_highestPrice": round(54 * factor), "w_lowestPrice": round(46 * factor), "w_highestPrice": round(48 * factor), "report_date": today_str, "district_name_en": district},
            {"commodity_id": 27, "unit_retail": 1, "unit_wholesale": 5, "r_lowestPrice": round(1350 * factor), "r_highestPrice": round(1500 * factor), "w_lowestPrice": round(1200 * factor), "w_highestPrice": round(1300 * factor), "report_date": today_str, "district_name_en": district},
            {"commodity_id": 28, "unit_retail": 1, "unit_wholesale": 5, "r_lowestPrice": round(360 * factor), "r_highestPrice": round(400 * factor), "w_lowestPrice": round(320 * factor), "w_highestPrice": round(345 * factor), "report_date": today_str, "district_name_en": district},
            {"commodity_id": 29, "unit_retail": 1, "unit_wholesale": 5, "r_lowestPrice": round(132 * factor), "r_highestPrice": round(138 * factor), "w_lowestPrice": round(126 * factor), "w_highestPrice": round(130 * factor), "report_date": today_str, "district_name_en": district},
            {"commodity_id": 30, "unit_retail": 1, "unit_wholesale": 5, "r_lowestPrice": 40, "r_highestPrice": 45, "w_lowestPrice": 35, "w_highestPrice": 38, "report_date": today_str, "district_name_en": district}
        ]

        return raw_feed


if __name__ == "__main__":
    connector = DAMConnector()
    raw = connector.generate_synthetic_daily_report("Dhaka")
    validated = connector.parse_and_validate_report(raw, "Dhaka")
    print(f"Successfully processed {len(validated)} market items for Dhaka.")
    print(json.dumps(validated[0], ensure_ascii=False, indent=2))

"""
DaamBD - Pipeline Verification Suite
Tests the complete ingestion, mapping, relational resolution, and anomaly validation logic.
"""

import sys
import os
import json

# Ensure parent directory is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

from backend.connectors.dam_connector import DAMConnector
from backend.services.price_validator import PriceValidator, PriceValidationResult


def test_validator_bounds():
    print("🧪 Testing PriceValidator: Basic Bounds & Sanity...")
    
    # 1. Valid bounds
    res1 = PriceValidator.evaluate(1, "Rice", 50.0, 55.0, 52.0)
    assert res1.is_valid is True, "Valid price should pass"
    assert res1.sanitized_min == 50.0
    assert res1.sanitized_max == 55.0
    assert res1.sanitized_avg == 52.5
    assert res1.anomaly_status == "normal"
    print("  ✅ Valid range passed.")

    # 2. Inverted bounds (min > max)
    res2 = PriceValidator.evaluate(1, "Rice", 60.0, 50.0, 55.0)
    assert res2.is_valid is True
    assert res2.sanitized_min == 50.0
    assert res2.sanitized_max == 60.0
    assert any("Inverted bounds" in r for r in res2.reasons)
    print("  ✅ Inverted bounds auto-correction passed.")

    # 3. Negative values
    res3 = PriceValidator.evaluate(1, "Rice", -10.0, 50.0, 50.0)
    assert res3.is_valid is False
    assert res3.anomaly_status == "critical"
    print("  ✅ Negative price rejection passed.")


def test_validator_anomalies():
    print("🧪 Testing PriceValidator: Spike & Drop Anomaly Detection...")

    # 1. Extreme Spike (> 2.5x baseline)
    # Baseline: 50.0, Today: 140.0 - 150.0 (Avg 145.0 = 2.9x)
    res_spike = PriceValidator.evaluate(1, "Coarse Rice", 140.0, 150.0, historical_avg=50.0)
    assert res_spike.is_valid is True
    assert res_spike.anomaly_status == "warning", f"Expected warning, got {res_spike.anomaly_status}"
    assert any("Price spike anomaly" in r for r in res_spike.reasons)
    print(f"  ✅ 2.9x spike successfully flagged as '{res_spike.anomaly_status}': {res_spike.reasons[0]}")

    # 2. Extreme Crash (< 0.35x baseline)
    # Baseline: 100.0, Today: 20.0 - 25.0 (Avg 22.5 = 0.225x)
    res_crash = PriceValidator.evaluate(1, "Onion", 20.0, 25.0, historical_avg=100.0)
    assert res_crash.is_valid is True
    assert res_crash.anomaly_status == "warning"
    assert any("Price crash anomaly" in r for r in res_crash.reasons)
    print(f"  ✅ 0.225x crash successfully flagged as '{res_crash.anomaly_status}': {res_crash.reasons[0]}")


def test_connector_ingestion():
    print("🧪 Testing DAMConnector: Relational Mapping & Report Parsing...")

    connector = DAMConnector()
    assert len(connector.commodities_cache) >= 20, "Should have loaded commodities master"
    assert len(connector.units_cache) >= 8, "Should have loaded units master"

    synthetic_feed = [
        {"commodity_id": 1, "unit_retail": 1, "unit_wholesale": 5, "r_lowestPrice": 52, "r_highestPrice": 56, "w_lowestPrice": 48, "w_highestPrice": 50, "district_name_en": "Dhaka"},
        {"commodity_id": 14, "unit_retail": 1, "unit_wholesale": 5, "r_lowestPrice": 115, "r_highestPrice": 125, "w_lowestPrice": 105, "w_highestPrice": 110, "district_name_en": "Chattogram"},
        # Anomaly case: Green chili extreme spike
        {"commodity_id": 19, "unit_retail": 1, "unit_wholesale": 5, "r_lowestPrice": 550, "r_highestPrice": 600, "w_lowestPrice": 500, "w_highestPrice": 520, "district_name_en": "Sylhet"},
    ]

    processed = connector.parse_and_validate_report(synthetic_feed)
    assert len(processed) == 3

    # Check commodity 1 (Coarse Rice)
    rice = processed[0]
    assert rice["commodity_name_bn"] == "মোটা চাল (স্বর্ণা/চায়না)"
    assert rice["retail"]["min_price"] == 52.0
    assert rice["retail"]["max_price"] == 56.0
    assert rice["retail"]["unit_bn"] == "কেজি"
    assert rice["source"]["name_bn"] == "কৃষি বিপণন অধিদপ্তর (DAM)"
    print(f"  ✅ Relational mapping verified: ID 1 -> '{rice['commodity_name_bn']}' ({rice['commodity_name_en']})")

    # Check commodity 19 (Green Chili Spike)
    chili = processed[2]
    assert chili["anomaly_status"] == "warning"
    print(f"  ✅ Pipeline anomaly propagation verified for {chili['commodity_name_en']}: {chili['anomaly_reasons']}")

    print("\n🎉 ALL BACKEND PIPELINE & VALIDATOR TESTS PASSED!")


if __name__ == "__main__":
    test_validator_bounds()
    test_validator_anomalies()
    test_connector_ingestion()

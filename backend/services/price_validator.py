"""
DaamBD - Price Validator Service
Ensures high data integrity, bounds verification, and anomaly detection for agricultural price feeds.
"""

from typing import Dict, Any, Optional, Tuple, List
from decimal import Decimal
import logging

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger("PriceValidator")


class PriceValidationResult:
    def __init__(
        self,
        is_valid: bool,
        anomaly_status: str,  # 'normal', 'warning', 'critical'
        sanitized_min: float,
        sanitized_max: float,
        sanitized_avg: float,
        reasons: List[str]
    ):
        self.is_valid = is_valid
        self.anomaly_status = anomaly_status
        self.sanitized_min = sanitized_min
        self.sanitized_max = sanitized_max
        self.sanitized_avg = sanitized_avg
        self.reasons = reasons

    def to_dict(self) -> Dict[str, Any]:
        return {
            "is_valid": self.is_valid,
            "anomaly_status": self.anomaly_status,
            "min_price": self.sanitized_min,
            "max_price": self.sanitized_max,
            "avg_price": self.sanitized_avg,
            "reasons": self.reasons
        }


class PriceValidator:
    """
    Validates daily agricultural prices against logical bounds, unit sanity,
    and historical price trends to eliminate fake or corrupted prices.
    """

    SPIKE_THRESHOLD_MULTIPLIER = 2.5   # > 2.5x historical average = warning
    CRASH_THRESHOLD_MULTIPLIER = 0.35  # < 0.35x historical average = warning
    MAX_ALLOWABLE_PRICE = 50000.0      # Hard ceiling for single unit standard commodities (in BDT)

    @classmethod
    def validate_price_bounds(cls, min_price: float, max_price: float) -> Tuple[bool, float, float, float, List[str]]:
        """
        Validates minimum and maximum price constraints.
        Enforces min_price <= max_price and positive values.
        """
        reasons = []

        try:
            min_val = float(min_price)
            max_val = float(max_price)
        except (ValueError, TypeError):
            return False, 0.0, 0.0, 0.0, ["Non-numeric price value provided."]

        if min_val < 0 or max_val < 0:
            reasons.append("Negative price values are invalid.")
            return False, 0.0, 0.0, 0.0, reasons

        # If min and max are inverted in upstream data, auto-correct but log warning
        if min_val > max_val:
            reasons.append(f"Inverted bounds detected: min ({min_val}) > max ({max_val}). Auto-correcting.")
            min_val, max_val = max_val, min_val

        # If min is 0 but max is valid, fallback min to max
        if min_val == 0 and max_val > 0:
            min_val = max_val
            reasons.append("Zero min_price replaced with max_price.")
        elif max_val == 0 and min_val > 0:
            max_val = min_val
            reasons.append("Zero max_price replaced with min_price.")

        # Compute calculated arithmetic average
        avg_val = round((min_val + max_val) / 2.0, 2)

        if max_val > cls.MAX_ALLOWABLE_PRICE:
            reasons.append(f"Price exceeds maximum allowable ceiling (৳{cls.MAX_ALLOWABLE_PRICE}).")
            return False, min_val, max_val, avg_val, reasons

        return True, min_val, max_val, avg_val, reasons

    @classmethod
    def evaluate(
        cls,
        commodity_id: Any,
        commodity_name: str,
        raw_min: float,
        raw_max: float,
        historical_avg: Optional[float] = None,
        unit: str = "kg"
    ) -> PriceValidationResult:
        """
        Full evaluation pipeline:
        1. Bound sanity check (min <= max, > 0)
        2. Spike & Crash anomaly detection (> 2.5x historical average)
        3. Generates structured PriceValidationResult
        """
        is_valid, min_price, max_price, avg_price, reasons = cls.validate_price_bounds(raw_min, raw_max)

        if not is_valid:
            logger.warning(f"CRITICAL: Invalid price for {commodity_name} (ID: {commodity_id}): {reasons}")
            return PriceValidationResult(
                is_valid=False,
                anomaly_status="critical",
                sanitized_min=min_price,
                sanitized_max=max_price,
                sanitized_avg=avg_price,
                reasons=reasons
            )

        anomaly_status = "normal"

        # Check historical anomaly if baseline is available
        if historical_avg is not None and historical_avg > 0:
            ratio = avg_price / historical_avg

            if ratio >= cls.SPIKE_THRESHOLD_MULTIPLIER:
                anomaly_status = "warning"
                spike_pct = round((ratio - 1.0) * 100, 1)
                msg = (
                    f"Price spike anomaly: Today's avg ৳{avg_price} is {ratio:.2f}x "
                    f"(+{spike_pct}%) of historical avg ৳{historical_avg}."
                )
                reasons.append(msg)
                logger.warning(f"[ANOMALY WARNING] {commodity_name}: {msg}")

            elif ratio <= cls.CRASH_THRESHOLD_MULTIPLIER:
                anomaly_status = "warning"
                drop_pct = round((1.0 - ratio) * 100, 1)
                msg = (
                    f"Price crash anomaly: Today's avg ৳{avg_price} is {ratio:.2f}x "
                    f"(-{drop_pct}%) of historical avg ৳{historical_avg}."
                )
                reasons.append(msg)
                logger.warning(f"[ANOMALY WARNING] {commodity_name}: {msg}")

        return PriceValidationResult(
            is_valid=True,
            anomaly_status=anomaly_status,
            sanitized_min=min_price,
            sanitized_max=max_price,
            sanitized_avg=avg_price,
            reasons=reasons
        )

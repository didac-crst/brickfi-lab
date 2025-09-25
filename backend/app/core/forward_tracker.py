from typing import Optional, List, Dict, Tuple
from app.models.forward_tracker import (
    ForwardPremiumSchedule, 
    ForwardDecisionRules, 
    MarketObservation,
    ForwardDecisionResult,
    PremiumScheduleAnalysis
)


class ForwardRateTracker:
    """Compute forward-loaded rates and return lock/wait signals."""

    def __init__(self, rules: ForwardDecisionRules, schedule: ForwardPremiumSchedule, loan_amount: float):
        if loan_amount <= 0:
            raise ValueError("Loan amount must be positive")
        self.rules = rules
        self.schedule = schedule
        self.loan_amount = loan_amount
        self.observations: List[MarketObservation] = []

    def add_observation(self, obs: MarketObservation) -> None:
        """Store a market/pricing observation."""
        self.observations.append(obs)

    def small_loan_adjustment_bp(self) -> int:
        """Return surcharge in bp if loan is below threshold."""
        if self.loan_amount < self.rules.small_loan_threshold:
            return self.rules.small_loan_surcharge_bp
        return 0

    def apply_small_loan_surcharge(self, rate_pct: float) -> float:
        """Add small-loan surcharge to an all-in rate (percent)."""
        return rate_pct + self.small_loan_adjustment_bp() / 100.0

    def forward_loaded_rate(self, spot_all_in_rate_pct: float, lead_months: int) -> float:
        """Forward-loaded all-in rate (percent) for the chosen lead time."""
        premium_pp = self.schedule.total_premium_pp(lead_months)
        fwd = spot_all_in_rate_pct + premium_pp
        return self.apply_small_loan_surcharge(fwd)

    def decision(self, spot_10y: float, spot_5y: Optional[float], lead_months: int) -> ForwardDecisionResult:
        """Return decision with reason and diagnostics."""
        fwd_10y = self.forward_loaded_rate(spot_all_in_rate_pct=spot_10y, lead_months=lead_months)
        
        diag: Dict[str, float] = {
            "spot_10y": spot_10y,
            "fwd_10y": fwd_10y,
            "lead_months": float(lead_months),
            "small_loan_surcharge_bp": float(self.small_loan_adjustment_bp()),
            "premium_pp": self.schedule.total_premium_pp(lead_months),
            "lock_10y_le": self.rules.lock_10y_le,
            "lock_10y_alt": self.rules.lock_10y_alt,
            "min_5y_discount_bp": float(self.rules.min_5y_discount_bp),
        }

        if fwd_10y <= self.rules.lock_10y_le:
            return ForwardDecisionResult(
                decision="LOCK_10Y",
                reason=f"Forward-loaded 10y {fwd_10y:.2f}% ≤ {self.rules.lock_10y_le:.2f}% trigger.",
                forward_10y_rate=fwd_10y,
                diagnostics=diag
            )

        if fwd_10y <= self.rules.lock_10y_alt:
            return ForwardDecisionResult(
                decision="LOCK_10Y",
                reason=f"Forward-loaded 10y {fwd_10y:.2f}% ≤ {self.rules.lock_10y_alt:.2f}% (alt trigger).",
                forward_10y_rate=fwd_10y,
                diagnostics=diag
            )

        if spot_5y is not None:
            discount_bp = (fwd_10y - spot_5y) * 100.0
            diag["spot_5y"] = spot_5y
            diag["discount_5y_bp"] = discount_bp
            if discount_bp >= self.rules.min_5y_discount_bp:
                return ForwardDecisionResult(
                    decision="TAKE_5Y",
                    reason=f"5y cheaper by {discount_bp:.0f} bp (≥ {self.rules.min_5y_discount_bp} bp).",
                    forward_10y_rate=fwd_10y,
                    diagnostics=diag
                )

        return ForwardDecisionResult(
            decision="WAIT",
            reason="Forward-loaded 10y above triggers and 5y not cheap enough. Keep monitoring.",
            forward_10y_rate=fwd_10y,
            diagnostics=diag
        )

    def analyze_premium_schedule(self, spot_10y: float, spot_5y: Optional[float], max_months: int = 36) -> PremiumScheduleAnalysis:
        """Analyze premium schedule over time to show decision points."""
        months = list(range(1, max_months + 1, 3))  # Every 3 months
        premiums = []
        forward_rates = []
        decisions = []
        
        for month in months:
            premium = self.schedule.total_premium_pp(month)
            forward_rate = self.forward_loaded_rate(spot_10y, month)
            decision_result = self.decision(spot_10y, spot_5y, month)
            
            premiums.append(premium)
            forward_rates.append(forward_rate)
            decisions.append(decision_result.decision)
        
        return PremiumScheduleAnalysis(
            months=months,
            premiums=premiums,
            forward_rates=forward_rates,
            decisions=decisions
        )

    @staticmethod
    def estimate_small_loan_trick_gain(
        offer_small_rate: float,
        offer_big_rate: float,
        base_amount: float,
        uplift_amount: float,
        years_horizon: int = 10,
    ) -> Dict[str, float]:
        """Estimate interest savings for '€150k then immediate Sondertilgung' tactic."""
        small_rate = offer_small_rate / 100.0
        big_rate = offer_big_rate / 100.0
        interest_small = base_amount * small_rate
        interest_big = base_amount * big_rate
        delta_first_year = interest_small - interest_big
        
        return {
            "interest_year1_small_rate_pct": offer_small_rate,
            "interest_year1_big_rate_pct": offer_big_rate,
            "approx_first_year_saving_eur": delta_first_year,
            "note": "If positive, big-loan-then-prepay may save interest (verify fees & rules).",
        }

    def get_observations_summary(self) -> List[Dict[str, any]]:
        """Get summary of all market observations."""
        return [
            {
                "date": obs.date,
                "eur_swap_5y": obs.eur_swap_5y,
                "eur_swap_10y": obs.eur_swap_10y,
                "quote_5y_all_in": obs.quote_5y_all_in,
                "quote_10y_all_in": obs.quote_10y_all_in,
            }
            for obs in self.observations
        ]

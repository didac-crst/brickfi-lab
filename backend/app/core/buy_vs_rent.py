from typing import Optional, List, Dict
from app.models.buy_vs_rent import BuyVsRentInputs, BuyVsRentSummary, SensitivityResult


class BuyVsRentAnalyzer:
    """Compute core buy-vs-rent metrics with clear economics and minimal assumptions."""

    def __init__(self, inputs: BuyVsRentInputs):
        self.i = inputs
        self._validate()

    def _validate(self) -> None:
        if self.i.down_payment > self.i.price:
            raise ValueError("Down payment cannot exceed property price")

    @property
    def mortgage_amount(self) -> float:
        """Loan amount M = P - D."""
        return self.i.price - self.i.down_payment

    @staticmethod
    def _pmt(principal: float, annual_rate: float, years: int) -> float:
        """Amortizing monthly payment (principal + interest)."""
        r_m = annual_rate / 12.0
        n = 12 * years
        if r_m == 0:
            return principal / n
        return principal * r_m / (1.0 - (1.0 + r_m) ** (-n))

    def monthly_payment(self) -> float:
        """Return standard monthly principal+interest payment."""
        return self._pmt(self.mortgage_amount, self.i.annual_rate, self.i.term_years)

    def owner_monthly_cost_year1(self) -> float:
        """First-year *economic* owner cost (excl. principal)."""
        interest_m1 = self.mortgage_amount * self.i.annual_rate / 12.0
        maintenance = self.i.price * self.i.maintenance_pct_annual / 12.0
        return interest_m1 + self.i.insurance_monthly + self.i.taxe_fonciere_monthly + maintenance

    def annual_saving_vs_rent(self) -> float:
        """Annual rent minus owner cost (positive => owning cheaper in year 1)."""
        owner = self.owner_monthly_cost_year1()
        rent = self.i.monthly_rent + self.i.renter_insurance_monthly
        return (rent - owner) * 12.0

    def break_even_years(self, sell_cost_pct: float = 0.05) -> Optional[float]:
        """Break-even horizon (years) from cash-flow advantage."""
        annual = self.annual_saving_vs_rent()
        if annual <= 0:
            return None
        round_trip = (self.i.fees_pct + sell_cost_pct) * self.i.price
        return round_trip / annual

    def summary(self, sell_cost_pct: float = 0.05) -> BuyVsRentSummary:
        """Key outputs for dashboards/LLMs."""
        monthly_rent_total = self.i.monthly_rent + self.i.renter_insurance_monthly
        owner_cost_month1 = self.owner_monthly_cost_year1()
        
        return BuyVsRentSummary(
            mortgage_amount=self.mortgage_amount,
            monthly_PI=self.monthly_payment(),
            owner_cost_month1=owner_cost_month1,
            annual_saving_vs_rent=self.annual_saving_vs_rent(),
            break_even_years=self.break_even_years(sell_cost_pct),
            monthly_rent_total=monthly_rent_total,
            owner_vs_rent_monthly=monthly_rent_total - owner_cost_month1
        )

    def sensitivity(
        self,
        rates: List[float],
        rents: List[float],
        sell_cost_pct: float = 0.05,
    ) -> List[SensitivityResult]:
        """Tabulate sensitivity across interest rates and rent levels."""
        results = []
        base = self.i
        
        for r in rates:
            for rent in rents:
                # Create temporary inputs with modified rate and rent
                temp_inputs = BuyVsRentInputs(
                    price=base.price,
                    fees_pct=base.fees_pct,
                    down_payment=base.down_payment,
                    annual_rate=r,
                    term_years=base.term_years,
                    monthly_rent=rent,
                    taxe_fonciere_monthly=base.taxe_fonciere_monthly,
                    insurance_monthly=base.insurance_monthly,
                    maintenance_pct_annual=base.maintenance_pct_annual,
                    renter_insurance_monthly=base.renter_insurance_monthly,
                )
                
                temp_analyzer = BuyVsRentAnalyzer(temp_inputs)
                
                results.append(SensitivityResult(
                    rate=r,
                    rent=rent,
                    owner_cost_m1=temp_analyzer.owner_monthly_cost_year1(),
                    annual_saving=temp_analyzer.annual_saving_vs_rent(),
                    break_even_years=temp_analyzer.break_even_years(sell_cost_pct)
                ))
        
        return results

    def monthly_cash_flow_analysis(self, months: int = 60) -> List[Dict[str, float]]:
        """Generate monthly cash flow analysis for the first N months."""
        results = []
        monthly_pi = self.monthly_payment()
        owner_cost = self.owner_monthly_cost_year1()
        rent_cost = self.i.monthly_rent + self.i.renter_insurance_monthly
        
        for month in range(1, months + 1):
            # Calculate remaining principal (simplified)
            remaining_principal = self.mortgage_amount
            monthly_rate = self.i.annual_rate / 12.0
            
            # Approximate remaining principal after N months
            if monthly_rate > 0:
                remaining_principal = self.mortgage_amount * (
                    (1 + monthly_rate) ** (12 * self.i.term_years) - 
                    (1 + monthly_rate) ** month
                ) / (
                    (1 + monthly_rate) ** (12 * self.i.term_years) - 1
                )
            
            interest_payment = remaining_principal * monthly_rate
            principal_payment = monthly_pi - interest_payment
            
            results.append({
                "month": month,
                "total_payment": monthly_pi,
                "interest_payment": interest_payment,
                "principal_payment": principal_payment,
                "owner_cost": owner_cost,
                "rent_cost": rent_cost,
                "savings_vs_rent": rent_cost - owner_cost,
                "cumulative_savings": sum(r["savings_vs_rent"] for r in results) + (rent_cost - owner_cost)
            })
        
        return results

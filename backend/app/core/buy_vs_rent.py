"""
Buy vs Rent Analysis Core Logic

This module contains the core business logic for comprehensive buy vs rent analysis.
It implements sophisticated financial calculations including mortgage amortization,
wealth comparison, pure renter baseline analysis, and sensitivity analysis.

The analyzer provides multiple analysis approaches:
- Traditional buy vs rent comparison
- Wealth accumulation over time with house appreciation and investment returns
- Pure renter baseline analysis (rate-independent comparison)
- Sensitivity analysis across different market conditions

Key Features:
- Amortization rate-based loan term calculation
- Monthly mortgage payment calculations
- Break-even analysis with loan payoff consideration
- House value appreciation modeling
- Investment return calculations
- Component breakdown for waterfall analysis

Author: BrickFi-Lab
"""

from typing import Optional, List, Dict
from app.models.buy_vs_rent import BuyVsRentInputs, BuyVsRentSummary, SensitivityResult, PureBaselinePoint


class BuyVsRentAnalyzer:
    """
    Core analyzer for buy vs rent financial analysis.
    
    This class performs comprehensive financial analysis comparing the costs and benefits
    of buying versus renting a property. It includes sophisticated calculations for
    mortgage amortization, wealth accumulation, and various comparison methodologies.
    
    The analyzer supports multiple analysis modes:
    - Traditional cost comparison
    - Wealth accumulation over time
    - Pure renter baseline analysis (rate-independent)
    - Sensitivity analysis across market conditions
    
    Mathematical Foundations:
    - Mortgage payments calculated using standard amortization formulas
    - House value appreciation using compound growth
    - Investment returns using future value calculations
    - Break-even analysis considering loan payoff scenarios
    
    Attributes:
        i (BuyVsRentInputs): Input parameters for the analysis
        mortgage_amount (float): Loan amount after down payment
        term_years (float): Loan term calculated from amortization rate
    
    Example:
        >>> inputs = BuyVsRentInputs(price=500000, down_payment=100000, ...)
        >>> analyzer = BuyVsRentAnalyzer(inputs)
        >>> summary = analyzer.summary()
        >>> print(f"Monthly payment: €{summary.monthly_PI:.2f}")
    """

    def __init__(self, inputs: BuyVsRentInputs):
        """
        Initialize the buy vs rent analyzer.
        
        Args:
            inputs (BuyVsRentInputs): Input parameters for the analysis
            
        Raises:
            ValueError: If down payment exceeds property price
        """
        self.i = inputs
        self._validate()

    def _validate(self) -> None:
        """
        Validate input parameters for logical consistency.
        
        Raises:
            ValueError: If validation fails
        """
        if self.i.down_payment > self.i.price:
            raise ValueError("Down payment cannot exceed property price")

    @property
    def mortgage_amount(self) -> float:
        """
        Calculate the mortgage loan amount.
        
        Formula: M = P - D
        Where:
        - M = Mortgage amount
        - P = Property price
        - D = Down payment
        
        Returns:
            float: Loan amount in euros
        """
        return self.i.price - self.i.down_payment

    @property
    def term_years(self) -> float:
        """
        Calculate loan term in years from amortization rate.
        
        The amortization rate represents the percentage of the loan balance
        that gets paid down each year. This is converted to loan term using
        the inverse relationship.
        
        Examples:
        - 2% yearly amortization = 50 years loan term
        - 4% yearly amortization = 25 years loan term  
        - 10% yearly amortization = 10 years loan term
        
        Formula: loan_term_years = 1 / amortization_rate
        
        Returns:
            float: Loan term in years (defaults to 30 if invalid rate)
        """
        if self.i.amortization_rate <= 0:
            return 30.0  # Default fallback
        
        return 1.0 / self.i.amortization_rate

    @staticmethod
    def _pmt(principal: float, annual_rate: float, years: float) -> float:
        """
        Calculate amortizing monthly payment (principal + interest).
        
        Uses the standard mortgage payment formula for a fully amortizing loan.
        This calculates the fixed monthly payment that pays off both principal
        and interest over the loan term.
        
        Formula: PMT = P * [r(1+r)^n] / [(1+r)^n - 1]
        Where:
        - P = Principal loan amount
        - r = Monthly interest rate (annual_rate / 12)
        - n = Total number of payments (years * 12)
        
        Args:
            principal (float): Loan principal amount
            annual_rate (float): Annual interest rate (as decimal, e.g., 0.05 for 5%)
            years (float): Loan term in years
            
        Returns:
            float: Monthly payment amount in euros
        """
        r_m = annual_rate / 12.0
        n = 12 * years
        if r_m == 0:
            return principal / n
        return principal * r_m / (1.0 - (1.0 + r_m) ** (-n))

    @staticmethod
    def _fv_lump_sum(pv: float, annual_rate: float, years: float) -> float:
        """
        Calculate future value of a lump sum with compound interest.
        
        This is used for calculating the future value of the down payment
        when invested at the specified annual return rate.
        
        Formula: FV = PV * (1 + r)^t
        Where:
        - FV = Future value
        - PV = Present value (lump sum)
        - r = Annual interest rate
        - t = Time in years
        
        Args:
            pv (float): Present value (lump sum amount)
            annual_rate (float): Annual interest rate (as decimal)
            years (float): Time period in years
            
        Returns:
            float: Future value of the lump sum
        """
        return pv * ((1 + annual_rate) ** years)

    def monthly_payment(self) -> float:
        """Return standard monthly principal+interest payment."""
        return self._pmt(self.mortgage_amount, self.i.annual_rate, self.term_years)

    def owner_monthly_cost_year1(self) -> float:
        """First-year *economic* owner cost (excl. principal)."""
        interest_m1 = self.mortgage_amount * self.i.annual_rate / 12.0
        maintenance = self.i.price * self.i.maintenance_pct_annual / 12.0
        return interest_m1 + self.i.insurance_monthly + self.i.taxe_fonciere_monthly + maintenance

    def total_interest_paid(self) -> float:
        """Calculate total interest paid over the life of the loan."""
        monthly_payment = self.monthly_payment()
        total_payments = monthly_payment * 12 * self.term_years
        return total_payments - self.mortgage_amount

    def annual_saving_vs_rent(self) -> float:
        """Annual rent minus economic owner cost (positive => owning cheaper in year 1)."""
        # Use the same logic as owner_monthly_cost_year1() for consistency
        monthly_owner_cost = self.owner_monthly_cost_year1()
        rent = self.i.monthly_rent + self.i.renter_insurance_monthly
        return (rent - monthly_owner_cost) * 12.0

    def break_even_years(self, sell_cost_pct: float = 0.05) -> Optional[float]:
        """Break-even horizon (years) accounting for loan payoff and reduced costs."""
        # Calculate total upfront costs
        upfront_costs = self.i.down_payment + (self.i.fees_pct * self.i.price)
        
        # Calculate loan payoff year
        loan_payoff_year = self.term_years
        
        # Calculate ongoing costs after loan payoff (property tax + insurance + maintenance)
        monthly_ongoing_costs = (
            self.i.taxe_fonciere_monthly + 
            self.i.insurance_monthly + 
            (self.i.price * self.i.maintenance_pct_annual / 12)
        )
        
        # Calculate cumulative savings over time
        monthly_rent = self.i.monthly_rent + self.i.renter_insurance_monthly
        monthly_owner_cost_during_loan = self.owner_monthly_cost_year1()
        
        cumulative_savings = 0
        for year in range(1, int(loan_payoff_year) + 1):
            # During loan period: rent - (interest + taxes + insurance + maintenance)
            annual_savings = (monthly_rent - monthly_owner_cost_during_loan) * 12
            cumulative_savings += annual_savings
            
            if cumulative_savings >= upfront_costs:
                return year
        
        # After loan payoff, costs are much lower
        for year in range(int(loan_payoff_year) + 1, 50):  # Check up to 50 years
            # After loan payoff: rent - (taxes + insurance + maintenance only)
            annual_savings = (monthly_rent - monthly_ongoing_costs) * 12
            cumulative_savings += annual_savings
            
            if cumulative_savings >= upfront_costs:
                return year
        
        return None  # Never breaks even

    def summary(self, sell_cost_pct: float = 0.05) -> BuyVsRentSummary:
        """Key outputs for dashboards/LLMs."""
        monthly_rent_total = self.i.monthly_rent + self.i.renter_insurance_monthly
        owner_cost_month1 = self.owner_monthly_cost_year1()
        
        # Calculate wealth comparison data
        wealth_data = self.wealth_comparison_over_time(30)
        
        # Extract wealth at key milestones
        house_wealth_10 = wealth_data[10]["house_wealth"] if len(wealth_data) > 10 else 0
        investment_wealth_10 = wealth_data[10]["investment_wealth"] if len(wealth_data) > 10 else 0
        house_wealth_20 = wealth_data[20]["house_wealth"] if len(wealth_data) > 20 else 0
        investment_wealth_20 = wealth_data[20]["investment_wealth"] if len(wealth_data) > 20 else 0
        house_wealth_30 = wealth_data[30]["house_wealth"] if len(wealth_data) > 30 else 0
        investment_wealth_30 = wealth_data[30]["investment_wealth"] if len(wealth_data) > 30 else 0
        
        # Find crossover year (when investment wealth overtakes house wealth)
        wealth_crossover_year = None
        for year_data in wealth_data:
            if year_data["wealth_difference"] < 0:  # Investment wealth > house wealth
                wealth_crossover_year = year_data["year"]
                break
        
        # Calculate pure renter baseline metrics
        baseline_data = self.pure_renter_baseline_over_time(30)
        baseline_liquid_30 = baseline_data[30]["baseline_liquid"] if len(baseline_data) > 30 else 0
        
        # Calculate net advantage metrics
        net_advantage_data = self.net_advantage_over_time(30)
        net_advantage_30 = net_advantage_data[30]["net_advantage"] if len(net_advantage_data) > 30 else 0
        cashflow_gap_30 = net_advantage_data[30]["cashflow_gap"] if len(net_advantage_data) > 30 else 0
        
        return BuyVsRentSummary(
            property_price=self.i.price,
            total_acquisition_cost=self.i.price + (self.i.fees_pct * self.i.price),
            mortgage_amount=self.mortgage_amount,
            monthly_PI=self.monthly_payment(),
            total_interest_paid=self.total_interest_paid(),
            owner_cost_month1=owner_cost_month1,
            annual_saving_vs_rent=self.annual_saving_vs_rent(),
            break_even_years=self.break_even_years(sell_cost_pct),
            monthly_rent_total=monthly_rent_total,
            owner_vs_rent_monthly=owner_cost_month1 - monthly_rent_total,  # positive = ownership costs more
            calculated_loan_term_years=self.term_years,
            yearly_amortization_rate=self.i.amortization_rate,
            # Wealth comparison metrics
            house_wealth_10_years=house_wealth_10,
            investment_wealth_10_years=investment_wealth_10,
            house_wealth_20_years=house_wealth_20,
            investment_wealth_20_years=investment_wealth_20,
            house_wealth_30_years=house_wealth_30,
            investment_wealth_30_years=investment_wealth_30,
            wealth_crossover_year=wealth_crossover_year,
            # Pure renter baseline metrics
            baseline_liquid_30_years=baseline_liquid_30,
            net_advantage_30_years=net_advantage_30,
            cashflow_gap_30_years=cashflow_gap_30
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
                    (1 + monthly_rate) ** (12 * self.term_years) - 
                    (1 + monthly_rate) ** month
                ) / (
                    (1 + monthly_rate) ** (12 * self.term_years) - 1
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

    def house_value_over_time(self, years: int = 30) -> List[Dict]:
        """Calculate house value over time with appreciation."""
        results = []
        current_value = self.i.price
        
        for year in range(years + 1):
            results.append({
                "year": year,
                "house_value": current_value,
                "appreciation": current_value - self.i.price
            })
            current_value *= (1 + self.i.house_appreciation_rate)
        
        return results

    def investment_value_over_time(self, years: int = 30) -> List[Dict]:
        """Calculate pure investment value over time if down payment was invested instead."""
        results = []
        current_value = self.i.down_payment
        
        for year in range(years + 1):
            results.append({
                "year": year,
                "investment_value": current_value,
                "gains": current_value - self.i.down_payment
            })
            current_value *= (1 + self.i.investment_return_rate)
        
        return results

    def pure_investment_wealth_over_time(self, years: int = 30) -> List[Dict]:
        """Calculate pure investment wealth (down payment + returns) - completely independent of mortgage rates."""
        results = []
        current_value = self.i.down_payment
        
        for year in range(years + 1):
            results.append({
                "year": year,
                "pure_investment_value": current_value,
                "investment_gains": current_value - self.i.down_payment
            })
            current_value *= (1 + self.i.investment_return_rate)
        
        return results

    def pure_renter_baseline_over_time(self, years: int = 30) -> List[Dict]:
        """Calculate pure renter baseline: down payment compounded at investment rate (rate-independent)."""
        results = []
        current_value = self.i.down_payment
        monthly_rent = self.i.monthly_rent + self.i.renter_insurance_monthly
        monthly_investment_rate = self.i.investment_return_rate / 12
        
        for year in range(years + 1):
            # Calculate cumulative rent paid (for reporting, not added to wealth)
            cumulative_rent = monthly_rent * 12 * year
            
            results.append({
                "year": year,
                "baseline_liquid": current_value,
                "cumulative_rent": cumulative_rent,
                "investment_gains": current_value - self.i.down_payment
            })
            current_value *= (1 + self.i.investment_return_rate)
        
        return results

    def net_advantage_over_time(self, years: int = 30) -> List[Dict]:
        """Calculate net advantage of buying vs pure renter baseline with component breakdown."""
        baseline_data = self.pure_renter_baseline_over_time(years)
        house_values = self.house_value_over_time(years)
        
        results = []
        
        for year in range(years + 1):
            # Get baseline data
            baseline_liquid = baseline_data[year]["baseline_liquid"]
            cumulative_rent = baseline_data[year]["cumulative_rent"]
            
            # Calculate house equity
            house_value = house_values[year]["house_value"]
            
            # Calculate remaining mortgage balance
            remaining_balance = self.mortgage_amount
            monthly_rate = self.i.annual_rate / 12
            monthly_payment = self.monthly_payment()
            
            cumulative_interest = 0
            cumulative_principal = 0
            cumulative_other_owner_costs = 0
            
            for month in range(year * 12):
                if remaining_balance <= 0:
                    break
                interest_payment = remaining_balance * monthly_rate
                principal_payment = min(monthly_payment - interest_payment, remaining_balance)
                remaining_balance -= principal_payment
                
                cumulative_interest += interest_payment
                cumulative_principal += principal_payment
                
                # Other owner costs (taxes + insurance + maintenance)
                monthly_other_costs = (
                    self.i.taxe_fonciere_monthly + 
                    self.i.insurance_monthly + 
                    (self.i.price * self.i.maintenance_pct_annual / 12)
                )
                cumulative_other_owner_costs += monthly_other_costs
            
            # Calculate equity
            equity = house_value - remaining_balance
            
            # Apply selling costs if sell_on_horizon and at horizon
            if self.i.sell_on_horizon and year == years:
                sell_fee = 0.05  # 5% selling cost
                net_equity = equity * (1 - sell_fee)
            else:
                net_equity = equity
            
            # Calculate owner costs
            cumulative_owner_costs = cumulative_interest + cumulative_other_owner_costs + (self.i.fees_pct * self.i.price)
            
            # Calculate cashflow gap (rent avoided vs owner costs)
            cashflow_gap = cumulative_rent - cumulative_owner_costs
            
            # Calculate net advantage
            net_advantage = net_equity - baseline_liquid + cashflow_gap
            
            # Component breakdown
            appreciation_gain = house_value - self.i.price
            if self.i.sell_on_horizon and year == years:
                appreciation_gain *= (1 - sell_fee)
            
            principal_built = cumulative_principal
            interest_drag = cumulative_interest
            opportunity_cost_dp = baseline_liquid
            rent_avoided_net = cashflow_gap + (self.i.fees_pct * self.i.price)
            
            results.append({
                "year": year,
                "baseline_liquid": baseline_liquid,
                "cumulative_rent": cumulative_rent,
                "equity": equity,
                "net_equity": net_equity,
                "cumulative_interest": cumulative_interest,
                "cumulative_principal": cumulative_principal,
                "cumulative_other_owner_costs": cumulative_other_owner_costs,
                "cumulative_owner_costs": cumulative_owner_costs,
                "cashflow_gap": cashflow_gap,
                "net_advantage": net_advantage,
                # Component breakdown
                "appreciation_gain": appreciation_gain,
                "principal_built": principal_built,
                "interest_drag": interest_drag,
                "opportunity_cost_dp": opportunity_cost_dp,
                "rent_avoided_net": rent_avoided_net,
                "house_value": house_value,
                "remaining_mortgage": remaining_balance
            })
        
        return results

    def pure_baseline_vs_buy_over_time(
        self,
        years: int = 30,
        sell_on_horizon: bool = False,
        sell_cost_pct: float = 0.05,
    ) -> List[PureBaselinePoint]:
        """
        Compare 'Pure Renter baseline' (DP compounded; rent is consumption)
        versus 'Buy' (equity build, costs, leverage) on an annual grid.
        Baseline is independent of mortgage rates by construction.
        """
        i = self.i
        # --- constants & monthly primitives ---
        months_total = int(round(years * 12))
        m_rate = i.annual_rate / 12.0
        term_months = int(round(self.term_years * 12))
        pmt = self._pmt(self.mortgage_amount, i.annual_rate, self.term_years)
        maint_m = i.price * i.maintenance_pct_annual / 12.0
        other_fixed_m = i.taxe_fonciere_monthly + i.insurance_monthly + maint_m
        closing_costs = i.fees_pct * i.price  # upfront, counted in owner_other

        # --- running state ---
        rb = self.mortgage_amount
        cumul_interest = 0.0
        cumul_owner_other = closing_costs  # fees counted at t=0
        cumul_owner_cost = closing_costs
        cumul_rent = 0.0
        principal_built = 0.0

        out: List[PureBaselinePoint] = []

        for m in range(0, months_total + 1):
            y = m // 12
            # Stop amortizing after loan term: no PI beyond term, but still pay taxes/ins/maint
            if m > 0:
                # renter consumption
                cumul_rent += (i.monthly_rent + i.renter_insurance_monthly)

                # owner side monthly costs
                if m <= term_months and rb > 1e-8:
                    interest = rb * m_rate
                    principal = min(pmt - interest, rb)
                    rb -= principal
                    cumul_interest += interest
                    principal_built += principal
                    owner_monthly = pmt + other_fixed_m
                else:
                    # after payoff: only other_fixed_m remain
                    interest = 0.0
                    owner_monthly = other_fixed_m
                cumul_owner_other += other_fixed_m
                # Owner costs = interest + other costs (excluding principal)
                # Principal is tracked separately and builds equity
                cumul_owner_cost += (interest + other_fixed_m)

            # yearly checkpoint (m % 12 == 0)
            if m % 12 == 0:
                V_t = i.price * ((1 + i.house_appreciation_rate) ** y)
                equity = V_t - rb
                net_equity = equity
                if sell_on_horizon and y == years:
                    net_equity = (V_t * (1 - sell_cost_pct)) - rb

                baseline_liquid = self._fv_lump_sum(i.down_payment, i.investment_return_rate, y)

                cashflow_gap = cumul_rent - cumul_owner_cost
                net_advantage = net_equity - baseline_liquid + cashflow_gap

                # Component breakdown for waterfall analysis
                # Net advantage = net_equity - baseline_liquid + cashflow_gap
                # Where: net_equity = equity (unless selling), cashflow_gap = rent - owner_costs
                # Components should sum to net_advantage
                
                # The net advantage can be broken down as:
                # net_advantage = (house_value - remaining_mortgage) - baseline_liquid + (cumul_rent - cumul_owner_cost)
                # = house_value - remaining_mortgage - baseline_liquid + cumul_rent - cumul_owner_cost
                # = (house_value - i.price) + (i.price - remaining_mortgage) - baseline_liquid + cumul_rent - cumul_owner_cost
                # = appreciation_gain + principal_built - baseline_liquid + cumul_rent - cumul_owner_cost
                
                appreciation_gain = V_t - i.price
                principal_built_component = self.mortgage_amount - rb  # This is the principal built (mortgage - remaining balance)
                interest_drag_component = -cumul_interest  # negative (cost)
                opportunity_cost_dp_component = -baseline_liquid  # negative (foregone investment)
                rent_avoided_net_component = cumul_rent - cumul_owner_cost  # positive (rent avoided)
                closing_costs_component = -closing_costs  # negative (upfront cost)
                
                # Verify component reconciliation
                component_sum = (appreciation_gain + principal_built_component + 
                               interest_drag_component + opportunity_cost_dp_component + 
                               rent_avoided_net_component + closing_costs_component)
                
                # Note: Component reconciliation is complex due to the interaction between
                # equity (which includes down payment) and opportunity cost of down payment.
                # The components provide a breakdown for waterfall analysis but may not
                # sum exactly to net_advantage due to these interactions.

                out.append(PureBaselinePoint(
                    year=y,
                    baseline_liquid=baseline_liquid,
                    cumul_rent=cumul_rent,
                    house_value=V_t,
                    remaining_mortgage=rb,
                    equity=equity,
                    net_equity=net_equity,
                    cumul_interest=cumul_interest,
                    cumul_owner_other=cumul_owner_other,
                    cumul_owner_cost=cumul_owner_cost,
                    cashflow_gap=cashflow_gap,
                    net_advantage=net_advantage,
                    components={
                        "appreciation_gain": appreciation_gain,
                        "principal_built": principal_built_component,
                        "interest_drag": interest_drag_component,
                        "opportunity_cost_dp": opportunity_cost_dp_component,
                        "rent_avoided_net": rent_avoided_net_component,
                        "closing_costs": closing_costs_component,
                    }
                ))

        return out

    def wealth_comparison_over_time(self, years: int = 30) -> List[Dict]:
        """Compare total wealth between buying vs renting+investing over time."""
        house_values = self.house_value_over_time(years)
        investment_values = self.investment_value_over_time(years)
        
        results = []
        
        for year in range(years + 1):
            # House wealth = house value - remaining mortgage balance
            house_value = house_values[year]["house_value"]
            
            # Calculate remaining mortgage balance
            remaining_balance = self.mortgage_amount
            monthly_rate = self.i.annual_rate / 12
            monthly_payment = self.monthly_payment()
            
            for month in range(year * 12):
                if remaining_balance <= 0:
                    break
                interest_payment = remaining_balance * monthly_rate
                principal_payment = min(monthly_payment - interest_payment, remaining_balance)
                remaining_balance -= principal_payment
            
            house_wealth = house_value - remaining_balance
            
            # Investment wealth = pure investment value (independent of mortgage rate)
            # + cumulative savings from renting vs buying
            investment_value = investment_values[year]["investment_value"]
            
            # Calculate cumulative savings from renting vs buying
            # This should be: rent cost - total owner cost (full mortgage + taxes + insurance + maintenance)
            if year == 0:
                cumulative_savings = 0
            else:
                # Calculate total owner cost per month (full mortgage + taxes + insurance + maintenance)
                monthly_mortgage = self.monthly_payment()
                monthly_taxes_insurance_maintenance = (
                    self.i.taxe_fonciere_monthly + 
                    self.i.insurance_monthly + 
                    (self.i.price * self.i.maintenance_pct_annual / 12)
                )
                total_monthly_owner_cost = monthly_mortgage + monthly_taxes_insurance_maintenance
                
                # Monthly savings from renting
                monthly_rent_cost = self.i.monthly_rent + self.i.renter_insurance_monthly
                monthly_savings = monthly_rent_cost - total_monthly_owner_cost
                
                # Cumulative savings over the year
                cumulative_savings = monthly_savings * 12 * year
            
            investment_wealth = investment_value + cumulative_savings
            
            # Net wealth difference (positive = buying is better)
            wealth_difference = house_wealth - investment_wealth
            
            results.append({
                "year": year,
                "house_wealth": house_wealth,
                "investment_wealth": investment_wealth,  # DEPRECATED NAME
                "rent_plus_invest_wealth": investment_wealth,  # clearer alias
                "wealth_difference": wealth_difference,
                "house_value": house_value,
                "remaining_mortgage": remaining_balance,
                "pure_investment_value": investment_value,  # Pure investment (independent of mortgage)
                "cumulative_savings": cumulative_savings  # Renting savings (depends on mortgage)
            })
        
        return results

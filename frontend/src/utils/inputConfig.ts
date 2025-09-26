/**
 * Input configuration utilities for spinner steps and precision
 */

export interface InputStepConfig {
  step: number;
  description: string;
}

export interface InputStepsConfig {
  description: string;
  locale?: string;
  locale_description?: string;
  fields: Record<string, InputStepConfig>;
}

// Default configuration (fallback if config file is not available)
const DEFAULT_CONFIG: InputStepsConfig = {
  description: "Default input configuration",
  locale: "en-US",
  fields: {
    property_price: { step: 10000, description: "Property price in euros" },
    down_payment: { step: 10000, description: "Down payment in euros" },
    monthly_rent: { step: 10, description: "Monthly rent in euros" },
    property_tax_annual: { step: 10, description: "Annual property tax in euros" },
    insurance_annual: { step: 10, description: "Annual insurance in euros" },
    renter_insurance_annual: { step: 10, description: "Annual renter insurance in euros" },
    fees_pct: { step: 0.1, description: "Purchase fees percentage" },
    annual_rate: { step: 0.01, description: "Interest rate percentage" },
    amortization_rate: { step: 0.01, description: "Amortization rate percentage" },
    maintenance_pct_annual: { step: 0.1, description: "Maintenance percentage" },
    house_appreciation_rate: { step: 0.01, description: "House appreciation rate percentage" },
    investment_return_rate: { step: 0.01, description: "Investment return rate percentage" },
    rent_inflation_rate: { step: 0.01, description: "Rent inflation rate percentage" }
  }
};

let configCache: InputStepsConfig | null = null;

/**
 * Get the input configuration for spinner steps
 */
export async function getInputConfig(): Promise<InputStepsConfig> {
  if (configCache) {
    return configCache;
  }

  try {
    const response = await fetch('/shared/config/input-steps.json');
    if (response.ok) {
      const config = await response.json() as InputStepsConfig;
      configCache = config;
      return config;
    }
  } catch (error) {
    console.warn('Failed to load input configuration, using defaults:', error);
  }

  return DEFAULT_CONFIG;
}

/**
 * Get the step value for a specific field
 */
export async function getFieldStep(fieldName: string): Promise<number> {
  const config = await getInputConfig();
  return config.fields[fieldName]?.step ?? 1;
}

/**
 * Get the step value for a specific field (synchronous fallback)
 */
export function getFieldStepSync(fieldName: string): number {
  return DEFAULT_CONFIG.fields[fieldName]?.step ?? 1;
}

/**
 * Get all field configurations
 */
export async function getAllFieldConfigs(): Promise<Record<string, InputStepConfig>> {
  const config = await getInputConfig();
  return config.fields;
}

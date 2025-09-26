import React, { useState } from "react";
import { TextField, TextFieldProps } from "@mui/material";
import { formatCurrency, formatPercent, formatNumber, normalizeInput, parseToNumber } from "../utils/format";

type Kind = "currency" | "percent" | "number";
type Locale = "de-DE" | "fr-FR" | "en-US";

interface NumericInputProps extends Omit<TextFieldProps, 'value' | 'onChange'> {
  kind: Kind;
  value: number;               // internal canonical (e.g., 1234.56 for €; 0.07 for %)
  onChange: (v: number) => void;
  locale?: Locale;
  dp?: number;                 // display decimals (2 for € / 1 for % / as needed)
}

export function NumericInput({ 
  kind, 
  value, 
  onChange, 
  locale = "fr-FR", 
  dp,
  ...textFieldProps 
}: NumericInputProps) {
  const [raw, setRaw] = useState<string>("");      // what the user is typing
  const [focused, setFocused] = useState(false);

  function formatDisplay(v: number): string {
    switch (kind) {
      case "currency": 
        return formatCurrency(v, { locale, dp: dp ?? 2 });
      case "percent":  
        return formatPercent(v, { locale, dp: dp ?? 1 });
      default:         
        return formatNumber(v, { locale, dp: dp ?? 0 });
    }
  }

  function getInputProps() {
    switch (kind) {
      case "currency":
        return {
          startAdornment: '€',
        };
      case "percent":
        return {
          endAdornment: '%',
        };
      default:
        return {};
    }
  }

  return (
    <TextField
      {...textFieldProps}
      type="text"
      inputMode="decimal"
      value={focused ? raw : formatDisplay(value)}
      InputProps={getInputProps()}
      onFocus={() => { 
        setFocused(true); 
        setRaw(String(value)); 
      }}
      onChange={(e) => {
        const s = normalizeInput(e.target.value);
        setRaw(s);
        const parsed = parseToNumber(s);
        if (parsed !== null) onChange(parsed);
      }}
      onBlur={() => {
        // clamp/round to display precision on blur
        const parsed = parseToNumber(normalizeInput(raw));
        if (parsed !== null) onChange(parsed);
        setFocused(false);
      }}
      sx={{
        '& input': {
          fontFeatureSettings: "'tnum' 1", // monospaced digits for alignment
        },
        ...textFieldProps.sx,
      }}
    />
  );
}

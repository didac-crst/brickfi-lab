import React, { useState, useEffect, useRef } from "react";
import { TextField, TextFieldProps } from "@mui/material";
import Decimal from "decimal.js-light";

type Kind = "currency" | "percent" | "number";

interface NumericInputProps extends Omit<TextFieldProps, 'value' | 'onChange'> {
  kind: Kind;
  value: number;               // internal canonical (e.g., 1234.56 for €; 0.07 for %)
  onChange: (v: number) => void;
  dp?: number;                 // decimals to clamp to on blur (2 for €, 1 for %)
  min?: number; 
  max?: number; 
  step?: number;               // enable spinner step
}

export function NumericInput({ 
  kind, 
  value, 
  onChange, 
  dp,
  min,
  max,
  step,
  ...textFieldProps 
}: NumericInputProps) {
  const [local, setLocal] = useState<number>(value);
  const focusedRef = useRef(false);

  // sync from parent only when NOT editing; prevents snap-back
  useEffect(() => {
    if (!focusedRef.current) setLocal(value);
  }, [value]);

  // Determine default step and dp based on kind
  const defaultStep = kind === "percent" ? 0.1 : (kind === "currency" ? 0.01 : 1);
  const defaultDp = kind === "percent" ? 1 : (kind === "currency" ? 2 : 0);
  const finalStep = step ?? defaultStep;
  const finalDp = dp ?? defaultDp;

  // For percent inputs, we need to convert between fraction (internal) and percentage (display)
  const displayValue = kind === "percent" ? 
    new Decimal(local).times(100).toDecimalPlaces(finalDp, Decimal.ROUND_HALF_UP).toNumber() : 
    local;
  const handleChange = (newDisplayValue: number) => {
    const newValue = kind === "percent" ? newDisplayValue / 100 : newDisplayValue;
    setLocal(newValue);
  };

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

  function getInputElementProps() {
    return {
      min,
      max,
      step: finalStep,
    };
  }

  return (
    <TextField
      {...textFieldProps}
      type="number"
      inputMode="decimal"
      value={Number.isFinite(displayValue) ? displayValue : 0}
      InputProps={getInputProps()}
      inputProps={getInputElementProps()}
      onFocus={() => { focusedRef.current = true; }}
      onChange={(e) => {
        const v = parseFloat(e.target.value);
        if (Number.isFinite(v)) handleChange(v);
      }}
      onBlur={() => {
        focusedRef.current = false;
        const rounded = new Decimal(local).toDecimalPlaces(finalDp, Decimal.ROUND_HALF_UP).toNumber();
        setLocal(rounded);
        onChange(rounded); // commit rounded value
      }}
      onWheel={(e) => e.currentTarget.blur()} // avoid accidental scroll-change
      sx={{
        '& input': {
          fontFeatureSettings: "'tnum' 1", // monospaced digits for alignment
        },
        ...textFieldProps.sx,
      }}
    />
  );
}

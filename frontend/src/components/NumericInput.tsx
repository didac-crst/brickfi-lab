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

// Specialized PercentInput using integer basis points for exact precision
interface PercentInputProps {
  /** canonical fraction, e.g. 0.0432 for 4.32% */
  value: number;
  onChange: (fraction: number) => void;
  /** display decimals (2 => basis points, 1 => tenths of a percent) */
  dp?: 1 | 2;
  label?: string;
  minPercent?: number; // in % units, e.g. 0
  maxPercent?: number; // in % units, e.g. 100
  fullWidth?: boolean;
  helperText?: string;
  step?: number; // custom step for spinner (in percentage units)
}

export function PercentInput({
  value,
  onChange,
  dp = 2,
  label = "Percent",
  minPercent,
  maxPercent,
  fullWidth,
  helperText,
  step,
}: PercentInputProps) {
  const factor = dp === 2 ? 100 : 10;           // 2dp => ×100, 1dp => ×10
  const scale = dp === 2 ? 10000 : 1000;        // fraction scale (bps or 0.1%)
  const [bps, setBps] = useState<number>(Math.round(value * scale));
  const focused = useRef(false);

  // Sync from parent only when not focused (prevents snap-back)
  useEffect(() => {
    if (!focused.current) setBps(Math.round(value * scale));
  }, [value, scale]);

  // percent visible to the user
  const displayPercent = (bps / factor).toFixed(dp);

  const commit = (nextPercent: number) => {
    // clamp to dp precision and bounds
    let clamped = nextPercent;
    if (typeof minPercent === "number") clamped = Math.max(minPercent, clamped);
    if (typeof maxPercent === "number") clamped = Math.min(maxPercent, clamped);

    const nextBps = Math.round(clamped * factor); // exact 2 (or 1) decimals
    setBps(nextBps);
    const fraction = nextBps / scale;            // canonical fraction
    onChange(fraction);
  };

  return (
    <TextField
      label={label}
      type="number"
      value={displayPercent}             // string is fine; keeps spinners
      fullWidth={fullWidth}
      helperText={helperText}
      InputProps={{
        endAdornment: '%',
      }}
      onFocus={() => { focused.current = true; }}
      onBlur={() => { focused.current = false; commit(parseFloat(displayPercent)); }}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            // parse user's number; if NaN, don't commit yet—just update display by state
            const n = Number(e.target.value);
            if (Number.isFinite(n)) {
              // update bps live so the field reflects exactly what user typed
              const nextBps = Math.round(n * factor);
              setBps(nextBps);
            }
          }}
      inputProps={{
        step: step ?? (dp === 2 ? 0.01 : 0.1),     // use custom step or default spinner precision
        inputMode: "decimal",
        min: minPercent,
        max: maxPercent,
      }}
      onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
      sx={{
        '& input': {
          fontFeatureSettings: "'tnum' 1", // monospaced digits for alignment
        },
      }}
    />
  );
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
  const [local, setLocal] = useState<number>(value || 0);
  const focusedRef = useRef(false);

  // sync from parent only when NOT editing; prevents snap-back
  useEffect(() => {
    if (!focusedRef.current) setLocal(value || 0);
  }, [value]);

  // Determine default step and dp based on kind
  const defaultStep = kind === "currency" ? 0.01 : 1;
  const defaultDp = kind === "currency" ? 2 : 0;
  const finalStep = step ?? defaultStep;
  const finalDp = dp ?? defaultDp;

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
      type="number" // Keep as number to preserve spinners
      inputMode="decimal"
      value={local || 0} // Use raw number value for spinners
      InputProps={getInputProps()}
      inputProps={getInputElementProps()}
      onFocus={() => { focusedRef.current = true; }}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
        const v = parseFloat(e.target.value);
        if (Number.isFinite(v)) {
          setLocal(v);
        }
      }}
      onBlur={() => {
        focusedRef.current = false;
        const rounded = new Decimal(local || 0).toDecimalPlaces(finalDp, Decimal.ROUND_HALF_UP).toNumber();
        setLocal(rounded);
        onChange(rounded); // commit rounded value
      }}
      onWheel={(e: React.WheelEvent<HTMLInputElement>) => e.currentTarget.blur()} // avoid accidental scroll-change
      sx={{
        '& input': {
          fontFeatureSettings: "'tnum' 1", // monospaced digits for alignment
        },
        ...textFieldProps.sx,
      }}
    />
  );
}

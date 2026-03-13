"use client";

import { useEffect, useState } from "react";

type Operator = "+" | "−" | "×" | "÷" | null;

interface CalcState {
  display: string;
  input: string;
  previousValue: number | null;
  operator: Operator;
  waiting: boolean;
  expression: string;
}

const IOS_ORANGE = "#ff9f0a";
const IOS_DARK = "#1c1c1c";
const IOS_LIGHT_GRAY = "#a5a5a5";
const IOS_DARK_GRAY = "#505050";

const calculate = (a: number, b: number, op: Operator) => {
  switch (op) {
    case "+": return a + b;
    case "−": return a - b;
    case "×": return a * b;
    case "÷": return b === 0 ? NaN : a / b;
    default: return b;
  }
};

export default function CalculatorUI({ onCopy }: { onCopy?: (value: string) => void }) {
  const [state, setState] = useState<CalcState>({
    display: "0",
    input: "0",
    previousValue: null,
    operator: null,
    waiting: false,
    expression: "",
  });

  const handleCopy = () => {
    if (onCopy && state.display !== "Error") {
      // Remove dots and handle cents (keypad uses cents as base)
      const val = Math.round(parseFloat(state.display) * 100).toString();
      onCopy(val);
    }
  };

  const clearAll = () =>
    setState({
      display: "0",
      input: "0",
      previousValue: null,
      operator: null,
      waiting: false,
      expression: "",
    });

  const clearEntry = () =>
    setState(prev => ({
      ...prev,
      display: "0",
      input: "0",
      waiting: false,
    }));

  const inputDigit = (digit: string) => {
    setState(prev => {
      if (prev.waiting) {
        return { ...prev, input: digit, display: digit, waiting: false };
      }

      const next = prev.input === "0" ? digit : prev.input + digit;
      return { ...prev, input: next, display: next };
    });
  };

  const inputDot = () => {
    setState(prev => {
      if (prev.waiting) {
        return { ...prev, input: "0.", display: "0.", waiting: false };
      }
      if (prev.input.includes(".")) return prev;
      const next = prev.input + ".";
      return { ...prev, input: next, display: next };
    });
  };

  const handleOperator = (op: Operator) => {
    setState(prev => {
      const current = Number(prev.input);

      if (prev.operator && prev.previousValue !== null && !prev.waiting) {
        const result = calculate(prev.previousValue, current, prev.operator);
        if (!isFinite(result)) return { ...prev, display: "Error" };

        return {
          ...prev,
          display: String(result),
          input: String(result),
          previousValue: result,
          operator: op,
          waiting: true,
          expression: `${result} ${op}`,
        };
      }

      return {
        ...prev,
        previousValue: current,
        operator: op,
        waiting: true,
        expression: `${prev.input} ${op}`,
      };
    });
  };

  const handleEquals = () => {
    setState(prev => {
      if (!prev.operator || prev.previousValue === null) return prev;

      const result = calculate(
        prev.previousValue,
        Number(prev.input),
        prev.operator
      );

      if (!isFinite(result)) return { ...prev, display: "Error" };

      return {
        display: String(result),
        input: String(result),
        previousValue: null,
        operator: null,
        waiting: true,
        expression: `${prev.expression} ${prev.input} =`,
      };
    });
  };

  const toggleSign = () => {
    setState(prev => {
      const next =
        prev.input.charAt(0) === "-"
          ? prev.input.slice(1)
          : "-" + prev.input;
      return { ...prev, input: next, display: next };
    });
  };

  const percent = () => {
    setState(prev => {
      const next = String(Number(prev.input) / 100);
      return { ...prev, input: next, display: next };
    });
  };

  const acLabel =
    state.input === "0" && !state.operator ? "AC" : "C";

  return (
    <div className="flex items-center justify-center">
      <div className="w-full max-w-md relative">
        <div
          className="rounded-3xl bg-black p-6 sm:p-8 pt-10 sm:pt-12 shadow-2xl border border-white/10"
          style={{ backgroundColor: IOS_DARK }}
        >
          {/* Expression */}
          <div className="text-right text-white/40 text-base sm:text-lg h-6 mb-2 font-medium tracking-wide">
            {state.expression}
          </div>

          {/* Display */}
          <div className="text-right text-white font-light tracking-tight mb-8 leading-none">
            <span
              className="block text-[clamp(3rem,8vw,5.5rem)] transition-all duration-200 overflow-x-scroll no-scrollbar"
              style={{ fontVariantNumeric: "tabular-nums" }}
            >
              {state.display}
            </span>
          </div>

          {/* Keypad */}
          <div className="grid grid-cols-4 gap-4">
            <CalcButton variant="fn" onClick={acLabel === "AC" ? clearAll : clearEntry}>{acLabel}</CalcButton>
            <CalcButton variant="fn" onClick={toggleSign}>±</CalcButton>
            <CalcButton variant="fn" onClick={percent}>%</CalcButton>
            <CalcButton variant="op" active={state.operator === "÷"} onClick={() => handleOperator("÷")}>÷</CalcButton>

            {[7,8,9].map(n => (
              <CalcButton key={n} onClick={() => inputDigit(String(n))}>{n}</CalcButton>
            ))}
            <CalcButton variant="op" active={state.operator === "×"} onClick={() => handleOperator("×")}>×</CalcButton>

            {[4,5,6].map(n => (
              <CalcButton key={n} onClick={() => inputDigit(String(n))}>{n}</CalcButton>
            ))}
            <CalcButton variant="op" active={state.operator === "−"} onClick={() => handleOperator("−")}>−</CalcButton>

            {[1,2,3].map(n => (
              <CalcButton key={n} onClick={() => inputDigit(String(n))}>{n}</CalcButton>
            ))}
            <CalcButton variant="op" active={state.operator === "+"} onClick={() => handleOperator("+")}>+</CalcButton>

            <CalcButton span={2} onClick={() => inputDigit("0")}>0</CalcButton>
            <CalcButton onClick={inputDot}>.</CalcButton>
            <CalcButton variant="op" onClick={handleEquals}>=</CalcButton>
          </div>

          {/* Copy to Register Button */}
          {onCopy && (
            <div className="mt-6">
              <button
                onClick={handleCopy}
                className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg border border-white/20 uppercase tracking-wide"
              >
                Copy to Register
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CalcButton({
  children,
  onClick,
  variant = "num",
  active = false,
  span = 1,
}: {
  children: React.ReactNode;
  onClick: () => void;
  variant?: "num" | "fn" | "op";
  active?: boolean;
  span?: number;
}) {
  const base =
    "flex items-center justify-center select-none font-medium " +
    "transition active:scale-95 duration-75 rounded-md " +
    "text-[clamp(1.5rem,4vw,2.25rem)]";

  const styles = {
    num: {
      backgroundColor: IOS_DARK_GRAY,
      color: "white",
    },
    fn: {
      backgroundColor: IOS_LIGHT_GRAY,
      color: "black",
    },
    op: active
      ? { backgroundColor: "white", color: IOS_ORANGE }
      : { backgroundColor: IOS_ORANGE, color: "white" },
  };

  return (
    <button
      onClick={onClick}
      style={styles[variant]}
      className={`${base} aspect-square ${span === 2 ? "col-span-2 !aspect-auto justify-start pl-8 rounded-md" : ""}`}
    >
      {children}
    </button>
  );
}

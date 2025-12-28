import { useState, useCallback } from "react";
import { formatTelefone, unformatTelefone } from "../utils/telefone";

export function useTelefoneMask() {
  const [displayValue, setDisplayValue] = useState("");

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>, onChange: (value: string) => void) => {
      const rawValue = unformatTelefone(e.target.value);
      const formatted = formatTelefone(e.target.value);

      setDisplayValue(formatted);
      onChange(rawValue);
    },
    []
  );

  const handleBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement>, onBlur: (e: React.FocusEvent<HTMLInputElement>) => void) => {
      onBlur(e);
    },
    []
  );

  return {
    displayValue,
    setDisplayValue,
    handleChange,
    handleBlur,
  };
}

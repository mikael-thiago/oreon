import { useState, useCallback } from "react";
import { formatCpf, unformatCPF } from "../utils/cpf";

export function useCpfMask() {
  const [displayValue, setDisplayValue] = useState("");

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>, onChange: (value: string) => void) => {
      const rawValue = unformatCPF(e.target.value);
      const formatted = formatCpf(e.target.value);

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

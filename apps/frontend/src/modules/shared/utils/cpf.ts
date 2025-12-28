/**
 * Formata um CPF no padrão XXX.XXX.XXX-XX
 * @param cpf - CPF (apenas números)
 * @returns CPF formatado
 */
export function formatCpf(cpf: string): string {
  const numbers = cpf.replace(/\D/g, "");
  const limited = numbers.slice(0, 11);

  if (limited.length <= 3) return limited;
  if (limited.length <= 6) return `${limited.slice(0, 3)}.${limited.slice(3)}`;
  if (limited.length <= 9)
    return `${limited.slice(0, 3)}.${limited.slice(3, 6)}.${limited.slice(6)}`;

  return `${limited.slice(0, 3)}.${limited.slice(3, 6)}.${limited.slice(
    6,
    9
  )}-${limited.slice(9)}`;
}

export function unformatCPF(value: string): string {
  return value.replace(/\D/g, "");
}

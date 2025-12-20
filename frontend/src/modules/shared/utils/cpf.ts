/**
 * Formata um CPF no padrão XXX.XXX.XXX-XX
 * @param cpf - CPF com 11 dígitos (apenas números)
 * @returns CPF formatado
 */
export function formatCpf(cpf: string): string {
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

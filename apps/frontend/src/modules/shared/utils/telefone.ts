/**
 * Formata um telefone no padrão (XX) XXXX-XXXX ou (XX) XXXXX-XXXX
 * @param telefone - Telefone (apenas números)
 * @returns Telefone formatado
 */
export function formatTelefone(telefone: string): string {
  const numbers = telefone.replace(/\D/g, "");
  const limited = numbers.slice(0, 11);

  if (limited.length <= 2) return limited;
  if (limited.length <= 6) return `(${limited.slice(0, 2)}) ${limited.slice(2)}`;

  // Celular (11 dígitos) - (XX) XXXXX-XXXX
  if (limited.length === 11) {
    return `(${limited.slice(0, 2)}) ${limited.slice(2, 7)}-${limited.slice(7)}`;
  }

  // Fixo (10 dígitos) - (XX) XXXX-XXXX
  return `(${limited.slice(0, 2)}) ${limited.slice(2, 6)}-${limited.slice(6)}`;
}

/**
 * Remove a formatação de um telefone
 * @param telefone - Telefone formatado
 * @returns Telefone sem formatação (apenas números)
 */
export function unformatTelefone(telefone: string): string {
  return telefone.replace(/\D/g, "");
}

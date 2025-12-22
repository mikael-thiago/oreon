/**
 * Valida um CPF (Cadastro de Pessoa Física) brasileiro
 * @param cpf - O CPF a ser validado (pode conter ou não formatação)
 * @returns true se o CPF for válido, false caso contrário
 */
export function cpfEhValido(cpf: string): boolean {
  // Remove caracteres não numéricos
  const cpfLimpo = cpf.replace(/\D/g, "");

  // Verifica se tem 11 dígitos
  if (cpfLimpo.length !== 11) {
    return false;
  }

  // Verifica se todos os dígitos são iguais (ex: 111.111.111-11)
  if (/^(\d)\1{10}$/.test(cpfLimpo)) {
    return false;
  }

  // Calcula o primeiro dígito verificador
  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(cpfLimpo.charAt(i)) * (10 - i);
  }
  let resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) {
    resto = 0;
  }
  if (resto !== parseInt(cpfLimpo.charAt(9))) {
    return false;
  }

  // Calcula o segundo dígito verificador
  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(cpfLimpo.charAt(i)) * (11 - i);
  }
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) {
    resto = 0;
  }
  if (resto !== parseInt(cpfLimpo.charAt(10))) {
    return false;
  }

  return true;
}

/**
 * Formata um CPF para o padrão XXX.XXX.XXX-XX
 * @param cpf - O CPF a ser formatado (apenas números)
 * @returns O CPF formatado ou string vazia se inválido
 */
export function formatarCPF(cpf: string): string {
  const cpfLimpo = cpf.replace(/\D/g, "");

  if (cpfLimpo.length !== 11) {
    return "";
  }

  return cpfLimpo.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

/**
 * Remove a formatação de um CPF, mantendo apenas os números
 * @param cpf - O CPF formatado
 * @returns O CPF sem formatação (apenas números)
 */
export function limparCPF(cpf: string): string {
  return cpf.replace(/\D/g, "");
}

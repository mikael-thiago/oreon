export function formatCnpj(cnpj: string): string {
  const apenasDigitos = cnpj.replace(/\D/g, "");

  if (!apenasDigitos || apenasDigitos.length !== 14) {
    return cnpj;
  }

  return apenasDigitos.replace(
    /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
    "$1.$2.$3/$4-$5"
  );
}

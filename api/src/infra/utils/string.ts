const CHARSET = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

export function gerarStringAleatoria(tamanho: number) {
  let result = "";

  for (var i = 0, n = CHARSET.length; i < tamanho; ++i) {
    result += CHARSET.charAt(Math.floor(Math.random() * n));
  }

  return result;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

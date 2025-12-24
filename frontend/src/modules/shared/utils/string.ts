export function titleCase(value: string) {
  const parts = value.split(" ");

  if (parts.length === 0) return "";

  const [firstWord, ...anotherWords] = parts;

  return [
    firstWord[0].toUpperCase() + firstWord.slice(1),
    ...anotherWords,
  ].join(" ");
}

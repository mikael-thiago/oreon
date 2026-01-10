export function estaVazio(arr: Array<unknown>): boolean {
  return arr.length === 0;
}

export function groupBy<Item = unknown, Key extends string | number = string>(arr: Item[], getKey: (item: Item) => Key): Record<Key, Item[]> {
  const result: Record<Key, Item[]> = {} as Record<Key, Item[]>;

  for (const item of arr) {
    const key = getKey(item);

    if (!result[key]) result[key] = [];

    result[key].push(item);
  }

  return result;
}

/**
 * Remove itens duplicados de um array, mantendo apenas o primeiro item de cada chave
 * @param arr Array de itens
 * @param getKey Chave de unicidade
 * @returns Array deduplicado
 */
export function deduplicate<Item = unknown, Key extends string | number = string>(arr: Item[], getKey: (item: Item) => Key): Item[] {
  const existence: Record<Key, boolean> = {} as Record<Key, boolean>;

  const result: Item[] = [];

  for (const item of arr) {
    if (existence[getKey(item)]) continue;

    result.push(item);

    existence[getKey(item)] = true;
  }

  return result;
}
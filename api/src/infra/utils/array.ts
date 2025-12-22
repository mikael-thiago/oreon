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
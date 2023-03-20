/**
 * Gets a random element from the given array.
 * @param items The array to get a random element of.
 * @returns A random element from the array.
 */
export function random<T>(items: T[]): T {
    return items[Math.floor(Math.random() * items.length)]
}

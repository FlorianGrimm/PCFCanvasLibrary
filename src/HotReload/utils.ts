export function getOrAddByKey<K, V>(
    map: Map<K, V>,
    key: K,
    factory: ((key: K) => V),
    update?: ((key: K, value: V) => void)
): [boolean, V] {
    if (map.has(key)) {
        const result = map.get(key);
        if (result !== undefined) {
            if (update) {
                update(key, result);
            }
            return [false, result];
        }
    }
    {
        const result = factory(key);
        map.set(key, result);
        return [true, result];
    }
}

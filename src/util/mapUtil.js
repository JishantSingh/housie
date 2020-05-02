export function createUniqueKey(map) {
    let key;
    do {
        key = Math.ceil(Math.random()*100000);
    }while (map.has(key))
    return key;
}
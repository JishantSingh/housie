export function format(string, replacements) {
    for (let i = 0; i < replacements.length; i++) {
        string = string.replace(`{${i}}`,replacements[i]);
    }
    return string
}
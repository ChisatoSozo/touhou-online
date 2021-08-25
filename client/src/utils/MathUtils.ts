export const modRange = (number: number, max: number, min: number) => {
    return ((number - min) % (max - min)) + min
}
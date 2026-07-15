export const rand = <T,>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)]
export const rint = (min: number, max: number): number => min + Math.floor(Math.random() * (max - min + 1))

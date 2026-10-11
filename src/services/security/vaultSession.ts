type Listener = (unlocked: boolean) => void;
let unlocked = false;
const listeners = new Set<Listener>();
export function isVaultUnlocked(): boolean { return unlocked; }
export function setVaultUnlocked(value: boolean): void { unlocked = value; listeners.forEach((listener) => listener(unlocked)); }
export function subscribeVaultSession(listener: Listener): () => void { listeners.add(listener); return () => listeners.delete(listener); }

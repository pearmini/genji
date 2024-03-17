export function dev(callback) {
  if (import.meta.env.DEV) callback();
}

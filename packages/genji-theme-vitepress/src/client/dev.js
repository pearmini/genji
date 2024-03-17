export function dev(callback, run = true) {
  if (import.meta.env.DEV && run) callback();
}

function isDom(value) {
  return value instanceof HTMLElement || value instanceof SVGElement;
}

export function dom(value) {
  return value;
}

export function auto(value) {
  if (isDom(value)) return dom(value);
  return value;
}

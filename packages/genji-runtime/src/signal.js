import { Subscription } from "./subscription.js";

export default class Signal {
  constructor(callback) {
    this._callback = callback;
  }
  subscribe(next, view) {
    const dispose = this._callback(next, view);
    return new Subscription(dispose);
  }
}

export function now() {
  return new Signal((next) => {
    let frame = requestAnimationFrame(function update() {
      next(Date.now());
      frame = requestAnimationFrame(update);
    });
    next(Date.now());
    return () => cancelAnimationFrame(frame);
  });
}

export function width(element = document.querySelector("main")) {
  if (element === undefined) throw new Error("Element is undefined.");
  return new Signal((next) => {
    let prevWidth;
    const observer = new ResizeObserver(() => {
      const width = element.offsetWidth;
      if (width === prevWidth) return;
      prevWidth = width;
      next(width);
    });
    observer.observe(element);
    next(element.offsetWidth);
    return () => observer.disconnect();
  });
}

export function dark(defaultValue = false) {
  return new Signal((next) => {
    const onDark = (e) => next(e.detail);
    window.addEventListener("dark", onDark);
    next(defaultValue);
    return () => window.removeEventListener("dark", onDark);
  });
}

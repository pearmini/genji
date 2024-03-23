import { Subscription } from "./subscription";

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
    const observer = new ResizeObserver(() => next(element.offsetWidth));
    observer.observe(element);
    next(element.offsetWidth);
    return () => observer.disconnect();
  });
}

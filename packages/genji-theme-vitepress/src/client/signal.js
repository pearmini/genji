import { Subscription } from "./subscription";

export class Signal {
  constructor(callback) {
    this._callback = callback;
  }
  subscribe(next, view) {
    const dispose = this._callback(next, view);
    return new Subscription(dispose);
  }
}

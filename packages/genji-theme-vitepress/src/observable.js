import { Subscription } from "./subscription";

export class Observable {
  constructor(callback) {
    this._callback = callback;
  }
  subscribe(observer) {
    const dispose = this._callback(observer);
    return new Subscription(dispose);
  }
}

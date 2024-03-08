export class Subscription {
  constructor(dispose) {
    this._dispose = dispose;
  }
  unsubscribe() {
    if (this._dispose) this._dispose();
  }
}

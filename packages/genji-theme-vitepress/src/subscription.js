export class Subscription {
  constructor(dispose) {
    this._dispose = dispose;
  }
  unsubscribe() {
    this._dispose();
  }
}

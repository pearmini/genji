export class Module {
  constructor() {
    this._subscriptions = [];
  }
  add(observable, observer) {
    this._subscriptions.push(observable.subscribe(observer));
  }
  dispose() {
    for (const subscription of this._subscriptions) subscription.unsubscribe();
    this._subscriptions = [];
  }
}

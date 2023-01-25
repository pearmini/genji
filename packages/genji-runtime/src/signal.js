import { Observable, combineLatest } from "rxjs";

async function next(subscriber, value, ...deps) {
  try {
    if (deps.length > 0) value = value(...deps);
    if (value instanceof Promise) {
      pending(subscriber);
      const x = await value;
      subscriber.next(x);
    } else if (isGenerator(value)) {
      for (const v of value) next(subscriber, v);
    } else if (isAsyncGenerator(value)) {
      let done = false;
      let v;
      pending(subscriber);
      while (!done) {
        ({ done, value: v } = await value.next());
        next(subscriber, v);
      }
    } else {
      subscriber.next(value);
    }
  } catch (e) {
    subscriber.error?.(e);
  }
}

function pending(subscriber) {
  subscriber.destination.partialObserver.pending?.();
}

function isGenerator(value) {
  return (
    typeof value === "object" &&
    value.__proto__.toString() === "[object Generator]"
  );
}

function isAsyncGenerator(value) {
  return (
    typeof value === "object" &&
    value.__proto__.toString() === "[object AsyncGenerator]"
  );
}

function setComputedValue(value, deps) {
  const sources = deps.map((dep) => dep._observable);
  const input = combineLatest(sources);
  if (this._subscriber) {
    input.subscribe((params) => {
      next(this._subscriber, value, ...params);
    });
    return;
  }
  this._observable = new Observable((subscriber) => {
    this._subscriber = subscriber;
    input.subscribe((params) => {
      next(subscriber, value, ...params);
    });
  });
}

function setConstantValue(value, deps) {
  if (this._subscriber) {
    next(this._subscriber, value);
    return;
  }
  this._observable = new Observable((subscriber) => {
    this._subscriber = subscriber;
    next(subscriber, value);
  });
}

export class Signal {
  constructor(observer) {
    this._observer = observer;
    this._subscription = null;
  }
  set(...params) {
    if (params.length === 1) setConstantValue.call(this, ...params);
    else setComputedValue.call(this, ...params);
    if (this._observer) {
      this._subscription = this._observable.subscribe(this._observer);
    }
    return this;
  }
  dispose() {
    if (this._observer) this._subscription.unsubscribe();
  }
}

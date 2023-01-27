import { test, expect, describe } from "vitest";
import { Signal } from "../src/signal";

function createPromise() {
  let done;
  const promise = new Promise((resolve) => (done = resolve));
  return [promise, done];
}

describe("Signal()", () => {
  test("signal.set(value) should set constant value.", () => {
    const [promise, done] = createPromise();
    const a = new Signal({
      next: (x) => {
        expect(x).toBe(1);
        done();
      },
    });
    a.set(1);
    return promise;
  });

  test("signal.set(promise) should set promise value.", () => {
    const [promise, done] = createPromise();
    const a = new Signal({
      next: (x) => {
        expect(x).toBe(3);
        done();
      },
    });
    a.set(Promise.resolve(3));
    return promise;
  });

  test("signal.set(function) should set function value.", () => {
    const [promise, done] = createPromise();
    const add = (x, y) => x + y;
    const a = new Signal({
      next: (add) => {
        expect(add(1, 1)).toBe(2);
        done();
      },
    });
    a.set(add);
    return promise;
  });

  test("signal.set(generator) should set generator value.", () => {
    const [promise, done] = createPromise();
    const values = [];
    const step = createStep();
    const a = new Signal({
      next: (x) => {
        values.push(x);
        if (values.length === 3) {
          expect(values).toEqual([0, 1, 2]);
          done();
        }
      },
    });
    a.set(step);

    function* createStep(start = 0, end = 3, step = 1) {
      for (let i = start; i < end; i += step) yield i;
    }
    return promise;
  });

  test("signal.set(generator) should set async generator value.", () => {
    const [promise, done] = createPromise();
    const values = [];
    const step = createStep();
    const a = new Signal({
      next: (x) => {
        values.push(x);
        if (values.length === 3) {
          expect(values).toEqual([0, 1, 2]);
          done();
        }
      },
    });
    a.set(step);

    async function* createStep(start = 0, end = 3, step = 1) {
      for (let i = start; i < end; i += step) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        yield i;
      }
    }
    return promise;
  });

  test("signal.set(callback, deps) should set computed value.", () => {
    const [promise, done] = createPromise();
    const a = new Signal().set(1);
    const b = new Signal().set(2);
    const c = new Signal({
      next: (x) => {
        expect(x).toBe(3);
        done();
      },
    });
    c.set((a, b) => a + b, [a, b]);
    return promise;
  });

  test("signal.set(callback, deps) should set nest computed value.", () => {
    const [promise, done] = createPromise();
    const a = new Signal().set(1);
    const b = new Signal().set(2);
    const c = new Signal().set((a, b) => a + b, [a, b]);
    const d = new Signal({
      next: (x) => {
        expect(x).toBe(4);
        done();
      },
    });
    d.set((a, c) => a + c, [a, c]);
    return promise;
  });

  test("signal.set(value) should deliver new value to deps.", () => {
    const [promise, done] = createPromise();
    const values = [];
    const a = new Signal().set(1);
    const b = new Signal().set(2);
    const c = new Signal({
      next: (x) => {
        values.push(x);
        if (values.length === 2) {
          expect(values).toEqual([3, 4]);
          done();
        }
      },
    });
    c.set((a, b) => a + b, [a, b]);
    b.set(3);
    return promise;
  });

  test("signal.set(callback, deps) should deliver new computed value to deps.", () => {
    const [promise, done] = createPromise();
    const values = [];
    const a = new Signal().set(1);
    const b = new Signal().set((a) => a * 2, [a]);
    const c = new Signal({
      next: (x) => {
        values.push(x);
        if (values.length === 2) {
          expect(values).toEqual([4, 6]);
          done();
        }
      },
    });
    c.set((b) => b * 2, [b]);
    b.set((a) => a * 3, [a]);
    return promise;
  });

  test("signal.set(promise) should call observer.pending().", () => {
    const [promise, done] = createPromise();
    const a = new Signal({
      pending: done,
    });
    a.set(new Promise((resolve) => setTimeout(resolve), 100));
    return promise;
  });

  test("signal.set(generator) should  call observer.pending().", () => {
    const [promise, done] = createPromise();
    const step = createStep();
    const a = new Signal({
      pending: done,
    });
    a.set(step);

    async function* createStep(start = 0, end = 3, step = 1) {
      for (let i = start; i < end; i += step) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        yield i;
      }
    }
    return promise;
  });

  test("signal.set(promise) should call observer.error().", () => {
    const [promise, done] = createPromise();
    const a = new Signal({
      error: done,
    });
    a.set(new Promise((_, reject) => setTimeout(reject), 100));
    return promise;
  });

  test("signal.set(function) should call observer.error().", () => {
    const [promise, done] = createPromise();
    const error = new Signal().set(() => {
      throw new Error();
    });
    const a = new Signal({
      error: done,
    });
    a.set((error) => error(), [error]);
    return promise;
  });

  test("signal.dispose() should do nothing if not subscribe.", () => {
    const a = new Signal();
    a.dispose();
  });

  test("signal.dispose() should unsubscribe subscription if subscribe.", () => {
    const a = new Signal({
      next: (x) => x,
    });
    a.set(1);
    a.dispose();
    expect(a._subscription.closed).toBe(true);
  });
});

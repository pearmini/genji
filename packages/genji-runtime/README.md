# genji-runtime

## Signal

<a name="signal_constructor" href="#signal_constructor">#</a> new **Signal**(\[_observer_\])

```js
const a = new Signal({ next: (x) => console.log(x) });
```

<a name="signal_set" href="#signal_set">#</a> _signal_.**set**(_value_, \[_deps_\])

```js
const value = new Signal().set(1);
const promise = new Signal().set(Promise.resolve(3));
```

<a name="signal_dispose" href="#signal_dispose">#</a> _signal_.**dispose**()

```js
const value = new Signal().set(1);
value.dispose();
```

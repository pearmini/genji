# Object Inspector

## Number

```js eval
n = 1;
```

## Boolean

```js eval
bool = true;
```

## Array

```js eval
A = ["Apple", null, Promise];
```

## Function

```js eval
function add(x, y) {
  return x + y;
}
```

## Object

```js eval
o = {
  string: "a",
  add(x, y) {
    return x + y;
  },
  array: ["Apple", null, Promise],
};
```

## Class

```js eval
display(() => {
  class N {
    add(x, y) {
      return x + y;
    }
    minus(x, y) {
      return x - y;
    }
  }
  return new N();
});
```

# _P5_.**Square(_...params_)** {#square}

::: tip
[Source](https://github.com/pearmini/genji/blob/main/docs/examples/p5js-square.md?plain=1) · This is a [genji](https://genji-md.dev/) example to write API reference for web-based library. his version is adapted from the official documentation, now enhanced with Genji's reactivity features. For reference, you can check out the [original documentation](https://p5js.org/reference/#/p5/square).
:::

## Description

Draws a square.

A square is a four-sided shape defined by the _x_, _y_, and _s_ parameters. _x_ and _y_ set the location of its top-left corner. s sets its width and height. Every angle in the square measures 90˚ and all its sides are the same length. See _rectMode()_ for other ways to define squares.

The version of _square()_ with four parameters creates a rounded square. The fourth parameter sets the radius for all four corners.

The version of _square()_ with seven parameters also creates a rounded square. Each of the last four parameters set the radius of a corner. The radii start with the top-left corner and move clockwise around the square. If any of these parameters are omitted, they are set to the value of the last radius that was set.

```js eval code=false inspector=false
p5 = d3.require("p5");
```

## Examples

A white square with a black outline in on a gray canvas.

```js eval t=p
function setup() {
  createCanvas(100, 100);
  background(200);
  square(30, 20, 55);
}
```

A white square with a black outline and round edges on a gray canvas.

```js eval code=false
r = Inputs.range([10, 30], { label: "r", value: 15, step: 1 });
```

```js eval t=p
function setup() {
  createCanvas(100, 100);
  background(200);
  // Give all corners a radius of the same value.
  square(30, 20, 55, r);
}
```

A white square with a black outline and round edges of different radii.

```js eval code=false
r1 = Inputs.range([5, 30], { label: "r1", value: 20, step: 1 });
```

```js eval code=false
r2 = Inputs.range([5, 30], { label: "r2", value: 15, step: 1 });
```

```js eval code=false
r3 = Inputs.range([5, 30], { label: "r3", value: 10, step: 1 });
```

```js eval code=false
r4 = Inputs.range([5, 30], { label: "r4", value: 5, step: 1 });
```

```js eval t=p
function setup() {
  createCanvas(100, 100);
  background(200);
  // Give each corner a unique radius.
  square(30, 20, 55, r1, r2, r3, r4);
}
```

A white square with a black outline in on a gray canvas.

```js eval t=p
function setup() {
  createCanvas(100, 100, WEBGL);
  background(200);
  square(-20, -30, 55);
}
```

A white square spins around on gray canvas.

```js eval code=false
rate = Inputs.range([0.01, 0.1], { step: 0.01, label: "rate", value: 0.05 });
```

```js eval t=pp
function setup() {
  createCanvas(100, 100, WEBGL);
}

function draw() {
  background(200);
  // Rotate around the y-axis.
  rotateY(frameCount * rate);
  // Draw the square.
  square(-20, -30, 55);
}
```

## Syntax

```js
square(x, y, s, [tl], [tr], [br], [bl]);
```

## Parameters

- **x** - _Number_: x-coordinate of the square.
- **y** - _Number_: y-coordinate of the square.
- **s** - _Number_: side size of the square.
- **tl** - _Number_: optional radius of top-left corner. (Optional)
- **tr** - _Number_: optional radius of top-right corner. (Optional)
- **br** - _Number_: optional radius of bottom-right corner. (Optional)
- **bl** - _Number_: optional radius of bottom-left corner. (Optional)

# Athletes Visualization

```js eval code=false
Inputs.table(data);
```

## Basics

```js eval code=false
scatterX = Inputs.radio(["birthday", "age", "height"], {
  label: "dimension",
  value: "birthday",
});
```

```js eval code=false t=plot
Plot.plot({
  width,
  r: { range: [0, 14] },
  marks: [
    Plot.dot(
      data,
      Plot.binX(
        { r: "count" },
        {
          x: scatterX,
          tip: true,
        }
      )
    ),
  ],
});
```

## Sports

```js eval code=false t=plot
Plot.plot({
  width,
  marginBottom: 150,
  marginLeft: 6,
  x: { label: null, tickRotate: 90 },
  y: { label: null },
  color: {
    label: "Median height (m)",
    legend: true,
    scheme: "YlGnBu",
    nice: true,
  },
  marks: [
    Plot.cell(
      data,
      Plot.groupX(
        { fill: "median" },
        {
          fill: "height",
          x: "sport",
          tip: true,
        }
      )
    ),
  ],
});
```

```js eval code=false t=plot
Plot.plot({
  marginBottom: 100,
  x: { label: null, tickRotate: 90 },
  y: { grid: true, label: "Frequency" },
  color: {
    type: "categorical",
    domain: [-1, 1],
    unknown: "#aaa",
    transform: Math.sign,
  },
  marks: [
    Plot.ruleY([0]),
    Plot.link(
      data,
      Plot.groupX(
        {
          y1: (D) => d3.sum(D, (d) => d === "Female"),
          y2: (D) => d3.sum(D, (d) => d === "Male"),
          stroke: (D) =>
            d3.sum(D, (d) => d === "Male") - d3.sum(D, (d) => d === "Female"),
        },
        {
          x: "sport",
          y1: sex,
          y2: sex,
          markerStart: "dot",
          markerEnd: "arrow",
          stroke: sex,
          strokeWidth: 2,
        }
      )
    ),
  ],
});
```

## Countries

```js eval code=false t=plot
Plot.plot({
  marginLeft: 50,
  marginTop: 0,
  width,
  color: { legend: true },
  y: { label: "Country" },
  x: { grid: true, label: "Count →" },
  marks: [
    Plot.barX(
      data,
      Plot.groupY(
        { x: "count" },
        {
          y: "noc",
          fill: sex,
          sort: { y: "-x" },
          tip: true,
        }
      )
    ),
    Plot.ruleX([0]),
  ],
});
```

```js eval code=false t=plot
Plot.plot({
  x: { label: "Participants →" },
  y: {
    nice: true,
    percent: true,
    label: "↑ Winning rate (%)",
  },
  marks: [
    Plot.rectY(
      d3
        .groups(data, (d) => d.noc)
        .map(([key, group]) => ({
          noc: key,
          total: group.length,
          ratio:
            d3.sum(group, (d) => (d.gold || d.silver || d.bronze ? 1 : 0)) /
            group.length,
        })),
      Plot.stackX({
        order: "ratio",
        x: "total",
        y2: "ratio",
        reverse: true,
        insetLeft: 0.2,
        insetRight: 0.2,
        tip: true,
        channels: {
          country: "noc",
        },
      })
    ),
  ],
});
```

## Metals

```js eval t=plot code=false
Plot.plot({
  height: 600,
  fy: { padding: 0 },
  x: { grid: true, nice: true },
  color: {
    type: "categorical",
    legend: true,
    tickFormat: (d) => ["Gold", "Silver", "Bronze"][d],
    range: ["#F6BD16", "#5D7092", "#CE8032", "#eee"],
  },
  marks: [
    Plot.frame({ fy: "Female", stroke: "currentColor", anchor: "bottom" }),
    Plot.dot(
      data.filter((d) => d.noc === "CHN").filter((d) => d.gender === 1),
      Plot.dodgeY({
        x: "birthday",
        fy: sex,
        fill: (d) => (d.gold ? 0 : d.silver ? 1 : 2),
        sort: { channel: "fill" },
      })
    ),
    Plot.dot(
      data.filter((d) => d.noc === "CHN").filter((d) => d.gender === 0),
      Plot.dodgeY("top", {
        x: "birthday",
        fy: sex,
        fill: (d) => (d.gold ? 0 : d.silver ? 1 : 2),
        sort: { channel: "fill" },
      })
    ),
  ],
});
```

```js eval code=false inspector=false
sex = (d) => (d.gender === 0 ? "Male" : "Female");
```

```js eval code=false inspector=false
data = d3.csv("/athletes.csv", d3.autoType);
```

```js eval code=false inspector=false
Plot = d3.require("@observablehq/plot");
```

# Athletes Visualization

<style>
  .custom-block-title {
    display:none
  }
</style>

::: tip
[Source](https://github.com/pearmini/genji/blob/main/docs/examples/athletes-visualization.md?plain=1) · This is a [genji](https://genji-md.dev/) example to create _interactive data reports_ with plots and inputs.
:::

Here is a athlete dataset for Asian Games 2023. As we see, the data is tabular, and one row correspond to one athlete.

```js eval code=false
Inputs.table(data);
```

We have access, for each athlete (or data point), to his _birthday_, _gender (0 for male and 1 for female)_, _age_, _height_, _sport_, _noc_ (country), _gold_, _silver_ and _bronze_.

Let's make some plots with this dataset using [Observable Plot](https://github.com/observablehq/plot) 🚀

## General

First, we create a one-dimension bubble chart with a radius encoding representing count of athletes, binned by the selected numerical dimension. We can see that the majority of athletes were born around _2001_, making them roughly _22_ years old, with a median height of about _170_ cm.

```js eval code=false
bubbleX = Inputs.radio(["birthday", "age", "height"], {
  label: "Bin dimension",
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
          x: bubbleX,
          tip: true,
        }
      )
    ),
  ],
});
```

## Sports

Then we compare the distributions of selected dimension for athletes within each sports using a fill encoding representing proportion of athletes. Sports are sorted by the median value of the chosen dimension: _artistic gymnastics_ tend to be the shortest, and _volleyball players_ the tallest; _rhythmic gymnastics_ tend to be the youngest, and _bridge players_ the oldest.

```js eval code=false
heatmapX = Inputs.radio(["height", "age"], {
  label: "Bin dimension",
  value: "height",
});
```

```js eval code=false t=plot
Plot.plot({
  marginLeft: 130,
  marginTop: 10,
  width,
  x: { grid: true },
  fy: {
    domain: d3.groupSort(
      data.filter((d) => d[heatmapX]),
      (g) => d3.median(g, (d) => d[heatmapX]),
      (d) => d.sport
    ),
    label: null,
  },
  color: { scheme: "YlGnBu", legend: true },
  marks: [
    Plot.rect(
      data,
      Plot.binX(
        { fill: "proportion-facet" },
        { x: heatmapX, fy: "sport", inset: 0.5 }
      )
    ),
  ],
});
```

Next, blow we use directional arrows to indicate the difference in counts of male and female athletes by sport. The color of the arrow indicates which sex is more prevalent, while its length is proportional to the difference. We observe that most sports are _male-dominated_, with _football_ having the highest number of players and _golf_ the fewest when ranking sports by player count.

```js eval code=false
linkOrder = Inputs.radio(["null", "ascending y", "descending y"], {
  label: "Order",
  value: "null",
});
```

```js eval code=false t=plot
Plot.plot({
  marginBottom: 100,
  x: {
    label: null,
    tickRotate: 90,
    domain: d3
      .groupSort(
        data,
        (g) =>
          linkOrder === "null"
            ? true
            : linkOrder === "ascending"
              ? g.length
              : -g.length,
        (d) => d.sport
      )
      .reverse(),
  },
  y: { grid: true, label: "Frequency" },
  color: {
    type: "categorical",
    domain: [-1, 1],
    unknown: "#aaa",
    transform: Math.sign,
    legend: true,
    tickFormat: (d) => (d === -1 ? "Female Prevalent" : "Male Prevalent"),
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

Now we draw a bar chart below shows a distribution of athletes by countries. Countries are sorted by player count: _Thailand (THA)_ has the largest players group, _Brunei Darussalam (BRU)_ has the smallest. If we do not stack bars, we can find that male players outnumber female players in most of the countries according to the fill of left ranges.

```js eval code=false
stack = Inputs.toggle({ label: "Stack", value: true });
```

```js eval code=false t=plot
Plot.plot({
  marginLeft: 50,
  marginTop: 0,
  width,
  color: { legend: true },
  y: {
    label: "Country",
    domain: d3.groupSort(
      data,
      (d) => -d.length,
      (d) => d.noc
    ),
  },
  x: {
    grid: true,
    label: "Count →",
  },
  marks: [
    Plot.barX(
      data,
      Plot.groupY(stack ? { x: "count" } : { x1: "count" }, {
        y: "noc",
        fill: sex,
        tip: true,
        mixBlendMode: stack ? null : "multiply",
      })
    ),
    Plot.ruleX([0]),
  ],
});
```

In order to learn something about winners, we draw a chart below. Each rect repents a country: _x_ encodes the countries's participants, while _y_ encodes the proportion of that participants winning games; hence area represents the number of participants winning in games. Rects are stacked along _x_ in order of descending _y_. We can observe that less than 50% of participants won games and _China (CHN)_ has the highest winning rate, about 76%.

```js eval code=false t=plot
Plot.plot({
  x: { label: "Participants →" },
  y: {
    nice: true,
    percent: true,
    label: "↑ Winning rate (%)",
  },
  width,
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

## Medals

At last, we draw a beeswarm plot to observe players of each country. Each circle represents a athlete: _x_ encodes _birthday_, _fill_ encodes award status, while _r_ encodes the number of medals. We can see most of the players won gold medals in China, especially female players, who seems to be more "goldener" than the male. Feel free to explore you own country with the _search_ and _select_ input!

```js eval code=false
countries = Inputs.search(Array.from(new Set(data.map((d) => d.noc))), {
  label: "Search",
});
```

```js eval code=false
country = Inputs.select(countries, { label: "Country", value: "CHN" });
```

```js eval code=false
maxR = Inputs.range([5, 10], { label: "Radius", step: 0.1, value: 6.5 });
```

```js eval code=false
dodgeP = Inputs.range([-1, 5], { label: "Padding", step: 0.1, value: 1 });
```

```js eval t=plot code=false overflow=visible
Plot.plot({
  height: 720,
  width,
  fy: { padding: 0 },
  x: { grid: true, nice: true },
  color: {
    type: "categorical",
    legend: true,
    tickFormat: (d) => ["Gold", "Silver", "Bronze", "None"][d],
    range: ["#F6BD16", "#5D7092", "#CE8032", "#aaa"],
  },
  r: { range: [2, maxR] },
  marks: [
    Plot.frame({ fy: "Female", stroke: "currentColor", anchor: "bottom" }),
    Plot.dot(
      data.filter((d) => d.noc === country).filter((d) => d.gender === 1),
      Plot.dodgeY({
        x: "birthday",
        fy: sex,
        fill: (d) => (d.gold ? 0 : d.silver ? 1 : d.bronze ? 2 : 3),
        sort: { channel: "fill" },
        r: (d) => d.gold + d.silver + d.bronze,
        tip: true,
        padding: dodgeP,
      })
    ),
    Plot.dot(
      data.filter((d) => d.noc === country).filter((d) => d.gender === 0),
      Plot.dodgeY({
        x: "birthday",
        fy: sex,
        fill: (d) => (d.gold ? 0 : d.silver ? 1 : 2),
        sort: { channel: "fill" },
        r: (d) => d.gold + d.silver + d.bronze,
        tip: true,
        padding: dodgeP,
        anchor: "top",
      })
    ),
  ],
});
```

## Reference

- [Plot: Bin transform](https://observablehq.com/plot/transforms/bin)
- [Plot: Group transform](https://observablehq.com/plot/transforms/group)
- [Plot: Dodge transform](https://observablehq.com/plot/transforms/dodge#dodge-transform)
- [Plot Exploration Penguins](https://observablehq.com/@observablehq/plot-exploration-penguins)
- [Cumulative distribution of poverty](https://observablehq.com/@observablehq/plot-cumulative-distribution-of-poverty?intent=fork)

```js eval code=false inspector=false
sex = (d) => (d.gender === 0 ? "Male" : "Female");
```

```js eval code=false inspector=false
data = d3.csv("/athletes.csv", d3.autoType);
```

```js eval code=false inspector=false
Plot = d3.require("@observablehq/plot");
```

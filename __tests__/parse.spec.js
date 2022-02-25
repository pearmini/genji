const { object2forest } = require("../lib/parse");

describe("parse", () => {
  test("object2forest", () => {
    expect(
      object2forest({
        Introduction: "introduction",
        "Get Started": "get-started",
        Showcase: {
          "Data Visualization": "data-visualization",
          "Render Engine": "render-engine",
        },
        "API Reference": "api-reference",
      })
    ).toEqual([
      {
        data: {
          name: "Introduction",
          id: "introduction",
          file: "introduction",
        },
      },
      {
        data: {
          name: "Get Started",
          id: "get-started",
          file: "get-started",
        },
      },
      {
        data: {
          name: "Showcase",
        },
        children: [
          {
            data: {
              name: "Data Visualization",
              id: "data-visualization",
              file: "data-visualization",
            },
          },
          {
            data: {
              name: "Render Engine",
              id: "render-engine",
              file: "render-engine",
            },
          },
        ],
      },
      {
        data: {
          name: "API Reference",
          id: "api-reference",
          file: "api-reference",
        },
      },
    ]);
  });
});

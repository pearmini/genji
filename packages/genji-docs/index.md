---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "Genji"
  text: "The interactive Markdown extension"
  tagline: Author interactive documents with just Markdown.
  image:
    src: /logo.png
    alt: Genji
  actions:
    - theme: brand
      text: Get Started
      link: /markdown-examples
    - theme: alt
      text: What is Genji?
      link: /api-examples

features:
  - title: Executable code blocks
    icon: 📝
    details: Code blocks in Markdown are executable, allowing them to display their evaluated values, which can then be referenced by other code blocks.
  - title: Interactive via reactivity
    icon: 🧲
    details: Built-in inputs and custom reactive variables can be defined to capture user input, triggering a re-render of the code blocks that reference them.
  - title: Compatible with popular SSG frameworks
    icon: 🌍
    details: Themes and plugins are available for integrating Genji into popular SSG frameworks, embracing their features and ensuring seamless experience with them.
---

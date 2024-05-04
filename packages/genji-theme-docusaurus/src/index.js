import postcssPrefixSelector from "postcss-prefix-selector";
import path from "path";

export default function genjiThemeDocusaurus(context, options) {
  const { siteDir } = context;

  // Inject genji.config.js into clientModules.
  context.siteConfig.clientModules.push(
    path.resolve(siteDir, "./genji.config.js")
  );

  return {
    name: "genji-theme-docusaurus",
    getThemePath() {
      return "./theme";
    },
    getClientModules() {
      return [require.resolve("genji-runtime/css")];
    },
    configurePostCss(postcssOptions) {
      const plugin = postcssPrefixSelector({
        prefix: ":not(:where(.genji-cell, .genji-cell *))",
        includeFiles: [
          /styles\.module\.css/, // docusaurus css files
          /infima\/dist\/css\/default\/default\.css/, // infima css file
        ],
        transform(prefix, _selector) {
          const [selector, pseudo = ""] = _selector.split(/(:\S*)$/);
          return selector + prefix + pseudo;
        },
      });
      postcssOptions.plugins.unshift(plugin);
      return postcssOptions;
    },
  };
}

export default function genjiThemeDocusaurus(context) {
  return {
    name: "genji-theme-docusaurus",
    getThemePath() {
      return "./theme";
    },
    getClientModules() {
      return [require.resolve("genji-runtime/css")];
    },
  };
}

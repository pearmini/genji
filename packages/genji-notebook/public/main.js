import { App } from "./app.js";
import { router } from "./router.js";

const app = new Vue({
  render: (h) => h(App),
  router,
});

app.$mount("#app");

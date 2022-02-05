import { Provider } from "./components/provider.js";

Vue.use(VueRouter);

const routes = [
  { path: "/docs/:id", component: Provider },
  { path: "/", component: Provider },
];

export const router = new VueRouter({
  routes,
  mode: "hash",
});

Vue.use(VueRouter);

const routes = [{ path: "/:id" }];

export const router = new VueRouter({
  routes,
  mode: "hash",
  base: "/** BASE_PLACEHOLDER **/",
});

Vue.use(VueRouter);

const routes = [{ path: "/docs/:id" }];

export const router = new VueRouter({
  routes,
  mode: "hash",
});

Vue.use(Vuex);

export const store = new Vuex.Store({
  state: {
    selectedId: "",
  },
  mutations: {
    setSelectedId(state, id) {
      state.selectedId = id;
    },
  },
});

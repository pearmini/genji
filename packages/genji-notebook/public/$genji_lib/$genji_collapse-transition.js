!(function (e, t) {
  if ("object" == typeof exports && "object" == typeof module)
    module.exports = t();
  else if ("function" == typeof define && define.amd) define([], t);
  else {
    var n = t();
    for (var i in n) ("object" == typeof exports ? exports : e)[i] = n[i];
  }
})(this, function () {
  return (function (e) {
    var t = {};
    function n(i) {
      if (t[i]) return t[i].exports;
      var s = (t[i] = { i: i, l: !1, exports: {} });
      return e[i].call(s.exports, s, s.exports, n), (s.l = !0), s.exports;
    }
    return (
      (n.m = e),
      (n.c = t),
      (n.d = function (e, t, i) {
        n.o(e, t) || Object.defineProperty(e, t, { enumerable: !0, get: i });
      }),
      (n.r = function (e) {
        "undefined" != typeof Symbol &&
          Symbol.toStringTag &&
          Object.defineProperty(e, Symbol.toStringTag, { value: "Module" }),
          Object.defineProperty(e, "__esModule", { value: !0 });
      }),
      (n.t = function (e, t) {
        if ((1 & t && (e = n(e)), 8 & t)) return e;
        if (4 & t && "object" == typeof e && e && e.__esModule) return e;
        var i = Object.create(null);
        if (
          (n.r(i),
          Object.defineProperty(i, "default", { enumerable: !0, value: e }),
          2 & t && "string" != typeof e)
        )
          for (var s in e)
            n.d(
              i,
              s,
              function (t) {
                return e[t];
              }.bind(null, s)
            );
        return i;
      }),
      (n.n = function (e) {
        var t =
          e && e.__esModule
            ? function () {
                return e.default;
              }
            : function () {
                return e;
              };
        return n.d(t, "a", t), t;
      }),
      (n.o = function (e, t) {
        return Object.prototype.hasOwnProperty.call(e, t);
      }),
      (n.p = "/"),
      n((n.s = 1))
    );
  })([
    function (e, t, n) {
      "use strict";
      var i = (function (e, t, n, i, s, o, r, a) {
        var c,
          l = "function" == typeof e ? e.options : e;
        if (
          (t && ((l.render = t), (l.staticRenderFns = n), (l._compiled = !0)),
          i && (l.functional = !0),
          o && (l._scopeId = "data-v-" + o),
          r
            ? ((c = function (e) {
                (e =
                  e ||
                  (this.$vnode && this.$vnode.ssrContext) ||
                  (this.parent &&
                    this.parent.$vnode &&
                    this.parent.$vnode.ssrContext)) ||
                  "undefined" == typeof __VUE_SSR_CONTEXT__ ||
                  (e = __VUE_SSR_CONTEXT__),
                  s && s.call(this, e),
                  e &&
                    e._registeredComponents &&
                    e._registeredComponents.add(r);
              }),
              (l._ssrRegister = c))
            : s &&
              (c = a
                ? function () {
                    s.call(
                      this,
                      (l.functional ? this.parent : this).$root.$options
                        .shadowRoot
                    );
                  }
                : s),
          c)
        )
          if (l.functional) {
            l._injectStyles = c;
            var u = l.render;
            l.render = function (e, t) {
              return c.call(t), u(e, t);
            };
          } else {
            var f = l.beforeCreate;
            l.beforeCreate = f ? [].concat(f, c) : [c];
          }
        return { exports: e, options: l };
      })(
        {
          name: "CollapseTransition",
          props: {
            name: { type: String, required: !1, default: "collapse" },
            dimension: {
              type: String,
              required: !1,
              default: "height",
              validator: function (e) {
                return ["height", "width"].includes(e);
              },
            },
            duration: { type: Number, required: !1, default: 300 },
            easing: { type: String, required: !1, default: "ease-in-out" },
          },
          watch: {
            dimension: function () {
              this.clearCachedDimensions();
            },
          },
          data: function () {
            return { cachedStyles: null };
          },
          computed: {
            transition: function () {
              var e = this,
                t = [];
              return (
                Object.keys(this.cachedStyles).forEach(function (n) {
                  t.push(
                    ""
                      .concat(e.convertToCssProperty(n), " ")
                      .concat(e.duration, "ms ")
                      .concat(e.easing)
                  );
                }),
                t.join(", ")
              );
            },
          },
          methods: {
            beforeAppear: function (e) {
              this.$emit("before-appear", e);
            },
            appear: function (e) {
              this.$emit("appear", e);
            },
            afterAppear: function (e) {
              this.$emit("after-appear", e);
            },
            appearCancelled: function (e) {
              this.$emit("appear-cancelled", e);
            },
            beforeEnter: function (e) {
              this.$emit("before-enter", e);
            },
            enter: function (e, t) {
              this.detectAndCacheDimensions(e),
                this.setClosedDimensions(e),
                this.hideOverflow(e),
                this.forceRepaint(e),
                this.setTransition(e),
                this.setOpenedDimensions(e),
                this.$emit("enter", e, t),
                setTimeout(t, this.duration);
            },
            afterEnter: function (e) {
              this.unsetOverflow(e),
                this.unsetTransition(e),
                this.unsetDimensions(e),
                this.clearCachedDimensions(),
                this.$emit("after-enter", e);
            },
            enterCancelled: function (e) {
              this.$emit("enter-cancelled", e);
            },
            beforeLeave: function (e) {
              this.$emit("before-leave", e);
            },
            leave: function (e, t) {
              this.detectAndCacheDimensions(e),
                this.setOpenedDimensions(e),
                this.hideOverflow(e),
                this.forceRepaint(e),
                this.setTransition(e),
                this.setClosedDimensions(e),
                this.$emit("leave", e, t),
                setTimeout(t, this.duration);
            },
            afterLeave: function (e) {
              this.unsetOverflow(e),
                this.unsetTransition(e),
                this.unsetDimensions(e),
                this.clearCachedDimensions(),
                this.$emit("after-leave", e);
            },
            leaveCancelled: function (e) {
              this.$emit("leave-cancelled", e);
            },
            detectAndCacheDimensions: function (e) {
              if (!this.cachedStyles) {
                var t = e.style.visibility,
                  n = e.style.display;
                (e.style.visibility = "hidden"),
                  (e.style.display = ""),
                  (this.cachedStyles = this.detectRelevantDimensions(e)),
                  (e.style.visibility = t),
                  (e.style.display = n);
              }
            },
            clearCachedDimensions: function () {
              this.cachedStyles = null;
            },
            detectRelevantDimensions: function (e) {
              return "height" === this.dimension
                ? {
                    height: e.offsetHeight + "px",
                    paddingTop:
                      e.style.paddingTop || this.getCssValue(e, "padding-top"),
                    paddingBottom:
                      e.style.paddingBottom ||
                      this.getCssValue(e, "padding-bottom"),
                  }
                : "width" === this.dimension
                ? {
                    width: e.offsetWidth + "px",
                    paddingLeft:
                      e.style.paddingLeft ||
                      this.getCssValue(e, "padding-left"),
                    paddingRight:
                      e.style.paddingRight ||
                      this.getCssValue(e, "padding-right"),
                  }
                : {};
            },
            setTransition: function (e) {
              e.style.transition = this.transition;
            },
            unsetTransition: function (e) {
              e.style.transition = "";
            },
            hideOverflow: function (e) {
              e.style.overflow = "hidden";
            },
            unsetOverflow: function (e) {
              e.style.overflow = "";
            },
            setClosedDimensions: function (e) {
              Object.keys(this.cachedStyles).forEach(function (t) {
                e.style[t] = "0";
              });
            },
            setOpenedDimensions: function (e) {
              var t = this;
              Object.keys(this.cachedStyles).forEach(function (n) {
                e.style[n] = t.cachedStyles[n];
              });
            },
            unsetDimensions: function (e) {
              Object.keys(this.cachedStyles).forEach(function (t) {
                e.style[t] = "";
              });
            },
            forceRepaint: function (e) {
              getComputedStyle(e)[this.dimension];
            },
            getCssValue: function (e, t) {
              return getComputedStyle(e, null).getPropertyValue(t);
            },
            convertToCssProperty: function (e) {
              var t = e.match(/([A-Z])/g);
              if (!t) return e;
              for (var n = 0, i = t.length; n < i; n++)
                e = e.replace(new RegExp(t[n]), "-" + t[n].toLowerCase());
              return "-" === e.slice(0, 1) && (e = e.slice(1)), e;
            },
          },
        },
        function () {
          var e = this,
            t = e.$createElement;
          return (e._self._c || t)(
            "transition",
            {
              attrs: { name: e.name },
              on: {
                "before-appear": e.beforeAppear,
                appear: e.appear,
                "after-appear": e.afterAppear,
                "appear-cancelled": e.appearCancelled,
                "before-enter": e.beforeEnter,
                enter: e.enter,
                "after-enter": e.afterEnter,
                "enter-cancelled": e.enterCancelled,
                "before-leave": e.beforeLeave,
                leave: e.leave,
                "after-leave": e.afterLeave,
                "leave-cancelled": e.leaveCancelled,
              },
            },
            [e._t("default")],
            2
          );
        },
        [],
        !1,
        null,
        null,
        null
      );
      t.a = i.exports;
    },
    function (e, t, n) {
      e.exports = n(2);
    },
    function (e, t, n) {
      "use strict";
      n.r(t),
        function (e) {
          n.d(t, "install", function () {
            return s;
          });
          var i = n(0);
          function s(e) {
            e.component("CollapseTransition", i.a);
          }
          n.d(t, "CollapseTransition", function () {
            return i.a;
          }),
            (t.default = i.a);
          var o = { install: s },
            r = null;
          "undefined" != typeof window
            ? (r = window.Vue)
            : void 0 !== e && (r = e.Vue),
            r && r.use(o);
        }.call(this, n(3));
    },
    function (e, t) {
      var n;
      n = (function () {
        return this;
      })();
      try {
        n = n || new Function("return this")();
      } catch (e) {
        "object" == typeof window && (n = window);
      }
      e.exports = n;
    },
  ]);
});

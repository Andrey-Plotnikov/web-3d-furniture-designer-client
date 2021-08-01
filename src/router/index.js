import Vue from "vue";
import VueRouter from "vue-router";
import DesignerView from "../views/Designer.vue";
import NotFoundView from "../views/NotFound.vue";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "designer",
    component: DesignerView,
  },
  {
    path: "/404",
    name: "404",
    component: NotFoundView,
  },
  {
    path: "*",
    redirect: "/404",
  },
  /*
  {
    path: "/about",
    name: "About",
    component: () =>
      import("../views/About.vue"),
  },
*/
];

const router = new VueRouter({
  mode: "history",
  routes,
});

export default router;

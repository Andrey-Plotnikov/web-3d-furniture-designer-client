import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    length: {
      login: {
        min: 3,
        max: 30,
      },
      password: {
        min: 6,
        max: 30,
      },
    },
    isAuth: false,
    token: null,
    paths: {
      host: "http://localhost:8080",
      apiHost: "http://localhost:3000",
      textures: "textures",
    },
    textureStorage: null,
    textures: {
      wood: {
        folder: "wood",
        limit: 17,
        extension: "jpg",
        isRepeat: false,
      },
      stone: {
        folder: "stone",
        limit: 7,
        extension: "jpg",
        isRepeat: false,
      },
      wall: {
        folder: "wall",
        limit: 8,
        extension: "jpg",
        isRepeat: true,
      },
      floor: {
        folder: "floor",
        limit: 9,
        extension: "jpg",
        isRepeat: true,
      },
      plywood: {
        folder: "plywood",
        limit: 1,
        extension: "jpg",
        isRepeat: false,
      },
      pattern: {
        folder: "pattern",
        limit: 2,
        extension: "png",
        isRepeat: false,
      },
    },
  },
  getters: {
    LOGIN_LENGTH: (length) => {
      return length.login;
    },
    PASSWORD_LENGTH: (length) => {
      return length.password;
    },
    IS_AUTH: (state) => {
      return state.isAuth;
    },
    HOST: (state) => {
      return state.paths.host;
    },
    API_HOST: (state) => {
      return state.paths.apiHost;
    },
    TEXTURES_PATH: (state) => {
      return `${state.paths.host}/${state.paths.textures}`;
    },
    TEXTURES_META: (state) => {
      return state.textures;
    },
    TEXTURES: (state) => {
      return state.textureStorage;
    },
  },
  mutations: {},
  actions: {},
  modules: {},
});

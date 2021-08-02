<template>
  <div class="window-content">
    <div class="single-column">
      <div class="block stretch" v-show="isLogin">
        <h3 class="center-align title">Войдите в аккаунт</h3>
        <div>
          <fieldset>
            <legend>Логин</legend>
            <input v-model="signinInput.login" />
          </fieldset>
        </div>
        <div>
          <fieldset>
            <legend>Пароль</legend>
            <input v-model="signinInput.password" type="password" />
          </fieldset>
        </div>
        <div class="row-baseline">
          <button @click="tryLogin()">Войти</button>
        </div>
        <div class="row-baseline">
          <a @click="isLogin = false">Регистрация</a>
        </div>
        <div v-show="isAsFirst" class="stretch">
          <p>или</p>
          <button @click="submit">Продолжить как гость</button>
        </div>
      </div>
      <div class="block" v-show="!isLogin">
        <h3 class="center-align title">Регистрация</h3>
        <div>
          <fieldset>
            <legend>Логин</legend>
            <input v-model="signupInput.login" />
          </fieldset>
        </div>
        <div>
          <fieldset>
            <legend>Пароль</legend>
            <input v-model="signupInput.password" type="password" />
          </fieldset>
        </div>
        <div>
          <fieldset>
            <legend>Повторите пароль</legend>
            <input v-model="signupInput.repeatPasswrod" type="password" />
          </fieldset>
        </div>
        <div class="row-baseline">
          <button @click="tryRegister()">Зарегистрироваться</button>
        </div>
        <div class="row-baseline">
          <a @click="isLogin = true">Назад</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "user-login",
  data() {
    return {
      isLogin: true,
      isAsFirst: false,

      signupInput: {
        login: "",
        password: "",
        repeatPasswrod: "",
      },
      signinInput: {
        login: "",
        password: "",
      },
    };
  },
  methods: {
    show() {
      this.$parent.show = true;
      this.isAsFirst = false;
    },
    showAsFirst() {
      this.$parent.show = true;
      this.isAsFirst = true;
    },
    submit() {
      this.$parent.show = false;
      this.$emit("submit");
    },
    close() {
      this.$parent.show = false;
    },
    tryLogin() {
      let data = JSON.stringify({
        login: this.signinInput.login,
        password: this.signinInput.password,
      });
      console.log(data);

      axios
        .post(this.$store.getters.API_HOST + "/signin", data, {
          headers: { "Content-Type": "application/json" },
        })
        .then((response) => {
          console.log(response);
          if (response.data.success === true) {
            console.log(document.cookie);
            this.$store.state.isAuth = true;
            this.submit();
          }
        });
    },
    tryRegister() {
      let data = JSON.stringify({
        login: this.signupInput.login,
        password: this.signupInput.password,
      });
      console.log(data);

      axios
        .post(this.$store.getters.API_HOST + "/signup", data, {
          headers: { "Content-Type": "application/json" },
        })
        .then((response) => {
          console.log(response);
          if (response.data.success === true) {
            this.isLogin = true;
          }
        });
    },
  },
};
</script>

<style scoped>
.stretch {
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: stretch;
}
.stretch > * {
  margin: 0 0 0.5rem 0;
}
.stretch > *:last-child {
  margin: 0;
}
</style>

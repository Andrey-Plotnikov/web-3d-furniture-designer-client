<template>
  <div class="window-content">
    <div class="single-column">
      <div class="block">
        <p>{{ username }}</p>
        <h4>Сменить пароль</h4>
        <div>
          <fieldset>
            <legend>Старый пароль</legend>
            <input />
          </fieldset>
        </div>
        <div>
          <fieldset>
            <legend>Новый пароль</legend>
            <input />
          </fieldset>
        </div>
        <div>
          <fieldset>
            <legend>Повторите новый пароль</legend>
            <input />
          </fieldset>
        </div>
      </div>
      <div class="footer-buttons">
        <button @click="submit()">Сменить</button>
        <button @click="close()" class="sec">Отменить</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "user-info",
  data() {
    return {
      username: "",
    };
  },
  methods: {
    show() {
      this.$parent.show = true;
    },
    submit() {
      this.$parent.show = false;
      this.$emit("submit", {});
    },
    close() {
      this.$parent.show = false;
    },
  },
};
</script>

<style scoped></style>

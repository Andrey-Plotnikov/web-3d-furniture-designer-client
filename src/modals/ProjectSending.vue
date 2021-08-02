<template>
  <div class="window-content">
    <div class="single-column">
      <div class="block">
        <h4>Комментарий</h4>
        <textarea maxlength="500" class="commentary-text"></textarea>
      </div>
      <div class="block">
        <h4>Обратная связь</h4>
        <fieldset>
          <legend>Имя</legend>
          <input type="text" maxlength="40" />
        </fieldset>
        <fieldset>
          <legend>Email</legend>
          <input type="text" maxlength="60" />
        </fieldset>
        <fieldset>
          <legend>Телефон</legend>
          <input type="text" />
        </fieldset>
      </div>
      <div class="footer-buttons">
        <button v-show="!isSended" @click="send()">Отправить</button>
        <button v-show="isSended" @click="submit()">Закрыть</button>
        <button @click="close()" class="sec">Отменить</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "project-sending",
  data() {
    return {
      info: {
        project: "",
        comment: "",
        name: "",
        email: "",
        phone: "",
      },
      isSended: false,
    };
  },
  methods: {
    show(project) {
      this.$parent.show = true;
      this.isSended = false;
    },
    submit() {
      this.$emit("submit", null);
      this.$parent.show = false;
    },
    close() {
      this.$parent.show = false;
    },
    send() {
      this.isSended = true;
    },
  },
};
</script>

<style scoped>
.window-content {
  width: 20rem;
}
.commentary-text {
  width: 100%;
  box-sizing: border-box;
  height: 12rem;
  font-size: 1.1rem;
}
</style>

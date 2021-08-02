<template>
  <div class="window-content">
    <div class="single-column">
      <div class="block">
        <h4>Сохранить как</h4>
        <input :value="name" @input="checkName($event, $event.target.value)" />
      </div>
      <div class="footer-buttons">
        <button @click="submit">Сохранить</button>
        <button @click="close" class="sec">Отменить</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "local-save",
  data() {
    return {
      name: "",
    };
  },
  methods: {
    show(name) {
      this.$parent.show = true;

      if (name !== undefined) {
        this.name = name;
      }
    },
    submit() {
      this.$parent.show = false;
      this.$emit("submit", this.name);
    },
    close() {
      this.$parent.show = false;
    },
    checkName(event, value) {
      if (!value.match(/^([A-Z]|[a-z]|[А-Я]|[а-я]|[0-9]|_| |-|){0,40}$/gm)) {
        event.target.value = this.name;
        return;
      }
      this.name = value;
    },
  },
};
</script>

<style scoped></style>

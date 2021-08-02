<template>
  <div class="window-content">
    <div class="single-column">
      <div class="block" v-show="!isLoaded">
        <h4>Сохранить как</h4>
        <input :value="name" @input="checkName($event, $event.target.value)" />
      </div>
      <div class="block" v-show="isLoaded">
        <h4>Проект успешно загружен</h4>
      </div>
      <div class="footer-buttons">
        <button @click="loadProject()" v-show="!isLoaded">Сохранить</button>
        <button @click="close()" class="sec" v-show="!isLoaded">
          Отменить
        </button>
        <button @click="close()" class="sec" v-show="isLoaded">Закрыть</button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "server-save",
  data() {
    return {
      name: "",
      project: "",
      isLoaded: false,
    };
  },
  methods: {
    show(name, project) {
      this.$parent.show = true;
      this.isLoaded = false;

      if (name !== undefined) {
        this.name = name;
      }
      this.project = project;
    },
    loadProject() {
      let data = axios
        .post(
          this.$store.getters.API_HOST + "/projects",
          JSON.stringify({ name: this.name, project: this.project }),
          { headers: { "Content-Type": "application/json" } }
        )
        .then((response) => {
          if (response.data.success === true) {
            this.isLoaded = true;
          } else {
            console.log(response.message);
          }
        });
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

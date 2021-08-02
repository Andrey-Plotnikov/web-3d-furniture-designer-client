<template>
  <div class="window-content">
    <div class="single-column">
      <div class="block" v-show="isError">
        <h4>{{ message }}</h4>
      </div>
      <div class="block" v-show="!isError">
        <h4 class="center" v-show="projects.length == 0">
          Нет сохранённых проектов
        </h4>
        <div
          class="project-info"
          v-show="projects.length > 0"
          v-for="(project, index) in projects"
          v-bind:key="index"
          ref="projectList"
        >
          <h4 v-show="index != selectedRename">{{ project.name }}</h4>
          <div class="action-row" v-show="index == selectedRename">
            <input ref="inputs" data-key="index" />
            <a @click="submitRename(index)">Сохранить</a>
            <a @click="cancelRename">Отменить</a>
          </div>
          <p>Дата изменения: {{ project.modifyingDatetime }}</p>
          <div class="action-row">
            <a @click="deleteProject(index)">Удалить</a>
            <a @click="downloadProject(index)">Скачать</a>
            <a @click="renameProject(index, tmpName)">Переименовать</a>
            <button @click="selectProject(index)">Выбрать</button>
          </div>
        </div>
      </div>
      <div class="footer-buttons">
        <!-- <button @click="submit()">Выбрать</button> -->
        <button @click="close()" class="sec">Закрыть</button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "user-projects",
  data() {
    return {
      host: this.$store.getters.API_HOST,
      message: "",
      projects: [],
      tmpName: "",
      isError: false,
      selectedRename: -1,
    };
  },
  methods: {
    formatDate(value) {
      return value > 9 ? "" + value : "0" + value;
    },
    getProjects() {
      axios.get(this.$store.getters.API_HOST + "/projects").then((response) => {
        console.log(response);
        for (let i = 0; i < response.data.projects.length; i++) {
          let datetime = new Date(response.data.projects[i].modifyingDatetime);

          let day = this.formatDate(datetime.getDate());
          let month = this.formatDate(datetime.getMonth() + 1);
          let hours = this.formatDate(datetime.getHours());
          let minutes = this.formatDate(datetime.getMinutes());
          let seconds = this.formatDate(datetime.getSeconds());

          response.data.projects[
            i
          ].modifyingDatetime = `${day}-${month}-${datetime.getFullYear()} ${hours}:${minutes}:${seconds}`;
        }
        this.projects = response.data.projects;
      });
    },
    show() {
      this.getProjects();

      this.$parent.show = true;
    },
    submit() {
      this.$parent.show = false;
      this.$emit("submit", {});
    },
    close() {
      this.$parent.show = false;
    },
    deleteProject(index) {
      axios
        .delete(
          this.$store.getters.API_HOST + "/projects/" + this.projects[index].id
        )
        .then((response) => {
          console.log(response);
          if (response.data.success === true) {
            this.projects.splice(index, 1);
            console.log(this.projects);
          } else {
            console.log(response.data.message);
          }
        });
    },
    downloadProject(index) {
      axios
        .get(this.host + "/projects/" + this.projects[index].id)
        .then((response) => {
          if (response.content !== "") {
          } else {
            console.log(response.message);
          }
        });
    },
    renameProject(index) {
      this.selectedRename = index;
    },
    cancelRename() {
      this.selectedRename = -1;
    },
    submitRename(index, name) {
      let data = JSON.stringify({
        name: this.$refs.inputs[index].value,
      });

      axios
        .patch(
          this.$store.getters.API_HOST + "/projects/" + this.projects[index].id,
          data,
          { headers: { "Content-Type": "application/json" } }
        )
        .then((response) => {
          if (response.data.success === true) {
            this.getProjects();
          } else {
            console.log(response.message);
          }
        });

      this.selectedRename = -1;
    },
    selectProject(index) {
      this.close();
      this.$emit("selected", this.projects[index]);
    },
  },
};
</script>

<style scoped>
.project-info {
  box-shadow: 0 0 0.5rem 0 rgba(0, 0, 0, 0.1);
  padding: 0.5rem;
  margin: 0.5rem;
}
.action-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin: 0.5rem 0;
}
.action-row > * {
  margin: 0 0.25rem;
}
.action-row > *:first-child {
  margin-left: 0;
}
.action-row > *:last-child {
  margin-right: 0;
}
.block {
  max-height: 70vh;
  overflow: auto;
}
</style>

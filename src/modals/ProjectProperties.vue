<template>
  <div class="window-content">
    <div class="single-column">
      <div class="block">
        <h4>Название проекта</h4>
        <fieldset>
          <input
            :value="project.name"
            @input="checkName($event, $event.target.value)"
          />
        </fieldset>
      </div>
      <div class="block">
        <h4>Размеры помещения</h4>
        <fieldset>
          <legend>Ширина (мм)</legend>
          <input
            :value="project.size.width"
            @input="checkSize($event, $event.target.value, 'width')"
          />
        </fieldset>
        <fieldset>
          <legend>Высота (мм)</legend>
          <input
            :value="project.size.height"
            @input="checkSize($event, $event.target.value, 'height')"
          />
        </fieldset>
        <fieldset>
          <legend>Глубина (мм)</legend>
          <input
            :value="project.size.depth"
            @input="checkSize($event, $event.target.value, 'depth')"
          />
        </fieldset>
      </div>
      <div class="footer-buttons">
        <button v-show="!asNew" @click="submit()">Сохранить</button>
        <button @click="submit(true)" :class="{ sec: asNew === false }">
          Создать
        </button>
        <button @click="close()" class="sec">Отменить</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "project-properties",
  data() {
    return {
      project: {
        name: "Безымянный",
        size: {
          width: 3000,
          height: 2500,
          depth: 2000,
        },
      },
      asNew: false,
    };
  },
  methods: {
    show(project) {
      this.$parent.show = true;

      if (project !== undefined) {
        this.project.name = project.name;
        this.project.size.width = project.size.width;
        this.project.size.height = project.size.height;
        this.project.size.depth = project.size.depth;
        this.asNew = false;
      } else {
        this.asNew = true;
      }
    },
    submit(isRecreate) {
      let project = {
        name: this.project.name,
        size: {
          width: +this.project.size.width,
          height: +this.project.size.height,
          depth: +this.project.size.depth,
        },
      };
      this.$emit("submit", project, isRecreate);
      this.$parent.show = false;
    },
    close() {
      this.$parent.show = false;
    },
    checkName(event, value) {
      if (!value.match(/^([A-Z]|[a-z]|[А-Я]|[а-я]|[0-9]|_| |-|){0,40}$/gm)) {
        event.target.value = this.project.name;
        return;
      }
      this.project.name = value;
    },
    checkSize(event, value, sizeName) {
      if (!value.match(/^\d{0,6}$/gm)) {
        event.target.value = this.project.size[sizeName];
        return;
      }
      this.project.size[sizeName] = value;
    },
  },
};
</script>

<style scoped></style>

<template>
  <div class="window-content">
    <div class="single-column">
      <div class="block">
        <h4>Камера</h4>
        <fieldset>
          <legend>Угол обзора (градус)</legend>
          <input
            :value="settings.fov"
            @input="checkFOV($event, $event.target.value)"
          />
        </fieldset>
      </div>
      <div class="block">
        <h4>Отрисовка</h4>
        <div class="single-column">
          <label
            ><input type="checkbox" v-model="settings.isShowEdges" />Выделять
            грани объектов</label
          >
          <label
            ><input type="checkbox" v-model="settings.isShowGrid" />Показывать
            измерительную сетку</label
          >
        </div>
        <fieldset>
          <legend>Шаг сетки (сантиметр)</legend>
          <input
            :value="settings.gridStep"
            @input="checkGridStep($event, $event.target.value)"
          />
        </fieldset>
      </div>
      <div class="footer-buttons">
        <button @click="submit()">Сохранить</button>
        <button @click="close()" class="sec">Отменить</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "project-settings",
  data() {
    return {
      settings: {
        fov: 0,
        gridStep: 0,
        isShowGrid: false,
        isShowEdges: false,
      },
    };
  },
  methods: {
    show(settings) {
      this.$parent.show = true;

      if (settings !== undefined) {
        this.settings.fov = settings.fov;
        this.settings.gridStep = settings.gridStep / 10;
        this.settings.isShowGrid = settings.isShowGrid;
        this.settings.isShowEdges = settings.isShowEdges;
      }
    },
    submit() {
      let settings = {
        fov: +this.settings.fov,
        gridStep: +this.settings.gridStep * 10,
        isShowGrid: this.settings.isShowGrid,
        isShowEdges: this.settings.isShowEdges,
      };
      this.$emit("submit", settings);
      this.$parent.show = false;
    },
    close() {
      this.$parent.show = false;
    },
    checkFOV(event, value) {
      if (!value.match(/^\d{0,3}$/gm)) {
        event.target.value = this.settings.fov;
        return;
      }
      this.settings.fov = value;
    },
    checkGridStep(event, value) {
      if (!value.match(/^\d{0,4}$/gm)) {
        event.target.value = this.settings.gridStep;
        return;
      }
      this.settings.gridStep = value;
    },
  },
};
</script>

<style scoped></style>

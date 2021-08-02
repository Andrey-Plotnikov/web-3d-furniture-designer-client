<template>
  <div class="window-content">
    <div class="single-column">
      <div class="block">
        <h4>Повернуть</h4>
        <select
          @change="axisChange($event, $event.target.selectedIndex)"
          ref="axisSelect"
        >
          <option>По оси X</option>
          <option>По оси Y</option>
          <option>По оси Z</option>
        </select>
        <fieldset>
          <legend>(градус)</legend>
          <input
            :value="rotation.angle"
            type="text"
            maxlength="40"
            @input="checkInput($event, $event.target.value)"
          />
        </fieldset>
      </div>
      <div class="footer-buttons">
        <button @click="submit()">Повернуть</button>
        <!-- <button @click="submit()" class="sec">Сбросить поворот</button> -->
        <button @click="close()" class="sec">Отменить</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "object-rotation",
  data() {
    return {
      rotation: {
        axis: 0,
        angle: 0,
      },
    };
  },
  methods: {
    show() {
      this.$parent.show = true;
      this.rotation.axis = 0;
      this.rotation.angle = 0;
      this.$refs.axisSelect.selectedIndex = 0;
    },
    submit() {
      this.$emit("submit", {
        axis: +this.rotation.axis,
        angle: +this.rotation.angle,
      });
      this.$parent.show = false;
    },
    close() {
      this.$parent.show = false;
    },
    axisChange(event, value) {
      this.rotation.axis = value;
    },
    checkInput(event, value) {
      if (!value.match(/^-?\d*$/mu)) {
        event.target.value = this.rotation.angle;
        return;
      }
      this.rotation.angle = value;
    },
  },
};
</script>

<style scoped>
.texture-grid-container {
  height: 12rem;
  border: 1px solid #999999;
  overflow: auto;
  padding: 1rem;
}
.texture-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.5rem 0.5rem;
  justify-content: center;
}
.texture-grid > div {
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.texture-grid > div.selected {
  background-color: #03a9f4;
}
.texture-grid > div:hover {
  cursor: pointer;
}
.texture-grid img {
  width: 10rem;
  height: 10rem;
}
</style>

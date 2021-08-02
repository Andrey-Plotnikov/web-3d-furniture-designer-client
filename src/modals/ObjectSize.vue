<template>
  <div class="window-content">
    <div class="single-column">
      <div class="block">
        <h4>Размер</h4>
        <fieldset>
          <legend>Ширина (мм)</legend>
          <input
            :value="size.width"
            @input="checkSize($event, $event.target.value, 'width')"
          />
        </fieldset>
        <fieldset>
          <legend>Высота (мм)</legend>
          <input
            :value="size.height"
            @input="checkSize($event, $event.target.value, 'height')"
          />
        </fieldset>
        <fieldset>
          <legend>Толщина (мм)</legend>
          <input
            :value="size.depth"
            @input="checkSize($event, $event.target.value, 'depth')"
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
  name: "object-size",
  data() {
    return {
      size: {
        width: 0,
        height: 0,
        depth: 0,
      },
    };
  },
  methods: {
    show(size) {
      this.size.width = size.width.toString();
      this.size.height = size.height.toString();
      this.size.depth = size.depth.toString();

      this.$parent.show = true;
    },
    submit() {
      this.$parent.show = false;
      this.$emit("submit", {
        width: +this.size.width,
        height: +this.size.height,
        depth: +this.size.depth,
      });
    },
    close() {
      this.$parent.show = false;
    },
    checkSize(event, value, prop) {
      if (!value.match(/^\d{0,6}$/mu)) {
        event.target.value = this.size[prop];
        return;
      }
      this.size[prop] = value;
    },
  },
};
</script>

<style scoped></style>

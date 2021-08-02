<template>
  <div class="window-content">
    <div class="single-column">
      <div class="block">
        <h4>Размеры детали</h4>
        <div class="row">
          <fieldset>
            <legend>Ширина (мм)</legend>
            <input
              :value="plate.size.width"
              type="text"
              maxlength="40"
              @input="checkIntegerInput($event, $event.target.value, 'width')"
            />
          </fieldset>
          <fieldset>
            <legend>Высота (мм)</legend>
            <input
              :value="plate.size.height"
              type="text"
              maxlength="40"
              @input="checkIntegerInput($event, $event.target.value, 'height')"
            />
          </fieldset>
          <fieldset>
            <legend>Толщина (мм)</legend>
            <input
              :value="plate.size.depth"
              type="text"
              maxlength="40"
              @input="checkIntegerInput($event, $event.target.value, 'depth')"
            />
          </fieldset>
        </div>
      </div>
      <div class="block texture-picker-container">
        <h4 v-show="type !== 'dvp'">Текстура</h4>
        <select
          @change="optionChange($event, $event.target.selectedIndex)"
          v-show="type === 'facade'"
        >
          <option>Основная</option>
          <option>Орнамент</option>
        </select>
        <texture-picker
          ref="woodTexturePicker"
          v-show="type === 'ldsp' || type === 'facade'"
          category="wood"
        ></texture-picker>
        <texture-picker
          ref="patternTexturePicker"
          v-show="type === 'facade'"
          category="pattern"
        ></texture-picker>
        <texture-picker
          ref="stoneTexturePicker"
          v-show="type === 'worktop'"
          category="stone"
        ></texture-picker>
      </div>
      <div class="footer-buttons">
        <button @click="submit()">Создать</button>
        <button @click="close()" class="sec">Отменить</button>
      </div>
    </div>
  </div>
</template>

<script>
import TexturePicker from "@/components/TexturePicker.vue";

export default {
  name: "plate-creation",
  components: {
    TexturePicker,
  },
  data() {
    return {
      plate: {
        size: {
          width: 1000,
          height: 1000,
          depth: 16,
        },
        texture: 0,
      },
      type: "",
    };
  },
  methods: {
    show(type) {
      this.$parent.show = true;
      this.$refs.woodTexturePicker.index = 0;
      this.$refs.patternTexturePicker.index = 0;
      this.$refs.stoneTexturePicker.index = 0;
      this.type = type;

      if (this.type === "ldsp") {
        this.plate.size.depth = 16;
      } else if (this.type === "facade") {
        this.plate.size.depth = 16;
      } else if (this.type === "worktop") {
        this.plate.size.depth = 40;
      } else if (this.type === "dvp") {
        this.plate.size.depth = 3;
      }
    },
    submit() {
      this.$parent.show = false;

      let texture = null;
      let pattern = null;

      if (this.type === "ldsp") {
        texture = this.$refs.woodTexturePicker.index;
      } else if (this.type === "facade") {
        texture = this.$refs.woodTexturePicker.index;
        pattern = this.$refs.patternTexturePicker.index;
      } else if (this.type === "worktop") {
        texture = this.$refs.stoneTexturePicker.index;
      } else if (this.type === "dvp") {
        texture = 0;
      }

      this.$emit("submit", {
        size: {
          width: +this.plate.size.width,
          height: +this.plate.size.height,
          depth: +this.plate.size.depth,
        },
        texture: +texture,
        pattern: +pattern,
      });
    },
    close() {
      this.$parent.show = false;
    },
    checkIntegerInput(event, value, sizeName) {
      if (!value.match(/^\d{0,4}$/gmu)) {
        event.target.value = this.plate.size[sizeName];
        return;
      }
      this.plate.size[sizeName] = value;
    },
  },
};
</script>

<style scoped>
.texture-picker-container {
  max-height: 50vh;
  overflow: auto;
}
</style>

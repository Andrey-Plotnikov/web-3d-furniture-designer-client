<template>
  <div class="window-content">
    <div class="single-column">
      <div class="block">
        <h4>Текстура</h4>
        <div class="row">
          <select @change="optionChange($event, $event.target.selectedIndex)">
            <option>Стены</option>
            <option>Пол</option>
          </select>
          <a @click="setNoTexture">Сбросить текстуру</a>
        </div>
        <div class="texture-picker-container">
          <texture-picker
            v-show="selectedCategory === 0"
            ref="wallsTexturePicker"
            category="wall"
          ></texture-picker>
          <texture-picker
            v-show="selectedCategory === 1"
            ref="floorTexturePicker"
            category="floor"
          ></texture-picker>
        </div>
      </div>
      <div class="footer-buttons">
        <button @click="submit()">Сохранить</button>
        <button @click="close()" class="sec">Отменить</button>
      </div>
    </div>
  </div>
</template>

<script>
import TexturePicker from "@/components/TexturePicker.vue";

export default {
  name: "room-texture",
  components: {
    TexturePicker,
  },
  data() {
    return {
      selectedCategory: 0,
    };
  },
  methods: {
    show(slabs) {
      this.$parent.show = true;
      this.$refs.wallsTexturePicker.index = slabs.walls;
      this.$refs.floorTexturePicker.index = slabs.floor;
    },
    submit() {
      this.$emit("submit", {
        walls: this.$refs.wallsTexturePicker.index,
        floor: this.$refs.floorTexturePicker.index,
      });
      this.$parent.show = false;
    },
    close() {
      this.$parent.show = false;
    },
    setNoTexture() {
      if (this.selectedCategory === 0) {
        this.$refs.wallsTexturePicker.index = -1;
      } else if (this.selectedCategory === 1) {
        this.$refs.floorTexturePicker.index = -1;
      }
    },
    optionChange(event, value) {
      this.selectedCategory = value;
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

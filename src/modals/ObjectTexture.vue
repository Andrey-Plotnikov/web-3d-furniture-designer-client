<template>
  <div class="window-content">
    <div class="single-column">
      <div class="block">
        <h4>Текстура</h4>
        <select
          @change="optionChange($event, $event.target.selectedIndex)"
          ref="categorySelect"
        >
          <option v-show="types.isLDSP">ЛДСП</option>
          <option v-show="types.isFacade">Фасад</option>
          <option v-show="types.isFacade">Орнамент фасада</option>
          <option v-show="types.isWorktop">Столешница</option>
        </select>
        <div class="texture-picker-container">
          <texture-picker
            v-show="selectedCategory === 0"
            ref="ldspTexturePicker"
            category="wood"
          ></texture-picker>
          <texture-picker
            v-show="selectedCategory === 1"
            ref="facadeTexturePicker"
            category="wood"
          ></texture-picker>
          <texture-picker
            v-show="selectedCategory === 2"
            ref="patternTexturePicker"
            category="pattern"
          ></texture-picker>
          <texture-picker
            v-show="selectedCategory === 3"
            ref="worktopTexturePicker"
            category="stone"
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
  name: "object-texture",
  components: {
    TexturePicker,
  },
  data() {
    return {
      selectedCategory: 0,
      types: {
        isLDSP: false,
        isFacade: false,
        isWorktop: false,
      },
    };
  },
  methods: {
    show(isLDSP, isFacade, isWorktop) {
      this.$refs.ldspTexturePicker.index = -1;
      this.$refs.facadeTexturePicker.index = -1;
      this.$refs.patternTexturePicker.index = -1;
      this.$refs.worktopTexturePicker.index = -1;

      this.types.isLDSP = isLDSP;
      this.types.isFacade = isFacade;
      this.types.isWorktop = isWorktop;

      if (this.types.isLDSP === true) this.selectedCategory = 0;
      else if (this.types.isFacade === true) this.selectedCategory = 1;
      else if (this.types.isWorktop === true) this.selectedCategory = 3;
      this.$refs.categorySelect.selectedIndex = this.selectedCategory;

      console.log(this.types);

      this.$parent.show = true;
    },
    submit() {
      this.$emit("submit", {
        ldsp: this.$refs.ldspTexturePicker.index,
        facade: this.$refs.facadeTexturePicker.index,
        pattern: this.$refs.patternTexturePicker.index,
        worktop: this.$refs.worktopTexturePicker.index,
      });
      this.$parent.show = false;
    },
    close() {
      this.$parent.show = false;
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

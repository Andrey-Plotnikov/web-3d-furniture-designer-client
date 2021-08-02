<template>
  <div class="window-content">
    <div class="single-column">
      <div class="container">
        <div class="preview">
          <div class="block" id="module-container"></div>
        </div>
        <div class="title2">Фильтры</div>
        <div class="title1">Категория</div>
        <div class="selector">
          <select @change="optionChange($event, $event.target.selectedIndex)">
            <option>Прочее</option>
            <option>Кухонные тумбы</option>
            <option>Навесные шкафы</option>
            <option>Шкафы-купе</option>
            <option>Тумбы</option>
            <option>Столы</option>
          </select>
        </div>
        <div class="min-width">
          <fieldset>
            <legend>Минимальная ширина (мм)</legend>
            <input class="size-filter" ref="minWidth" />
          </fieldset>
        </div>
        <div class="min-height">
          <fieldset>
            <legend>Минимальная высота (мм)</legend>
            <input class="size-filter" ref="minHeight" />
          </fieldset>
        </div>
        <div class="min-depth">
          <fieldset>
            <legend>Минимальная глубина (мм)</legend>
            <input class="size-filter" ref="minDepth" />
          </fieldset>
        </div>
        <div class="max-width">
          <fieldset>
            <legend>Максимальная ширина (мм)</legend>
            <input class="size-filter" ref="maxWidth" />
          </fieldset>
        </div>
        <div class="max-height">
          <fieldset>
            <legend>Максимальная высота (мм)</legend>
            <input class="size-filter" ref="maxHeight" />
          </fieldset>
        </div>
        <div class="max-depth">
          <fieldset>
            <legend>Максимальная глубина (мм)</legend>
            <input class="size-filter" ref="maxDepth" />
          </fieldset>
        </div>
        <div class="apply-btn">
          <button @click="apply">Применить</button>
        </div>
        <div class="modules-list" v-if="isLoaded">
          <h4 v-show="modules.length == 0">Данная категория пустая</h4>
          <div
            class="module-item"
            v-for="(module, index) in modules"
            v-bind:key="index"
            @click="selectItem(index)"
          >
            <h4 :class="{ selected: selectedItem == index }">
              {{ module.name }}
            </h4>
            <p class="size">
              {{ module.width }}x{{ module.height }}x{{ module.depth }}
            </p>
          </div>
        </div>
      </div>
      <div class="footer-buttons">
        <button @click="submit">Сохранить</button>
        <button @click="close" class="sec">Отменить</button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { PreviewDesigner } from "@/model/designer/PreviewDesigner.js";
import * as THREE from "three";

export default {
  name: "furniture-library",
  data() {
    return {
      selectedCategory: 0,
      selectedItem: -1,
      modules: null,
      isLoaded: false,
    };
  },
  methods: {
    show() {
      this.$parent.show = true;
      if (this.designer === undefined) this.initPreview();
    },
    submit() {
      this.$parent.show = false;

      let content =
        this.selectedItem >= 0 ? this.modules[this.selectedItem].content : null;
      this.$emit("submit", content);
    },
    close() {
      this.$parent.show = false;
    },
    apply() {
      this.isLoaded = false;
      this.getModules();
    },
    checkInput(event, value, sizeName) {
      if (!value.match(/^-?\d*$/mu)) {
        event.target.value = this.size[sizeName];
        return;
      }
      this.size[sizeName] = value;
    },
    selectModule(module) {
      this.designer.restoreModule(module);
    },
    optionChange(event, value) {
      this.selectedCategory = value;
      this.selectItem(-1);
      this.isLoaded = false;
      this.getModules();
    },
    selectItem(index) {
      this.selectedItem = index;
      this.selectModule(
        this.selectedItem >= 0 ? this.modules[this.selectedItem].content : null
      );
    },
    initPreview() {
      const TEXTURE_PATH = "textures";
      const loadManager = new THREE.LoadingManager();
      const loader = new THREE.TextureLoader(loadManager);
      let textures = {};
      let isTextureLoadError = false;
      let texturesMeta = this.$store.getters.TEXTURES_META;

      loadManager.onError = () => {
        isTextureLoadError = true;
      };

      loadManager.onLoad = () => {
        if (isTextureLoadError) {
          console.log("Ошибка загрузки текстур");
          return;
        }

        this.designer = new PreviewDesigner(
          document.getElementById("module-container"),
          textures
        );
      };

      for (let category in texturesMeta) {
        textures[category] = [];
        for (let i = 0; i < texturesMeta[category].limit; i++) {
          let texture = { id: -1, object: null };
          texture.id = i;
          texture.object = loader.load(
            `${TEXTURE_PATH}/${texturesMeta[category].folder}/${i + 1}.${
              texturesMeta[category].extension
            }`
          );
          if (texturesMeta[category].isRepeat === true) {
            texture.object.wrapS = texture.object.wrapT = THREE.RepeatWrapping;
          }

          textures[category].push(texture);
        }
      }
    },
    getModules() {
      this.selectedItem = -1;

      let params = {
        category: this.selectedCategory,
      };
      if (this.$refs.minWidth.value !== "")
        params.min_width = +this.$refs.minWidth.value;
      if (this.$refs.maxWidth.value !== "")
        params.max_width = +this.$refs.maxWidth.value;
      if (this.$refs.minHeight.value !== "")
        params.min_height = +this.$refs.minHeight.value;
      if (this.$refs.maxHeight.value !== "")
        params.max_height = +this.$refs.maxHeight.value;
      if (this.$refs.minDepth.value !== "")
        params.min_depth = +this.$refs.minDepth.value;
      if (this.$refs.maxDepth.value !== "")
        params.max_depth = +this.$refs.maxDepth.value;

      axios
        .get(this.$store.getters.API_HOST + "/modules", { params: params })
        .then((response) => {
          if (response.data.code === 0) {
            this.modules = response.data.modules;
            this.isLoaded = true;
          } else {
            console.log(response.message);
          }
        });
    },
  },
  mounted() {
    this.getModules();
  },
};
</script>

<style scoped>
.container {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  grid-template-rows: auto auto auto auto;
  gap: 0.5rem 0.5rem;
  grid-auto-flow: row;
  align-items: center;
  grid-template-areas:
    "title1 title2 title2 title2"
    "selector min-width min-height min-depth"
    "apply-btn max-width max-height max-depth"
    "modules-list preview preview preview";
}
.preview {
  grid-area: preview;
}
.title2 {
  grid-area: title2;
}
.title1 {
  grid-area: title1;
}
.selector {
  grid-area: selector;
}
.min-width {
  grid-area: min-width;
}
.min-height {
  grid-area: min-height;
}
.min-depth {
  grid-area: min-depth;
}
.max-width {
  grid-area: max-width;
}
.max-height {
  grid-area: max-height;
}
.max-depth {
  grid-area: max-depth;
}
.apply-btn {
  grid-area: apply-btn;
}
.modules-list {
  grid-area: modules-list;
}

.apply-btn > button {
  width: 100%;
}

.full-height {
  height: 100%;
}

.selector > select {
  width: 100%;
}

.modules-list {
  overflow: auto;
  width: 100%;
  min-height: 50vh;
  max-height: 50vh;
}
.module-item {
  box-shadow: 0 0 0.5rem 0 rgba(0, 0, 0, 0.15);
  padding: 0.5rem;
  margin: 0.5rem;
  transition: linear 0.05s;
}
.module-item:hover {
  cursor: pointer;
  transform: scale(1.05, 1.05);
}
.selected {
  color: #2e7d32;
}
.module-item > h4 {
  margin: 0;
}
.module-item > .size {
  font-size: 0.9rem;
  color: #777777;
  margin-top: 0.3rem;
}

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
.size-filter {
  width: 13rem;
}
</style>

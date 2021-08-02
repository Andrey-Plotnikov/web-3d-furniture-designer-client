<template>
  <div class="texture-grid-container">
    <div class="texture-grid">
      <div
        v-for="(n, i) in textureMeta.limit"
        :key="n"
        :class="{ selected: i === index }"
      >
        <img
          class="sample-img"
          :src="
            'http://localhost:8080/textures/' +
            textureMeta.folder +
            '/' +
            n +
            '.' +
            textureMeta.extension
          "
          @click="setIndex(i)"
        />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "texture-picker",
  props: ["category"],
  data() {
    return {
      textureMeta: this.$store.getters.TEXTURES_META[this.category],
      index: 0,
    };
  },
  methods: {
    setIndex(n) {
      this.index = n;
    },
  },
};
</script>

<style scoped>
.sample-img {
  background-color: #cbcbcb;
}
.texture-grid-container {
  /* max-height: 24rem; */
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

.selected {
  background: blue;
}
</style>

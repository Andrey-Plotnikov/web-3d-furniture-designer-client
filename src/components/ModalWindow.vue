<template>
  <div class="modal-wrapper background" v-show="show">
    <div class="close-cross" @click="close()">×</div>
    <div class="window">
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: "modal-window",
  data: function () {
    return {
      show: false,
    };
  },
  methods: {
    close() {
      this.show = false;
      this.$emit("close");
    },
    submit() {
      this.show = false;
      this.$emit("submit");
    },
  },
};
</script>

<style>
.background {
  background-color: rgba(0, 0, 0, 0.2);
}
.close-cross {
  position: inherit;
  top: 1rem;
  right: 1rem;
  font-size: 2rem;
  color: #f44336;
}
.close-cross:hover {
  cursor: pointer;
  color: #d32f2f;
}
</style>

<template>
  <div class="context-menu" ref="menu">
    <ul>
      <li v-show="status.isOnePlate" @click="submit('size')"><a>Размер</a></li>
      <li v-show="status.isSelected" @click="submit('texture')">
        <a>Текстура</a>
      </li>
      <li v-show="status.isSelected" @click="submit('rotate')">
        <a>Повернуть</a>
      </li>
      <li v-show="status.isSelected" @click="submit('resetRotation')">
        <a>Сбросить поворот</a>
      </li>
      <li v-show="status.isOnePlate" @click="submit('shapeEditor')">
        <a>Редактор углов</a>
      </li>
      <li v-show="status.isFew" @click="submit('group')">
        <a>Сгруппировать</a>
      </li>
      <li v-show="status.isOneGroup" @click="submit('ungroup')">
        <a>Разгруппировать</a>
      </li>
      <li v-show="status.isSelected" @click="submit('copy')">
        <a>Копировать</a>
      </li>
      <li v-show="status.isSelected" @click="submit('cut')"><a>Вырезать</a></li>
      <li v-show="status.isBuffer" @click="submit('paste')"><a>Вставить</a></li>
      <li v-show="status.isSelected" @click="submit('delete')">
        <a>Удалить</a>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: "context-menu",
  data() {
    return {
      status: {
        isSelected: false,
        isOnePlate: false,
        isOneGroup: false,
        isFew: false,

        isLDSP: false,
        isDVP: false,
        isFacade: false,
        isWorktop: false,

        isBuffer: false,
        isUndo: false,
        isRedo: false,
      },
    };
  },
  methods: {
    show(status, x, y) {
      this.status = status;

      const size = this.$refs.menu.getBoundingClientRect();
      const bodySize = document.body.getBoundingClientRect();

      this.$refs.menu.style.left = `${
        x + size.width >= bodySize.width ? bodySize.width - size.width - 0.1 : x
      }px`;
      this.$refs.menu.style.top = `${
        y + size.height >= bodySize.height
          ? bodySize.height - size.height - 0.1
          : y
      }px`;
    },
    submit(action) {
      this.$parent.visible = false;
      this.$emit("submit", action);
    },
    close() {
      this.$refs.menu.style.left = `-9999px`;
      this.$refs.menu.style.top = `-9999px`;
    },
  },
};
</script>

<style scoped>
.context-menu {
  position: absolute;
  top: -9999px;
  left: -9999px;
  background-color: white;
  box-shadow: 0 0 0.5rem 0 rgba(0, 0, 0, 0.15);
}
.context-menu > ul {
  list-style-type: none;
  margin: 0;
  padding: 0;
}
.context-menu > ul > li {
  padding: 0.5rem 1rem;
}
.context-menu > ul > li:hover {
  cursor: pointer;
  background-color: #2e7d32;
}
.context-menu > ul > li:hover > a {
  color: white;
}
.context-menu > ul > li > a {
  color: black;
  text-decoration: none;
}
</style>

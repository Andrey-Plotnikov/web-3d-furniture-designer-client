<template>
  <div id="designer" class="wrapper">
    <input
      type="file"
      style="display: none"
      ref="fileInput"
      @change="restoreProject"
      accept="application/json"
    />
    <div class="designer-container">
      <div class="header-menu">
        <nav>
          <ul>
            <li>
              <a href="#" class="has-sub">Проект</a>
              <ul>
                <li
                  @click="$refs.projectProperties.show(designer.getProject())"
                >
                  <a>Свойства</a>
                </li>
                <li @click="$refs.projectSettings.show(designer.getSettings())">
                  <a>Настройки</a>
                </li>
                <li @click="$refs.roomTexture.show(designer.getRoomTextures())">
                  <a>Оформление помещения</a>
                </li>
                <li
                  @click="
                    $refs.screenshotLocalSave.show(designer.getProject().name)
                  "
                >
                  <a>Сохранить изображение сцены</a>
                </li>
                <li
                  @click="
                    $refs.projectLocalSave.show(designer.getProject().name)
                  "
                >
                  <a>Сохранить проект на устройстве</a>
                </li>
                <li
                  @click="showProjectServerSave"
                  v-show="this.$store.getters.IS_AUTH"
                >
                  <a>Сохранить проект на сервере</a>
                </li>
                <li @click="showFilePicker">
                  <a>Загрузить проект с устройства</a>
                </li>
                <li
                  @click="$refs.userProjects.show()"
                  v-show="this.$store.getters.IS_AUTH"
                >
                  <a>Загрузить проект с сервера</a>
                </li>
                <!-- <li @click="$refs.projectSending.show()"><a>Отправить проект изготовителю</a></li> -->
                <li
                  @click="$refs.userLogin.show()"
                  v-show="!this.$store.getters.IS_AUTH"
                >
                  <a>Войти в аккаунт</a>
                </li>
                <li
                  @click="$refs.userLogin.show()"
                  v-show="this.$store.getters.IS_AUTH"
                >
                  <a>Выйти из аккаунта</a>
                </li>
              </ul>
            </li>
            <li>
              <a href="#" class="has-sub">Создать</a>
              <ul>
                <li @click="$refs.plateCreation.show('ldsp')"><a>ЛДСП</a></li>
                <li @click="$refs.plateCreation.show('dvp')"><a>ДВП</a></li>
                <li @click="$refs.plateCreation.show('facade')">
                  <a>Фасад</a>
                </li>
                <li @click="$refs.plateCreation.show('worktop')">
                  <a>Столешница</a>
                </li>
              </ul>
            </li>
            <li>
              <a href="#" class="has-sub" @pointerenter="updateControlStatus"
                >Управление</a
              >
              <ul @click="updateControlStatus">
                <li :class="{ inactive: !selectionStatus.isOnePlate }">
                  <a @click="showObjectSize">Размер</a>
                </li>
                <li :class="{ inactive: !selectionStatus.isSelected }">
                  <a @click="showObjectTexture">Текстура</a>
                </li>
                <li :class="{ inactive: !selectionStatus.isSelected }">
                  <a @click="showObjectRotation">Повернуть</a>
                </li>
                <li :class="{ inactive: !selectionStatus.isSelected }">
                  <a @click="resetSelectedRotation">Сбросить поворот</a>
                </li>
                <li :class="{ inactive: !selectionStatus.isOnePlate }">
                  <a @click="showShapeEditor">Редактор углов</a>
                </li>
                <li :class="{ inactive: !selectionStatus.isFew }">
                  <a @click="designer.groupSelected()">Сгруппировать</a>
                </li>
                <li :class="{ inactive: !selectionStatus.isOneGroup }">
                  <a @click="designer.ungroupSelected()">Разгруппировать</a>
                </li>
                <li :class="{ inactive: !selectionStatus.isSelected }">
                  <a @click="designer.copySelected()">Копировать</a>
                </li>
                <li :class="{ inactive: !selectionStatus.isSelected }">
                  <a @click="designer.cutSelected()">Вырезать</a>
                </li>
                <li :class="{ inactive: !selectionStatus.isBuffer }">
                  <a @click="designer.pasteBuffered()">Вставить</a>
                </li>
                <li :class="{ inactive: !selectionStatus.isSelected }">
                  <a @click="designer.removeSelected()">Удалить</a>
                </li>
              </ul>
            </li>
            <li>
              <a href="#" class="has-sub">Камера</a>
              <ul>
                <li :class="{ inactive: currentCamera === 0 }">
                  <a @click="setCamera(0)">Свободная</a>
                </li>
                <li :class="{ inactive: currentCamera === 1 }">
                  <a @click="setCamera(1)">Вид спереди</a>
                </li>
                <li :class="{ inactive: currentCamera === 2 }">
                  <a @click="setCamera(2)">Вид сзади</a>
                </li>
                <li :class="{ inactive: currentCamera === 3 }">
                  <a @click="setCamera(3)">Вид слева</a>
                </li>
                <li :class="{ inactive: currentCamera === 4 }">
                  <a @click="setCamera(4)">Вид справа</a>
                </li>
                <li :class="{ inactive: currentCamera === 5 }">
                  <a @click="setCamera(5)">Вид сверху</a>
                </li>
                <li :class="{ inactive: currentCamera === 6 }">
                  <a @click="setCamera(6)">Вид снизу</a>
                </li>
              </ul>
            </li>
            <li>
              <a @click="showFurnitureLibrary">Библиотека</a>
            </li>
            <li class="_inactive">
              <a @click="undo">↺ Отменить</a>
            </li>
            <li class="_inactive">
              <a @click="redo">↻ Повторить</a>
            </li>
          </ul>
        </nav>
      </div>
      <div id="designer-container" class="canvas-container"></div>

      <modal-window>
        <user-login ref="userLogin" @submit="submitUserLogin"></user-login>
      </modal-window>

      <modal-window>
        <user-projects ref="userProjects"></user-projects>
      </modal-window>

      <modal-window>
        <user-info ref="userInfo"></user-info>
      </modal-window>

      <modal-window>
        <room-texture
          ref="roomTexture"
          @submit="submitRoomTexture"
        ></room-texture>
      </modal-window>

      <modal-window>
        <project-properties
          ref="projectProperties"
          @submit="submitProjectProperties"
        ></project-properties>
      </modal-window>

      <modal-window>
        <project-settings
          ref="projectSettings"
          @submit="submitProjectSettings"
        ></project-settings>
      </modal-window>

      <modal-window>
        <project-sending
          ref="projectSending"
          @submit="submitProjectSending"
        ></project-sending>
      </modal-window>

      <modal-window>
        <local-save
          ref="screenshotLocalSave"
          @submit="submitScreenshotLocalSave"
        ></local-save>
      </modal-window>

      <modal-window>
        <local-save
          ref="projectLocalSave"
          @submit="submitProjectLocalSave"
        ></local-save>
      </modal-window>

      <modal-window>
        <server-save
          ref="projectServerSave"
          @submit="submitProjectServerSave"
        ></server-save>
      </modal-window>

      <modal-window>
        <plate-creation
          ref="plateCreation"
          @submit="submitPlateCreation"
        ></plate-creation>
      </modal-window>

      <modal-window>
        <object-rotation
          ref="objectRotation"
          @submit="submitObjectRotation"
        ></object-rotation>
      </modal-window>

      <modal-window>
        <object-size ref="objectSize" @submit="submitObjectSize"></object-size>
      </modal-window>

      <modal-window>
        <object-texture
          ref="objectTexture"
          @submit="submitObjectTexture"
        ></object-texture>
      </modal-window>

      <modal-window>
        <shape-editor
          ref="shapeEditor"
          @submit="submitShapeEditor"
        ></shape-editor>
      </modal-window>

      <modal-window>
        <furniture-library
          ref="furnitureLibrary"
          @submit="submitFurnitureLibrary"
        ></furniture-library>
      </modal-window>

      <context-menu
        ref="contextMenu"
        @submit="submitContextMenu"
      ></context-menu>

      <loading-screen></loading-screen>
    </div>
  </div>
</template>

<script>
import { Designer } from "@/model/designer/Designer.js";

import LoadingScreen from "@/components/LoadingScreen.vue";
import ModalWindow from "@/components/ModalWindow.vue";
import ContextMenu from "@/components/ContextMenu.vue";

import UserLogin from "@/modals/UserLogin.vue";
import UserProjects from "@/modals/UserProjects.vue";
import UserInfo from "@/modals/UserInfo.vue";

import ProjectProperties from "@/modals/ProjectProperties.vue";
import ProjectSettings from "@/modals/ProjectSettings.vue";
import ProjectSending from "@/modals/ProjectSending.vue";
import LocalSave from "@/modals/LocalSave.vue";
import ServerSave from "@/modals/ServerSave.vue";
import RoomTexture from "@/modals/RoomTexture.vue";

import PlateCreation from "@/modals/PlateCreation.vue";

import ObjectSize from "@/modals/ObjectSize.vue";
import ObjectTexture from "@/modals/ObjectTexture.vue";
import ObjectRotation from "@/modals/ObjectRotation.vue";
import ShapeEditor from "@/modals/ShapeEditor.vue";

import FurnitureLibrary from "@/modals/FurnitureLibrary.vue";

import * as THREE from "three";

export default {
  name: "Designer",
  components: {
    LoadingScreen,
    ModalWindow,
    ContextMenu,

    UserLogin,
    UserProjects,
    UserInfo,
    RoomTexture,

    ProjectProperties,
    ProjectSettings,
    ProjectSending,
    LocalSave,
    ServerSave,

    "plate-creation": PlateCreation,

    ObjectSize,
    ObjectTexture,
    ObjectRotation,
    ShapeEditor,

    FurnitureLibrary,
  },
  data() {
    return {
      currentCamera: 0,

      rendererInfo: {
        memory: {
          geometries: 0,
          textures: 0,
        },
        render: {
          calls: 0,
          lines: 0,
          points: 0,
          triangles: 0,
        },
      },

      selectionStatus: {
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

      isLoaded: false,
    };
  },
  methods: {
    submitRoomTexture(textures) {
      this.designer.setRoomTextures(textures);
    },
    submitProjectProperties(project, isRecreate) {
      this.designer.setProject(project, isRecreate);
    },
    submitProjectSettings(settings) {
      this.designer.setSettings(settings);
    },
    submitProjectSending(data) {},
    submitScreenshotLocalSave() {},
    submitProjectLocalSave(filename) {
      this.designer.localSaveProject(filename + ".json");
    },

    showProjectServerSave() {
      this.$refs.projectServerSave.show(
        this.designer.getProject().name,
        this.designer.manager.saveProject()
      );
    },
    submitProjectServerSave() {},

    submitPlateCreation(plate) {
      if (this.$refs.plateCreation.type === "ldsp")
        this.designer.createLDSP(plate);
      if (this.$refs.plateCreation.type === "dvp")
        this.designer.createDVP(plate);
      if (this.$refs.plateCreation.type === "facade")
        this.designer.createFacade(plate);
      if (this.$refs.plateCreation.type === "worktop")
        this.designer.createWorktop(plate);
    },

    showShapeEditor() {
      let size = this.designer.getSelectedSize();
      let corners = this.designer.getSelectedCorners();
      if (size !== null && corners !== null)
        this.$refs.shapeEditor.show(size, corners);
    },
    submitShapeEditor(corners) {
      this.designer.setSelectedCorners(corners);
    },

    showObjectSize() {
      if (this.selectionStatus.isOnePlate)
        this.$refs.objectSize.show(this.designer.getSelectedSize());
    },
    submitObjectSize(size) {
      this.designer.setSelectedSize(size);
    },
    showObjectRotation() {
      if (this.selectionStatus.isSelected) this.$refs.objectRotation.show();
    },
    submitObjectRotation(rotation) {
      this.designer.rotateSelected(rotation.axis, rotation.angle);
    },
    showObjectTexture() {
      if (this.selectionStatus.isSelected) {
        this.updateControlStatus();
        this.$refs.objectTexture.show(
          this.selectionStatus.isLDSP,
          this.selectionStatus.isFacade,
          this.selectionStatus.isWorktop
        );
      }
    },
    submitObjectTexture(textures) {
      this.designer.setSelectedTextures(textures);
    },

    submitUserLogin() {
      this.$refs.projectProperties.show();
    },

    showFurnitureLibrary() {
      this.$refs.furnitureLibrary.show();
    },
    submitFurnitureLibrary(module) {
      this.designer.restoreModule(module);
    },

    submitContextMenu(action) {
      switch (action) {
        case "size":
          this.showObjectSize();
          break;
        case "texture":
          this.showObjectTexture();
          break;
        case "rotate":
          this.showObjectRotation();
          break;
        case "resetRotation":
          this.resetSelectedRotation();
          break;
        case "shapeEditor":
          this.showShapeEditor();
          break;
        case "group":
          this.designer.groupSelected();
          break;
        case "ungroup":
          this.designer.ungroupSelected();
          break;
        case "copy":
          this.designer.copySelected();
          break;
        case "cut":
          this.designer.cutSelected();
          break;
        case "paste":
          this.designer.pasteBuffered();
          break;
        case "delete":
          this.designer.removeSelected();
          break;
      }
    },

    canvasScreenshot() {
      this.designer.saveCanvasScreenshot();
    },

    resetSelectedRotation() {
      this.designer.resetSelectedRotation();
    },
    setCamera(id) {
      if (id !== this.currentCamera) {
        this.designer.setCamera(id);
        this.currentCamera = id;
      }
    },
    showFilePicker() {
      this.$refs.fileInput.click();
    },
    restoreProject() {
      if (this.$refs.fileInput.files && this.$refs.fileInput.files[0]) {
        let myFile = this.$refs.fileInput.files[0];
        let reader = new FileReader();

        reader.onload = (e) => {
          this.designer.restoreProject(e.target.result);
        };

        reader.readAsText(myFile);
      }
    },

    updateControlStatus() {
      this.selectionStatus = this.designer.manager.selectionStatus;
    },

    undo() {
      this.designer.undo();
    },
    redo() {
      this.designer.redo();
    },
  },
  mounted() {
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

      /** @type {Designer} */
      this.designer = new Designer(
        document.getElementById("designer-container"),
        textures
      );
      this.rendererInfo = this.designer.rendererInfo;
      this.selectionStatus = this.designer.manager.selectionStatus;

      this.designer.canvas.addEventListener("pointerdown", (e) => {
        if (e.button === 2) {
          this.pointerdown = {
            x: e.clientX,
            y: e.clientY,
          };
        }
      });
      this.designer.canvas.addEventListener("contextmenu", (e) => {
        if (
          this.pointerdown.x === e.clientX &&
          this.pointerdown.y === e.clientY
        ) {
          e.preventDefault();
          this.updateControlStatus();
          this.$refs.contextMenu.show(
            this.selectionStatus,
            e.clientX,
            e.clientY
          );
        } else {
          this.$refs.contextMenu.close();
        }
      });
      document.addEventListener("click", (e) => {
        this.$refs.contextMenu.close();
      });

      this.isLoaded = true;

      this.$refs.userLogin.showAsFirst();
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
};
</script>

<style scoped>
#designer {
  height: 100vh;
  max-height: 100vh;
}
.designer-container {
  width: 100%;
  height: 100%;
}
.header-menu {
  width: 100%;
  background-color: white;
}
.canvas-container {
  width: 100%;
  height: 100%;
}

canvas {
  min-width: 100%;
  min-height: 100%;
}

/*| Navigation |*/

nav {
  position: fixed;
  top: 0;
  left: 0;

  box-sizing: border-box;
  width: 100%;
  background: #fff;
  box-shadow: 0 3px 10px -2px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
}
nav .project-name {
  margin: auto 1rem;
}
nav *,
nav *:before,
nav *:after {
  box-sizing: border-box;
  padding: 0;
  margin: 0;
}
nav a.has-sub:after {
  content: "˅";
  display: inline-block;
  margin-left: 0.2rem;
}
nav a.has-sub:hover:after {
  transform: scaleY(-1);
}
nav ul {
  /*list-style: none;*/
  list-style-image: url(data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7);
  position: relative;
  float: left;
  display: inline-table;
}
nav ul li:hover {
  background: rgba(0, 0, 0, 0.15);
  cursor: pointer;
}
nav ul li:hover > ul {
  /* display: block; */
  top: 100%;
}
nav ul li {
  float: left;
}
nav ul li a {
  display: block;
  padding: 30px 20px;
  color: #222;
  font-size: 0.9em;
  letter-spacing: 1px;
  text-decoration: none;
  text-transform: uppercase;
}
nav ul ul {
  /* display: none; */
  background: #fff;
  position: absolute;
  /* top: 100%; */
  top: -9999px;
  box-shadow: -3px 3px 10px -2px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(0, 0, 0, 0.1);
}
nav ul ul li {
  float: none;
  position: relative;
}
nav ul ul li a {
  padding: 15px 30px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}
nav ul ul ul {
  position: absolute;
  left: 100%;
  top: 0;
}
nav li.inactive {
  cursor: default;
}
nav li.inactive:hover {
  cursor: default;
  background: none;
}
nav ul li.inactive a {
  color: #999999;
  cursor: default;
}
nav ul li.inactive a:hover {
  color: #999999;
  cursor: default;
}

.info-overlay {
  position: fixed;
  left: 0;
  bottom: 0;
  padding: 1rem;
  text-align: left;
}
.info-overlay h4 {
  margin: 0;
}
.info-overlay ul {
  list-style: none;
  padding: 0 1rem;
  margin: 0;
}
</style>

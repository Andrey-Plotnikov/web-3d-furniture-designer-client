import * as THREE from "three";

import { DragControls } from "./DragControls.js";
import { OrbitControls } from "./OrbitControls.js";
import { SceneManager } from "./SceneManager.js";

const NORMAL_TYPES = {
  X: 1,
  Y: 2,
  Z: 3,
};
Object.freeze(NORMAL_TYPES);

export class Designer {
  constructor(canvasContainer, textures) {
    this.animate = this.animate.bind(this);

    this.canvasContainer = canvasContainer;

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    console.log(`Three.js version: r${THREE.REVISION}`);
    console.log("Is WebGL2: " + this.renderer.capabilities.isWebGL2);

    this.canvas = this.renderer.domElement;

    this.cameras = {
      free: null,
      front: null,
      rear: null,
      left: null,
      right: null,
      top: null,
      bottom: null,
    };

    this.camera = null;
    this.manager = null;
    this.cameraControls = null;
    this.dragControls = null;

    this.cameraNormal = NORMAL_TYPES.Z;
    this.cameraNormalVector = new THREE.Vector3();

    this.rendererInfo = {
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
    };

    this.textures = textures;
    for (let category in this.textures) {
      for (let i = 0; i < this.textures[category].length; i++) {
        this.textures[category][
          i
        ].object.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
      }
    }

    this.isMoved = false;

    this.size = {
      width: 0,
      height: 0,
      depth: 0,
    };

    this.settings = {
      fov: 80,
      gridStep: 1000,
      isShowGrid: true,
      isShowEdges: true,
    };

    this.mouse = {
      down: new THREE.Vector2(),
      up: new THREE.Vector2(),
      last: new THREE.Vector2(),
    };

    this.status = {
      isAltKey: false,
      isCtrlKey: false,
      isShiftKey: false,
      isPointerDown: false,
      isPointerMoved: false,
    };

    this.init();
    this.animate();
  }

  createLDSP(plateMeta) {
    let plate = this.manager.createLDSP(
      plateMeta.size.width,
      plateMeta.size.height,
      plateMeta.size.depth,
      plateMeta.texture
    );
    plate.userData.setPosition(
      this.manager.project.size.width / 2,
      this.manager.project.size.height / 2,
      this.manager.project.size.depth / 2
    );
    this.manager.selectObject(plate);

    this.manager.snapshot();
  }

  createDVP(plateMeta) {
    let plate = this.manager.createDVP(
      plateMeta.size.width,
      plateMeta.size.height,
      plateMeta.size.depth,
      plateMeta.texture
    );
    plate.userData.setPosition(
      this.manager.project.size.width / 2,
      this.manager.project.size.height / 2,
      this.manager.project.size.depth / 2
    );
    this.manager.selectObject(plate);

    this.manager.snapshot();
  }

  createFacade(plateMeta) {
    let plate = this.manager.createFacade(
      plateMeta.size.width,
      plateMeta.size.height,
      plateMeta.size.depth,
      plateMeta.texture,
      plateMeta.pattern
    );
    plate.userData.setPosition(
      this.manager.project.size.width / 2,
      this.manager.project.size.height / 2,
      this.manager.project.size.depth / 2
    );
    this.manager.selectObject(plate);

    this.manager.snapshot();
  }

  createWorktop(plateMeta) {
    let plate = this.manager.createWorktop(
      plateMeta.size.width,
      plateMeta.size.height,
      plateMeta.size.depth,
      plateMeta.texture
    );
    plate.userData.setPosition(
      this.manager.project.size.width / 2,
      this.manager.project.size.height / 2,
      this.manager.project.size.depth / 2
    );
    this.manager.selectObject(plate);

    this.manager.snapshot();
  }

  restoreProject(projectJSON) {
    this.manager.restoreProject(projectJSON);
    this.manager.snapshot();
  }

  getMouseCoords(clientX, clientY) {
    let mouse = new THREE.Vector2();

    let rect = this.renderer.domElement.getBoundingClientRect();
    mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;

    return mouse;
  }

  init() {
    this.canvasContainer.appendChild(this.renderer.domElement);
    this.renderer.setSize(
      this.canvasContainer.clientWidth,
      this.canvasContainer.clientHeight
    );

    this.manager = new SceneManager(
      "Untitled",
      3000,
      2500,
      2000,
      this.textures
    );
    this.manager.snapshot();
    this.size = this.manager.project.size;
    this.settings = this.manager.settings;

    this.initCameras();
    this.camera = this.cameras.free;

    window.addEventListener("resize", (e) => {
      if (this.camera.type === "OrthographicCamera") {
        let aspect =
          this.canvasContainer.clientWidth / this.canvasContainer.clientHeight;

        this.camera.left = (this.size.width * 1.5 * aspect) / -2;
        this.camera.right = (this.size.width * 1.5 * aspect) / 2;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(
          this.canvasContainer.clientWidth,
          this.canvasContainer.clientHeight
        );
      }

      if (this.camera.type === "PerspectiveCamera") {
        this.camera.aspect =
          this.canvasContainer.clientWidth / this.canvasContainer.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(
          this.canvasContainer.clientWidth,
          this.canvasContainer.clientHeight
        );
      }
    });

    this.cameraControls = new OrbitControls(
      this.camera,
      this.renderer.domElement,
      this.manager.room.children
    );
    this.cameraControls.target = this.camera.userData.target0;
    this.camera.position.set(
      this.camera.userData.position0.x,
      this.camera.userData.position0.y,
      this.camera.userData.position0.z
    );
    this.cameraControls.update();

    this.cameraControls.addEventListener("change", (e) => {
      let cameraNormal = new THREE.Vector3();
      this.camera.getWorldDirection(cameraNormal);
      cameraNormal.x = Math.abs(cameraNormal.x);
      cameraNormal.y = Math.abs(cameraNormal.y);
      cameraNormal.z = Math.abs(cameraNormal.z);

      if (cameraNormal.x > cameraNormal.y) {
        if (cameraNormal.x > cameraNormal.z) {
          this.cameraNormal = NORMAL_TYPES.X;
          this.cameraNormalVector.set(1, 0, 0);
        } else {
          this.cameraNormal = NORMAL_TYPES.Z;
          this.cameraNormalVector.set(0, 0, 1);
        }
      } else {
        if (cameraNormal.y > cameraNormal.z) {
          this.cameraNormal = NORMAL_TYPES.Y;
          this.cameraNormalVector.set(0, 1, 0);
        } else {
          this.cameraNormal = NORMAL_TYPES.Z;
          this.cameraNormalVector.set(0, 0, 1);
        }
      }
    });

    let offset = new THREE.Vector3();
    let prevBox3 = null;

    this.dragControls = new DragControls(
      this.manager.container.children,
      this.camera,
      this.canvas
    );
    this.dragControls.addEventListener("dragstart", (e) => {
      this.isMoved = false;

      this.cameraControls.enabled = false;
      offset = e.object.position.clone();
      prevBox3 = e.object.userData.box3.clone();
    });
    this.dragControls.addEventListener("drag", (e) => {
      let oldPos = offset.clone();
      offset.subVectors(e.object.position.clone(), offset);

      let axes = null;
      let normal = null;
      let movableThresholds = [null, null];
      let obstaclesThresholds = [null, null];

      switch (this.cameraNormal) {
        case NORMAL_TYPES.X:
          axes = ["y", "z"];
          normal = "x";
          break;
        case NORMAL_TYPES.Y:
          axes = ["x", "z"];
          normal = "y";
          break;
        case NORMAL_TYPES.Z:
          axes = ["x", "y"];
          normal = "z";
          break;
      }

      let isMore = [false, false];

      for (let i = 0; i < 2; i++) {
        if (offset[axes[i]] > 0) {
          movableThresholds[i] = "max";
          obstaclesThresholds[i] = "min";
          isMore[i] = true;
        } else if (offset[axes[i]] <= 0) {
          movableThresholds[i] = "min";
          obstaclesThresholds[i] = "max";
        }
      }

      let minRanges = [+Infinity, +Infinity];
      let closestObjs = [null, null];

      let groups = [
        this.manager.room.children,
        this.manager.container.children,
      ];

      if (this.status.isShiftKey !== true) {
        for (let k = 0; k < groups.length; k++) {
          for (let i = 0; i < groups[k].length; i++) {
            let obst = groups[k][i];

            if (obst.userData.isSelected !== true) {
              let obstBox3 = obst.userData.box3;

              if (
                obstBox3.max[normal] > prevBox3.min[normal] &&
                obstBox3.min[normal] < prevBox3.max[normal]
              ) {
                for (let j = 0, k = 1; j < 2; j++, k--) {
                  if (
                    obstBox3.max[axes[k]] > prevBox3.min[axes[k]] &&
                    obstBox3.min[axes[k]] < prevBox3.max[axes[k]]
                  ) {
                    if (isMore[j]) {
                      if (obstBox3.min[axes[j]] >= prevBox3.min[axes[j]]) {
                        let range = Math.abs(
                          prevBox3[movableThresholds[j]][axes[j]] -
                            obstBox3[obstaclesThresholds[j]][axes[j]]
                        );
                        if (range < minRanges[j]) {
                          minRanges[j] = range;
                          closestObjs[j] = obst;
                        }
                      }
                    } else {
                      if (obstBox3.max[axes[j]] <= prevBox3.max[axes[j]]) {
                        let range = Math.abs(
                          prevBox3[movableThresholds[j]][axes[j]] -
                            obstBox3[obstaclesThresholds[j]][axes[j]]
                        );
                        if (range < minRanges[j]) {
                          minRanges[j] = range;
                          closestObjs[j] = obst;
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }

        for (let i = 0; i < 2; i++) {
          if (closestObjs[i] !== null) {
            if (isMore[i]) {
              if (
                e.object.userData.box3[movableThresholds[i]][axes[i]] >
                closestObjs[i].userData.box3[obstaclesThresholds[i]][axes[i]]
              ) {
                offset[axes[i]] =
                  closestObjs[i].userData.box3["min"][axes[i]] -
                  prevBox3["max"][axes[i]] -
                  0.0001;
              }
            } else {
              if (
                e.object.userData.box3[movableThresholds[i]][axes[i]] <
                closestObjs[i].userData.box3[obstaclesThresholds[i]][axes[i]]
              ) {
                offset[axes[i]] =
                  closestObjs[i].userData.box3["max"][axes[i]] -
                  prevBox3["min"][axes[i]] +
                  0.0001;
              }
            }
          }
        }
      }

      e.object.userData.setPosition(oldPos.x, oldPos.y, oldPos.z);
      for (let i = 0; i < this.manager.selected.length; i++) {
        this.manager.selected[i].userData.setPositionOffset(offset);
      }

      offset = e.object.position.clone();
      prevBox3 = e.object.userData.box3.clone();
      this.isMoved = true;
    });
    this.dragControls.addEventListener("dragend", (e) => {
      if (this.isMoved === true) this.manager.snapshot();
      this.cameraControls.enabled = true;
    });

    document.addEventListener("keydown", (e) => {
      if (e.code === "ShiftLeft" || e.code === "ShiftRight") {
        this.status.isShiftKey = true;
      }
    });
    document.addEventListener("keyup", (e) => {
      if (e.ctrlKey === true) {
        if (e.code === "KeyA") {
          e.preventDefault();
          this.manager.selectAll();
        }
        if (e.code === "KeyX") {
          this.manager.cutSelected();
        }
        if (e.code === "KeyC") {
          this.manager.copySelected();
        }
        if (e.code === "KeyV") {
          this.manager.pasteBuffered();
        }
        if (e.code === "KeyV") {
          this.manager.pasteBuffered();
        }
        if (e.code === "KeyZ") {
          this.undo();
        }
        if (e.code === "KeyY") {
          this.redo();
        }
      } else {
        if (e.code === "ShiftLeft" || e.code === "ShiftRight") {
          this.status.isShiftKey = false;
        }
        if (e.code === "Delete") {
          this.manager.removeSelected();
        }
      }
    });
    this.renderer.domElement.addEventListener("pointerdown", (e) => {
      this.status.isPointerDown = true;

      this.mouse.down = this.getMouseCoords(e.clientX, e.clientY);
    });

    this.renderer.domElement.addEventListener("pointermove", (e) => {
      if (this.status.isPointerDown) {
        this.status.isPointerMoved = true;
      }
    });

    this.renderer.domElement.addEventListener("pointerup", (e) => {
      this.mouse.up = this.getMouseCoords(e.clientX, e.clientY);

      if (this.status.isPointerMoved === false) {
        let ray = new THREE.Raycaster();
        ray.setFromCamera(this.mouse.down, this.camera);
        const intersects = ray.intersectObjects(
          this.manager.container.children,
          true
        );

        if (intersects.length > 0) {
          let selection = intersects[0].object;
          while (selection.parent.userData.isContainer !== true) {
            selection = selection.parent;
          }

          if (e.ctrlKey) {
            if (selection.userData.isSelected === false) {
              this.manager.addToSelection(selection);
            } else {
              this.manager.removeObjectFromSelection(selection);
            }
          } else {
            this.manager.selectObject(selection);
          }
        } else {
          this.manager.clearSelection();
        }
      }

      this.status.isPointerDown = false;
      this.status.isPointerMoved = false;
    });

    console.log("Done!");
  }

  animate() {
    requestAnimationFrame(this.animate);
    this.renderer.render(this.manager.scene, this.camera);

    this.rendererInfo.memory.geometries = this.renderer.info.memory.geometries;
    this.rendererInfo.memory.textures = this.renderer.info.memory.textures;
    this.rendererInfo.render.calls = this.renderer.info.render.calls;
    this.rendererInfo.render.lines = this.renderer.info.render.lines;
    this.rendererInfo.render.points = this.renderer.info.render.points;
    this.rendererInfo.render.triangles = this.renderer.info.render.triangles;
  }

  initCameras() {
    const width = this.size.width;
    const fov = this.settings.fov;
    const far = 25000;
    const near = 1;
    const size = width * 1.5;
    const aspect =
      this.canvasContainer.clientWidth / this.canvasContainer.clientHeight;

    this.cameras = {
      free: new THREE.PerspectiveCamera(
        fov,
        this.canvasContainer.clientWidth / this.canvasContainer.clientHeight,
        near,
        far
      ),
      front: new THREE.OrthographicCamera(
        (size * aspect) / -2,
        (size * aspect) / 2,
        size / 2,
        size / -2,
        near,
        far
      ),
      rear: new THREE.OrthographicCamera(
        (size * aspect) / -2,
        (size * aspect) / 2,
        size / 2,
        size / -2,
        near,
        far
      ),
      left: new THREE.OrthographicCamera(
        (size * aspect) / -2,
        (size * aspect) / 2,
        size / 2,
        size / -2,
        near,
        far
      ),
      right: new THREE.OrthographicCamera(
        (size * aspect) / -2,
        (size * aspect) / 2,
        size / 2,
        size / -2,
        near,
        far
      ),
      top: new THREE.OrthographicCamera(
        (size * aspect) / -2,
        (size * aspect) / 2,
        size / 2,
        size / -2,
        near,
        far
      ),
      bottom: new THREE.OrthographicCamera(
        (size * aspect) / -2,
        (size * aspect) / 2,
        size / 2,
        size / -2,
        near,
        far
      ),
    };

    for (let prop in this.cameras) {
      this.cameras[prop].layers.enable(1);
      this.cameras[prop].layers.enable(2);
      this.cameras[prop].userData.zoom0 = 1;
    }

    this.cameras.free.userData.position0 = new THREE.Vector3(
      this.size.width / 2,
      this.size.height / 2,
      this.size.depth * 2
    );
    this.cameras.front.userData.position0 = new THREE.Vector3(
      this.size.width / 2,
      this.size.height / 2,
      this.size.depth * 2
    );
    this.cameras.rear.userData.position0 = new THREE.Vector3(
      this.size.width / 2,
      this.size.height / 2,
      -this.size.depth * 2
    );
    this.cameras.left.userData.position0 = new THREE.Vector3(
      -this.size.width * 2,
      this.size.height / 2,
      this.size.depth / 2
    );
    this.cameras.right.userData.position0 = new THREE.Vector3(
      this.size.width * 2,
      this.size.height / 2,
      this.size.depth / 2
    );
    this.cameras.top.userData.position0 = new THREE.Vector3(
      this.size.width / 2,
      this.size.height * 2,
      this.size.depth / 2
    );
    this.cameras.bottom.userData.position0 = new THREE.Vector3(
      this.size.width / 2,
      -this.size.height * 2,
      this.size.depth / 2
    );

    this.cameras.free.userData.target0 = new THREE.Vector3(
      this.size.width / 2,
      this.size.height / 2,
      0
    );
    this.cameras.front.userData.target0 = new THREE.Vector3(
      this.size.width / 2,
      this.size.height / 2,
      0
    );
    this.cameras.rear.userData.target0 = new THREE.Vector3(
      this.size.width / 2,
      this.size.height / 2,
      this.size.depth
    );
    this.cameras.left.userData.target0 = new THREE.Vector3(
      this.size.width,
      this.size.height / 2,
      this.size.depth / 2
    );
    this.cameras.right.userData.target0 = new THREE.Vector3(
      0,
      this.size.height / 2,
      this.size.depth / 2
    );
    this.cameras.top.userData.target0 = new THREE.Vector3(
      this.size.width / 2,
      0,
      this.size.depth / 2
    );
    this.cameras.bottom.userData.target0 = new THREE.Vector3(
      this.size.width / 2,
      this.size.height,
      this.size.depth / 2
    );
  }

  saveCanvasScreenshot(name) {
    this.renderer.render(this.manager.scene, this.camera);

    this.canvas.toBlob((blob) => {
      if (name === undefined) name = this.manager.project.name;
      this.localDownloadFile(blob, `${name}.png`);
    });
  }

  localDownloadFile(blob, name) {
    let a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = name;
    a.click();
    a.remove();
  }

  localSaveProject(filename) {
    let json = this.manager.saveProject();
    this.localDownloadFile(new Blob([json], { type: "text/plain" }), filename);
  }

  removeSelected() {
    this.manager.removeSelected();
    this.manager.snapshot();
  }
  copySelected() {
    this.manager.copySelected();
    this.manager.snapshot();
  }
  cutSelected() {
    this.manager.cutSelected();
    this.manager.snapshot();
  }
  pasteBuffered() {
    this.manager.pasteBuffered();
    this.manager.snapshot();
  }

  setCamera(id) {
    if (id < 0 || id > 6) return;

    const props = ["free", "front", "rear", "left", "right", "top", "bottom"];
    this.camera = this.cameras[props[id]];

    this.cameraControls.enableRotate = !id;

    this.cameraControls.setCamera(this.camera);
    this.dragControls.setCamera(this.camera);
  }

  groupSelected() {
    this.manager.groupSelected();
    this.manager.snapshot();
  }

  ungroupSelected() {
    this.manager.ungroupSelected();
    this.manager.snapshot();
  }

  rotateSelected(axis, angle) {
    switch (axis) {
      case 0:
        this.manager.rotateSelectedX(angle);
        break;
      case 1:
        this.manager.rotateSelectedY(angle);
        break;
      case 2:
        this.manager.rotateSelectedZ(angle);
        break;
    }
    this.manager.snapshot();
  }

  resetSelectedRotation() {
    this.manager.resetSelectedRotation();
    this.manager.snapshot();
  }

  getSelectedCorners() {
    return this.manager.getSelectedCorners();
  }

  setSelectedCorners(corners) {
    this.manager.setSelectedCorners(corners);
    this.manager.snapshot();
  }

  getProject() {
    return this.manager.project;
  }

  setProject(project, isRecreate) {
    if (isRecreate === true) {
      this.manager.clearSelection();
      this.manager.clearContainer();
    }
    this.manager.project = project;
    this.manager.setRoomSize(
      project.size.width,
      project.size.height,
      project.size.depth,
      this.settings.gridStep
    );
    this.manager.snapshot();
  }

  getSettings() {
    return this.settings;
  }

  setSettings(settings) {
    if (this.settings.fov !== settings.fov) {
      this.settings.fov = settings.fov;
      this.cameras.free.fov = this.settings.fov;
      this.cameras.free.updateProjectionMatrix();
    }
    if (this.settings.gridStep !== settings.gridStep) {
      this.settings.gridStep = settings.gridStep;
      this.manager.recreateGrid(this.settings.gridStep);
    }
    if (this.settings.isShowGrid !== settings.isShowGrid) {
      this.settings.isShowGrid = settings.isShowGrid;
      for (let camera in this.cameras) {
        if (this.settings.isShowGrid === true) {
          this.cameras[camera].layers.enable(2);
        } else {
          this.cameras[camera].layers.disable(2);
        }
      }
    }
    if (this.settings.isShowEdges !== settings.isShowEdges) {
      this.settings.isShowEdges = settings.isShowEdges;
      for (let camera in this.cameras) {
        if (this.settings.isShowEdges === true) {
          this.cameras[camera].layers.enable(1);
        } else {
          this.cameras[camera].layers.disable(1);
        }
      }
    }
  }

  getSelectedSize() {
    return this.manager.getSelectedSize();
  }

  setSelectedSize(size) {
    this.manager.setSelectedSize(size);
    this.manager.snapshot();
  }

  getSelectionStatus() {
    return this.manager.selectionStatus;
  }

  getRoomTextures() {
    return {
      walls: this.manager.slabTextures.walls,
      floor: this.manager.slabTextures.floor,
    };
  }

  setRoomTextures(textures) {
    this.manager.setRoomTextures(textures);
    this.manager.snapshot();
  }

  restoreModule(module) {
    if (module !== null) {
      this.manager.restoreModule(module);
      this.manager.snapshot();
    }
  }

  undo() {
    this.manager.undo();
  }

  redo() {
    this.manager.redo();
  }

  setSelectedTextures(textures) {
    this.manager.setSelectedTextures(textures, this.manager.selected);
    this.manager.snapshot();
  }
}

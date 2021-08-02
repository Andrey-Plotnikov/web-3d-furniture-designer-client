import * as THREE from "three";

import { OrbitControls } from "./OrbitControls.js";
import { PreviewSceneManager } from "./PreviewSceneManager.js";

export class PreviewDesigner {
  constructor(canvasContainer, textures) {
    this.animate = this.animate.bind(this);

    this.canvasContainer = canvasContainer;
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.canvas = this.renderer.domElement;
    this.camera = null;
    this.scene = null;
    this.manager = null;
    this.cameraControls = null;
    this.isTextureLoadError = false;

    this.textures = textures;
    for (let category in this.textures) {
      for (let i = 0; i < this.textures[category].length; i++) {
        this.textures[category][
          i
        ].object.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
      }
    }

    this.settings = {
      fov: 80,
      gridStep: 1000,
      isShowGrid: true,
      isShowEdges: true,
    };

    this.init();
    this.animate();
  }

  restoreModule(projectJSON) {
    let box3 = this.manager.restoreModule(projectJSON);
    let size = {
      width: box3.max.x - box3.min.x,
      height: box3.max.y - box3.min.y,
      depth: box3.max.z - box3.min.z,
    };
    let center = {
      x: (box3.min.x + box3.max.x) / 2,
      y: (box3.min.y + box3.max.y) / 2,
      z: (box3.min.z + box3.max.z) / 2,
    };

    this.camera.userData.position0 = new THREE.Vector3(
      center.x,
      center.y,
      center.z + 2 * size.depth
    );
    this.camera.userData.target0 = new THREE.Vector3(
      center.x,
      center.y,
      center.z
    );
    this.cameraControls.reset();
    this.cameraControls.update();
  }

  init() {
    this.canvasContainer.appendChild(this.renderer.domElement);
    this.renderer.setSize(
      this.canvasContainer.clientWidth,
      this.canvasContainer.clientHeight
    );

    this.initCamera();

    this.manager = new PreviewSceneManager(this.textures);

    this.cameraControls = new OrbitControls(
      this.camera,
      this.renderer.domElement
    );
    this.cameraControls.enablePan = false;
    this.cameraControls.target = this.camera.userData.target0;
    this.camera.position.set(
      this.camera.userData.position0.x,
      this.camera.userData.position0.y,
      this.camera.userData.position0.z
    );
    this.cameraControls.update();

    console.log("Preview Done!");
  }

  animate() {
    requestAnimationFrame(this.animate);
    this.renderer.render(this.manager.scene, this.camera);
  }

  initCamera() {
    const fov = this.settings.fov;
    const far = 25000;
    const near = 1;

    this.camera = new THREE.PerspectiveCamera(
      fov,
      this.canvasContainer.clientWidth / this.canvasContainer.clientHeight,
      near,
      far
    );

    this.camera.layers.enable(1);
    this.camera.layers.enable(2);
    this.camera.userData.zoom0 = 1;

    this.camera.userData.position0 = new THREE.Vector3(0, 0, 0);
    this.camera.userData.target0 = new THREE.Vector3(0, 0, 0);
  }

  setProject(project) {
    this.manager.project = project;
    this.manager.setRoomSize(
      project.size.width,
      project.size.height,
      project.size.depth,
      this.settings.gridStep
    );
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
}

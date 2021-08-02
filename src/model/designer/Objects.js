import * as THREE from "three";
import { Corners } from "./Corner.js";

const AXIS_VECTORS = {
  X: new THREE.Vector3(1, 0, 0),
  Y: new THREE.Vector3(0, 1, 0),
  Z: new THREE.Vector3(0, 0, 1),

  NX: new THREE.Vector3(-1, 0, 0),
  NY: new THREE.Vector3(0, -1, 0),
  NZ: new THREE.Vector3(0, 0, -1),
};
Object.freeze(AXIS_VECTORS);

export const TYPES = {
  OTHER: -1,
  NONE: 0,
  CONTAINER: 1,
  GROUP: 2,
  ITEM: 1000,
  LDSP: 1001,
  DVP: 1002,
  FACADE: 1003,
  WORKTOP: 1004,
};
Object.freeze(TYPES);

export const ITEM_TYPES = {
  NONE: -1,
  OTHER: 0,
  LDSP: 1,
  DVP: 2,
  FACADE: 3,
  WORKTOP: 4,
};
Object.freeze(ITEM_TYPES);

var TEXTURES = null;

const UVGen = function (width, height) {
  function genTopUV(geometry, vertices, indexA, indexB, indexC) {
    let w = width / 1;
    let h = height / 1;

    return [
      new THREE.Vector2(vertices[indexA * 3] / w, vertices[indexA * 3 + 1] / h),
      new THREE.Vector2(vertices[indexB * 3] / w, vertices[indexB * 3 + 1] / h),
      new THREE.Vector2(vertices[indexC * 3] / w, vertices[indexC * 3 + 1] / h),
    ];
  }

  function genSideWallUV(geometry, vertices, idxA, idxB, idxC, idxD) {
    return [
      new THREE.Vector2(0, 1),
      new THREE.Vector2(0, 0),
      new THREE.Vector2(1, 0),
      new THREE.Vector2(1, 1),
    ];
  }

  return {
    generateTopUV: genTopUV,
    generateSideWallUV: genSideWallUV,
  };
};

let vertShader = `
    varying vec2 vUv;

    void main()
    {
        vUv = uv;
        vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
        gl_Position = projectionMatrix * mvPosition;
    }
`;

let fragShader = `
    #ifdef GL_ES
    precision highp float;
    #endif

    uniform sampler2D tOne;
    uniform sampler2D tSec;
    uniform float wRepeat;
    uniform float hRepeat;

    varying vec2 vUv;

    void main(void)
    {
        vec3 c;
        vec4 Ca = texture2D(tOne, vUv);
        vec4 Cb = texture2D(tSec, vUv * vec2(wRepeat, hRepeat));
        c = Ca.rgb * Ca.a + Cb.rgb * Cb.a * (1.0 - Ca.a);
        gl_FragColor = vec4(c, 1.0);
    }
`;

export class ObjectsTextures {
  constructor() {}

  static initTextures(textures) {
    TEXTURES = textures;
  }
}

export class Obj3D {
  constructor() {
    this.type = TYPES.OTHER;
    this.isContainer = false;
    this.isSelectable = true;
    this.isMovable = true;
    this.isCollided = false;
    this.isSelected = false;
    this.box3 = null;
    this.box3Size = {
      width: 0,
      height: 0,
      depth: 0,
    };
    this.box3Helper = null;
    this.obj3D = null;
  }

  toJSON() {
    this.obj3D.updateMatrix();
    return {
      type: this.type,
      position: this.obj3D.position.clone(),
      rotation: this.obj3D.rotation.clone(),
    };
  }

  updateBox3() {
    this.removeBox3Helper();
    this.calculateBox3();
  }

  removeBox3Helper() {
    this.obj3D.remove(this.box3Helper);
    this.box3Helper.geometry.dispose();
    this.box3Helper.material.dispose();

    this.box3Size = {
      width: 0,
      height: 0,
      depth: 0,
    };
  }

  calculateBox3() {
    this.box3 = new THREE.Box3().setFromObject(this.obj3D).clone();

    this.box3Helper = new THREE.BoxHelper(this.obj3D, 0x0000ff);
    this.box3Helper.visible = this.isSelected;
    this.obj3D.attach(this.box3Helper);

    this.box3Size.width = this.box3.max.x - this.box3.min.x;
    this.box3Size.height = this.box3.max.y - this.box3.min.y;
    this.box3Size.depth = this.box3.max.z - this.box3.min.z;
  }

  setSelected() {
    this.isSelected = true;
    this.box3Helper.visible = true;
  }

  setUnselected() {
    this.isSelected = false;
    this.box3Helper.visible = false;
  }

  setPositionOffset(offsetVector) {
    this.obj3D.position.add(offsetVector);
    this.box3.translate(offsetVector);
  }

  setPosition(x, y, z) {
    let offset = this.obj3D.position.clone();
    this.obj3D.position.set(x, y, z);
    offset.subVectors(this.obj3D.position, offset);
    this.box3.translate(offset);
  }

  rotateX(angle) {
    if (angle !== 0)
      this.obj3D.rotateOnWorldAxis(
        AXIS_VECTORS.X,
        THREE.MathUtils.degToRad(angle)
      );
    this.updateRotation();
    this.updateBox3();
  }

  rotateY(angle) {
    if (angle !== 0)
      this.obj3D.rotateOnWorldAxis(
        AXIS_VECTORS.Y,
        THREE.MathUtils.degToRad(angle)
      );
    this.updateRotation();
    this.updateBox3();
  }

  rotateZ(angle) {
    if (angle !== 0)
      this.obj3D.rotateOnWorldAxis(
        AXIS_VECTORS.Z,
        THREE.MathUtils.degToRad(angle)
      );
    this.updateRotation();
    this.updateBox3();
  }

  remove() {
    this.dispose();

    if (this.obj3D.parent !== null) this.obj3D.parent.remove(this.obj3D);
    this.obj3D = null;
  }

  dispose() {
    this.removeBox3Helper();
  }

  updateRotation() {}
}

export class Group extends Obj3D {
  constructor(objects) {
    super();
    this.type = TYPES.GROUP;
    this.children = [];

    this.obj3D = this.createObj3D(objects);
    this.calculateBox3();
  }

  toJSON() {
    const group = super.toJSON();

    let children = [];
    let length = this.obj3D.children.length;

    for (let i = 0; i < length; i++) {
      let child = this.obj3D.children[i];
      if (child !== this.box3Helper) {
        children.push(child.userData.toJSON());
      }
    }
    group.children = children;

    return group;
  }

  createObj3D(objects) {
    this.obj3D = new THREE.Group();
    this.obj3D.userData = this;

    for (let i = 0; i < objects.length; i++) {
      this.obj3D.attach(objects[i]);
      this.children.push(objects[i].userData);
      objects[i].userData.parent = this;
    }

    return this.obj3D;
  }

  ungroup() {
    let children = [];
    let length = this.obj3D.children.length;

    for (let i = 0; i < length; i++) {
      let child = this.obj3D.children[i];
      if (child !== this.box3Helper) {
        children.push(child);
      }
    }

    for (let i = 0; i < children.length; i++) {
      this.obj3D.parent.attach(children[i]);
      children[i].userData.updateBox3();
      children[i].userData.updateRotation();
    }

    this.remove();

    return children;
  }

  updateRotation() {
    let length = this.obj3D.children.length;

    for (let i = 0; i < length; i++) {
      let child = this.obj3D.children[i];
      if (child !== this.box3Helper) {
        child.userData.updateRotation();
        child.userData.updateBox3();
      }
    }
  }

  remove() {
    let children = [];

    for (let i = 0; i < this.obj3D.children.length; i++) {
      if (children[i] !== this.box3Helper)
        children.push(this.obj3D.children[i]);
    }

    for (let i = 0; i < children.length; i++) {
      this.obj3D.children[i].remove();
    }

    super.remove();
  }
}

export class Wall extends Obj3D {
  constructor(width, height, vector, gridStep) {
    super();
    this.itemType = null;
    this.isMovable = false;

    this.texture = null;
    this.edges = null;
    this.grid = null;
    this.gridStep = gridStep;
    this.size = {
      width: width,
      height: height,
      depth: 0,
    };
    this.normal = vector;

    this.obj3D = this.createObj3D(
      this.size.width,
      this.size.height,
      this.normal,
      gridStep
    );
    this.calculateBox3();
  }

  createObj3D(width, height, normalVector, gridStep) {
    let plane = this.createPlane(width, height, normalVector, gridStep);
    return plane;
  }

  recreateGrid(lineStep) {
    this.obj3D.remove(this.grid);
    this.grid.geometry.dispose();
    this.grid.material.dispose();

    this.grid = this.createGrid(lineStep);
    this.obj3D.add(this.grid);
  }

  createPlane(width, height, vector, gridStep) {
    const geometry = new THREE.PlaneGeometry(width, height);
    const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const plane = new THREE.Mesh(geometry, material);

    if (vector.x > 0.5) plane.rotateY(THREE.MathUtils.degToRad(90));
    else if (vector.x < -0.5) plane.rotateY(THREE.MathUtils.degToRad(-90));
    if (vector.y > 0.5) plane.rotateX(THREE.MathUtils.degToRad(-90));
    else if (vector.y < -0.5) plane.rotateX(THREE.MathUtils.degToRad(90));
    else if (vector.z < -0.5) plane.rotateY(THREE.MathUtils.degToRad(180));
    plane.userData = this;

    this.edges = new THREE.LineSegments(
      new THREE.EdgesGeometry(geometry),
      new THREE.LineBasicMaterial({
        color: 0xd5d5d5,
        depthFunc: THREE.AlwaysDepth,
      })
    );
    this.grid = this.createGrid(gridStep);
    plane.add(this.edges);
    plane.add(this.grid);

    this.normal = vector;
    plane.onBeforeRender = function onBeforeRender(
      renderer,
      scene,
      camera,
      geometry,
      material,
      group
    ) {
      if (
        new THREE.Vector3()
          .subVectors(
            camera.position,
            this.getWorldPosition(new THREE.Vector3())
          )
          .dot(this.userData.normal) < 0
      ) {
        this.userData.edges.visible = false;
        this.userData.grid.visible = false;
      } else {
        this.userData.edges.visible = true;
        this.userData.grid.visible = true;
      }
    };

    return plane;
  }

  createGrid(gridStep) {
    const width = this.size.width;
    const height = this.size.height;

    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0xd5d5d5,
      depthFunc: THREE.AlwaysDepth,
    });

    let hWidth = width / 2;
    let hHeight = height / 2;
    let points = [];

    for (let i = gridStep; i < width; i += gridStep) {
      points.push(new THREE.Vector3(i - hWidth, 0 - hHeight, 0));
      points.push(new THREE.Vector3(i - hWidth, height - hHeight, 0));
    }

    for (let i = gridStep; i < height; i += gridStep) {
      points.push(new THREE.Vector3(0 - hWidth, i - hHeight, 0));
      points.push(new THREE.Vector3(hWidth, i - hHeight, 0));
    }

    let grid = new THREE.LineSegments(
      new THREE.BufferGeometry().setFromPoints(points),
      lineMaterial
    );
    grid.layers.set(2);
    return grid;
  }

  dispose() {
    this.obj3D.remove(this.edges);
    this.edges.geometry.dispose();
    this.edges.material.dispose();
    this.edges = null;

    this.obj3D.remove(this.grid);
    this.grid.geometry.dispose();
    this.grid.material.dispose();
    this.grid = null;

    this.obj3D.geometry.dispose();
    this.obj3D.material.dispose();

    this.removeBox3Helper();
  }
}

export class Item extends Obj3D {
  constructor(width, height, depth, texture, corners) {
    super();
    this.type = TYPES.ITEM;
    this.itemType = null;
    this.texture = texture;

    if (corners === undefined || corners === null) corners = new Corners();
    else corners = new Corners(corners.NE, corners.SE, corners.SW, corners.NW);

    this.corners = corners;
    this.edges = null;
    this.size = {
      width: width,
      height: height,
      depth: depth,
    };
  }

  create(material) {
    this.obj3D = this.createObj3D(
      this.size.width,
      this.size.height,
      this.size.depth,
      material,
      this.corners
    );

    this.calculateBox3();
    this.updateRotation();
  }

  toJSON() {
    const item = super.toJSON();
    item.itemType = this.itemType;
    item.corners = this.corners;
    item.texture = this.texture.id;
    item.size = {
      width: this.size.width,
      height: this.size.height,
      depth: this.size.depth,
    };

    return item;
  }

  setSelected() {
    super.setSelected();
  }

  setUnselected() {
    super.setUnselected();
  }

  setSize(width, height, depth) {
    let widthScale = width / this.size.width;
    let heightScale = height / this.size.height;

    this.size.width = width;
    this.size.height = height;
    this.size.depth = depth;

    this.corners.NW.out = Math.round(this.corners.NW.out * widthScale);
    this.corners.NE.in = Math.round(this.corners.NE.in * widthScale);
    this.corners.SE.out = Math.round(this.corners.SE.out * widthScale);
    this.corners.SW.in = Math.round(this.corners.SW.in * widthScale);

    this.corners.NW.in = Math.round(this.corners.NW.in * heightScale);
    this.corners.SW.out = Math.round(this.corners.SW.out * heightScale);
    this.corners.NE.out = Math.round(this.corners.NE.out * heightScale);
    this.corners.SE.in = Math.round(this.corners.SE.in * heightScale);

    let parent = this.obj3D.parent;
    let oldRotation = this.obj3D.rotation.clone();
    let oldPosition = this.obj3D.position.clone();
    let material = this.obj3D.material;

    this.remove();

    this.obj3D = this.createObj3D(width, height, depth, material, this.corners);
    this.obj3D.position.set(oldPosition.x, oldPosition.y, oldPosition.z);
    this.obj3D.rotation.set(oldRotation.x, oldRotation.y, oldRotation.z);

    this.obj3D.userData = this;
    this.calculateBox3();
    this.updateRotation();

    parent.add(this.obj3D);
  }

  rotateX(angle) {
    if (angle !== 0)
      this.obj3D.rotateOnWorldAxis(
        AXIS_VECTORS.X,
        THREE.MathUtils.degToRad(angle)
      );
    this.updateBox3();
    this.updateRotation();
  }

  rotateY(angle) {
    if (angle !== 0)
      this.obj3D.rotateOnWorldAxis(
        AXIS_VECTORS.Y,
        THREE.MathUtils.degToRad(angle)
      );
    this.updateBox3();
    this.updateRotation();
  }

  rotateZ(angle) {
    if (angle !== 0)
      this.obj3D.rotateOnWorldAxis(
        AXIS_VECTORS.Z,
        THREE.MathUtils.degToRad(angle)
      );
    this.updateBox3();
    this.updateRotation();
  }

  resetRotation() {
    this.obj3D.rotation.set(0, 0, 0);
    this.updateBox3();
    this.updateRotation();
  }

  updateRotation() {
    let m = new THREE.Matrix4();
    this.obj3D.geometry.applyMatrix4(m.extractRotation(this.obj3D.matrixWorld));
    this.obj3D.geometry.computeBoundingBox();
    this.obj3D.geometry.applyMatrix4(m.invert());
  }

  setCorners(corners) {
    this.corners = new Corners(corners.NE, corners.SE, corners.SW, corners.NW);

    let parent = this.obj3D.parent;
    let oldRotation = this.obj3D.rotation.clone();
    let oldPosition = this.obj3D.position.clone();
    let material = this.obj3D.material;

    this.remove();

    this.obj3D = this.createObj3D(
      this.size.width,
      this.size.height,
      this.size.depth,
      material,
      this.corners
    );
    this.obj3D.position.set(oldPosition.x, oldPosition.y, oldPosition.z);
    this.obj3D.rotation.set(oldRotation.x, oldRotation.y, oldRotation.z);

    this.obj3D.userData = this;
    this.calculateBox3();
    this.updateRotation();

    parent.add(this.obj3D);
  }

  dispose() {
    this.obj3D.remove(this.edges);
    this.edges.geometry.dispose();
    this.edges.material.dispose();
    this.edges = null;

    this.obj3D.geometry.dispose();
    this.obj3D.material.dispose();

    this.removeBox3Helper();
  }

  updateTexture(texture) {
    this.texture = texture;
    let newMaterial = this.createMaterial();
    let oldMaterial = this.obj3D.material;
    console.log(this.obj3D);
    this.obj3D.material = newMaterial;
    oldMaterial.dispose();
  }

  createMaterial() {}

  createObj3D(width, height, depth, material, corners) {
    const shape = new THREE.Shape();

    corners.createShape(shape, width, height);

    const extrudeSettings = {
      steps: 1,
      depth: depth,
      curveSegments: 8,
      bevelEnabled: false,
      UVGenerator: UVGen(width, height),
    };

    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);

    const mesh = new THREE.Mesh(geometry, material);
    mesh.userData = this;
    geometry.translate(-width / 2, -height / 2, -depth / 2);

    this.edges = new THREE.LineSegments(
      new THREE.EdgesGeometry(geometry),
      new THREE.LineBasicMaterial({ color: 0x000000 })
    );
    this.edges.layers.set(1);
    mesh.add(this.edges);
    mesh.userData = this;

    return mesh;
  }
}

export class LDSP extends Item {
  constructor(width, height, depth, texture, corners) {
    super(width, height, depth, texture, corners);

    this.type = TYPES.LDSP;
    this.itemType = ITEM_TYPES.LDSP;

    let material = this.createMaterial();
    this.create(material);
  }

  createMaterial() {
    return new THREE.MeshBasicMaterial({
      color: 0xffffff,
      map: TEXTURES["wood"][this.texture.id].object,
    });
  }
}

export class DVP extends Item {
  constructor(width, height, depth, texture, corners) {
    super(width, height, depth, texture, corners);

    this.type = TYPES.DVP;
    this.itemType = ITEM_TYPES.DVP;

    let material = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      map: texture.object,
    });
    this.create(material);
  }

  createMaterial() {
    return new THREE.MeshBasicMaterial({
      color: 0xffffff,
      map: TEXTURES["plywood"][this.texture.id].object,
    });
  }
}

export class Facade extends Item {
  constructor(width, height, depth, texture, pattern, corners) {
    super(width, height, depth, texture, corners);

    this.type = TYPES.FACADE;
    this.itemType = ITEM_TYPES.FACADE;

    this.pattern = pattern;
    let material = new THREE.ShaderMaterial({
      uniforms: {
        tOne: { type: "t", value: this.pattern.object },
        tSec: { type: "t", value: this.texture.object },
        wRepeat: { type: "", value: 1.0 },
        hRepeat: { type: "", value: 1.0 },
      },
      vertexShader: vertShader,
      fragmentShader: fragShader,
    });

    this.create(material);
  }

  updateTexture(texture, pattern) {
    this.pattern = pattern;
    super.updateTexture(texture);
  }

  createMaterial() {
    return new THREE.ShaderMaterial({
      uniforms: {
        tOne: { type: "t", value: TEXTURES["pattern"][this.pattern.id].object },
        tSec: { type: "t", value: TEXTURES["wood"][this.texture.id].object },
        wRepeat: { type: "", value: 1.0 },
        hRepeat: { type: "", value: 1.0 },
      },
      vertexShader: vertShader,
      fragmentShader: fragShader,
    });
  }

  toJSON() {
    const item = super.toJSON();
    item.pattern = this.pattern.id;

    return item;
  }
}

export class Worktop extends Item {
  constructor(width, height, depth, texture, corners) {
    super(width, height, depth, texture, corners);

    this.type = TYPES.WORKTOP;
    this.itemType = ITEM_TYPES.WORKTOP;

    let material = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      map: texture.object,
    });
    this.create(material);
  }

  createMaterial() {
    return new THREE.MeshBasicMaterial({
      color: 0xffffff,
      map: TEXTURES["stone"][this.texture.id].object,
    });
  }
}

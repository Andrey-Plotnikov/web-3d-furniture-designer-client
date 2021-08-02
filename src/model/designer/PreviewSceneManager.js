import * as THREE from "three";
import {
  TYPES,
  ITEM_TYPES,
  Group,
  LDSP,
  DVP,
  Facade,
  Worktop,
  Wall,
} from "./Objects.js";

export class PreviewSceneManager {
  constructor(textures) {
    this.textures = textures;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xf4f4f4);
    this.scene.userData.isContainer = true;
    this.scene.userData.type = TYPES.CONTAINER;

    this.container = new THREE.Group();
    this.container.userData.type = TYPES.CONTAINER;
    this.container.userData.isContainer = true;

    this.scene.add(this.container);
  }

  clearContainer() {
    let objects = this.container.children;
    let length = objects.length;

    for (let i = 0; i < length; i++) {
      objects[0].userData.remove();
    }
  }

  createGroup(objects) {
    let group = new Group(objects).obj3D;
    this.container.attach(group);

    return group;
  }

  restoreGroup(metaObject, children) {
    let obj3D = this.createGroup(children);

    obj3D.position.set(
      metaObject.position.x,
      metaObject.position.y,
      metaObject.position.z
    );
    obj3D.rotation.set(
      metaObject.rotation._x,
      metaObject.rotation._y,
      metaObject.rotation._z
    );
    obj3D.userData.updateBox3();

    return obj3D;
  }

  createLDSP(width, height, depth, texture, corners) {
    let obj3D = new LDSP(
      width,
      height,
      depth,
      this.textures.wood[texture],
      corners
    ).obj3D;
    this.container.add(obj3D);

    return obj3D;
  }

  createDVP(width, height, depth, texture, corners) {
    let obj3D = new DVP(width, height, depth, this.textures.plywood[0], corners)
      .obj3D;
    this.container.add(obj3D);

    return obj3D;
  }

  createFacade(width, height, depth, texture, pattern, corners) {
    let obj3D = new Facade(
      width,
      height,
      depth,
      this.textures.wood[texture],
      this.textures.pattern[pattern],
      corners
    ).obj3D;
    this.container.add(obj3D);

    return obj3D;
  }

  createWorktop(width, height, depth, texture, corners) {
    let obj3D = new Worktop(
      width,
      height,
      depth,
      this.textures.stone[texture],
      corners
    ).obj3D;
    this.container.add(obj3D);

    return obj3D;
  }

  restoreObject(metaObject) {
    let obj3D = null;

    if (metaObject.type == TYPES.GROUP) {
      let children = [];

      for (let i = 0; i < metaObject.children.length; i++) {
        children.push(this.restoreObject(metaObject.children[i]));
      }

      obj3D = this.restoreGroup(metaObject, children);
    } else {
      switch (metaObject.type) {
        case TYPES.LDSP:
          obj3D = this.createLDSP(
            metaObject.size.width,
            metaObject.size.height,
            metaObject.size.depth,
            metaObject.texture,
            metaObject.corners
          );
          break;
        case TYPES.DVP:
          obj3D = this.createDVP(
            metaObject.size.width,
            metaObject.size.height,
            metaObject.size.depth,
            metaObject.texture,
            metaObject.corners
          );
          break;
        case TYPES.FACADE:
          obj3D = this.createFacade(
            metaObject.size.width,
            metaObject.size.height,
            metaObject.size.depth,
            metaObject.texture,
            metaObject.pattern,
            metaObject.corners
          );
          break;
        case TYPES.WORKTOP:
          obj3D = this.createWorktop(
            metaObject.size.width,
            metaObject.size.height,
            metaObject.size.depth,
            metaObject.texture,
            metaObject.corners
          );
          break;
      }

      obj3D.position.set(
        metaObject.position.x,
        metaObject.position.y,
        metaObject.position.z
      );
      obj3D.rotation.set(
        metaObject.rotation._x,
        metaObject.rotation._y,
        metaObject.rotation._z
      );
      obj3D.userData.updateBox3();
      obj3D.userData.updateRotation();
    }

    return obj3D;
  }

  restoreObjects(objects) {
    let topObjects = objects;

    for (let i = 0; i < topObjects.length; i++) {
      let obj3D = this.restoreObject(topObjects[i]);
      this.container.attach(obj3D);
    }
  }

  restoreModule(json) {
    this.clearContainer();

    if (json !== null) {
      let project = JSON.parse(json);
      this.restoreObjects(project.objects);

      let box3 = this.container.children[0].userData.box3;
      return box3;
    } else {
      return {
        min: {
          x: 0,
          y: 0,
          z: 0,
        },
        max: {
          x: 0,
          y: 0,
          z: 0,
        },
      };
    }
  }
}

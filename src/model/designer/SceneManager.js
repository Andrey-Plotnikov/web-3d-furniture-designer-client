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
  ObjectsTextures,
} from "./Objects.js";

const MAX_ACTION_QUEUE_LENGTH = 100;

export class SceneManager {
  constructor(name, width, height, depth, textures) {
    this.project = {
      name: name,
      size: {
        width: width,
        height: height,
        depth: depth,
      },
    };
    this.textures = textures;
    ObjectsTextures.initTextures(textures);
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xf4f4f4);
    this.scene.userData.isContainer = true;
    this.scene.userData.type = TYPES.CONTAINER;

    this.current = null;
    this.selected = [];
    this.buffer = [];
    this.actionQueue = {
      current: -1,
      queue: [],
    };

    this.settings = {
      fov: 80,
      gridStep: 1000,
      isShowGrid: true,
      isShowEdges: true,
    };

    this.room = this.createRoom(width, height, depth, 1000);
    this.slabTextures = {
      walls: -1,
      floor: -1,
    };

    this.container = new THREE.Group();
    this.container.userData.type = TYPES.CONTAINER;
    this.container.userData.isContainer = true;

    this.scene.add(this.container);
    this.scene.add(this.room);

    this.selectionStatus = {
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
    };
  }

  setRoomSize(width, height, depth, gridStep) {
    this.scene.remove(this.room);

    let length = this.room.children.length;
    for (let i = 0; i < length; i++) {
      this.room.children[0].userData.remove();
    }

    this.room = this.createRoom(width, height, depth, gridStep);
    this.scene.add(this.room);
  }

  createRoom(width, height, depth, gridStep) {
    let room = new THREE.Group();
    const normals = [
      new THREE.Vector3(-1, 0, 0),
      new THREE.Vector3(1, 0, 0),
      new THREE.Vector3(0, 0, -1),
      new THREE.Vector3(0, 0, 1),
      new THREE.Vector3(0, -1, 0),
      new THREE.Vector3(0, 1, 0),
    ];
    for (let i = 0; i < normals.length; i++) {
      let plane = null;
      if (normals[i].x !== 0)
        plane = new Wall(depth, height, normals[i], gridStep);
      if (normals[i].y !== 0)
        plane = new Wall(width, depth, normals[i], gridStep);
      if (normals[i].z !== 0)
        plane = new Wall(width, height, normals[i], gridStep);
      plane.setPosition(
        width / 2 - (width / 2) * normals[i].x,
        height / 2 - (height / 2) * normals[i].y,
        depth / 2 - (depth / 2) * normals[i].z
      );
      room.add(plane.obj3D);
    }

    room.renderOrder = -1;
    return room;
  }

  setRoomTextures(textures) {
    this.slabTextures.walls = textures.walls;
    this.slabTextures.floor = textures.floor;

    for (let i = 0; i < 4; i++) {
      this.room.children[i].material.map =
        textures.walls === -1
          ? null
          : this.textures.wall[textures.walls].object;
      this.room.children[i].material.needsUpdate = true;
    }
    this.room.children[5].material.map =
      textures.floor === -1 ? null : this.textures.floor[textures.floor].object;
    this.room.children[5].material.needsUpdate = true;
  }

  recreateGrid(lineStep) {
    for (let i = 0; i < this.room.children.length; i++) {
      this.room.children[i].userData.recreateGrid(lineStep);
    }
  }

  selectAll() {
    let objects = this.container.children;
    let length = objects.length;

    for (let i = 0; i < length; i++) {
      this.addToSelection(objects[i]);
    }
  }

  copySelected() {
    this.buffer = [];

    let length = this.selected.length;
    let objects = this.selected;
    let tmp = [];

    for (let i = 0; i < length; i++) {
      tmp.push(objects[i]);
    }

    this.buffer = this.saveBuffered(tmp);
    this.selectionStatus.isBuffer = true;
  }

  cutSelected() {
    this.buffer = [];

    let length = this.selected.length;
    let objects = this.selected;
    let tmp = [];

    for (let i = 0; i < length; i++) {
      tmp.push(objects[i]);
    }

    this.buffer = this.saveBuffered(tmp);
    this.removeSelected();
    this.selectionStatus.isBuffer = true;
  }

  pasteBuffered() {
    this.restoreBuffered(this.buffer);
  }

  removeSelected() {
    let a = [];
    for (let i = 0; i < this.selected.length; i++) {
      a.push(this.selected[i].userData);
      this.selected[i].userData.remove();
    }

    this.selected = [];
    this.checkSelection();
  }

  checkObjects(objects) {
    for (let i = 0; i < objects.length; i++) {
      switch (objects[i].userData.type) {
        case TYPES.GROUP:
          let children = [];

          console.log(objects[i]);
          for (let j = 0; j < objects[i].children.length; j++) {
            if (objects[i].children[j] !== objects[i].userData.box3Helper) {
              children.push(objects[i].children[j]);
            }
          }

          console.log(children);
          this.checkObjects(children);
          break;
        case TYPES.LDSP:
          this.selectionStatus.isLDSP = true;
          break;
        case TYPES.DVP:
          this.selectionStatus.isDVP = true;
          break;
        case TYPES.FACADE:
          this.selectionStatus.isFacade = true;
          break;
        case TYPES.WORKTOP:
          this.selectionStatus.isWorktop = true;
          break;
      }
    }
  }

  checkSelection() {
    this.selectionStatus.isSelected = false;
    this.selectionStatus.isOnePlate = false;
    this.selectionStatus.isOneGroup = false;
    this.selectionStatus.isFew = false;

    this.selectionStatus.isLDSP = false;
    this.selectionStatus.isDVP = false;
    this.selectionStatus.isFacade = false;
    this.selectionStatus.isWorktop = false;

    if (this.selected.length > 0) {
      this.selectionStatus.isSelected = true;

      if (this.selected.length === 1) {
        this.selectionStatus.one = true;

        if (this.selected[0].userData.type === TYPES.GROUP) {
          this.selectionStatus.isOneGroup = true;
        } else if (this.selected[0].userData.type > TYPES.ITEM) {
          this.selectionStatus.isOnePlate = true;
        }

        this.checkObjects(this.selected);
      } else if (this.selected.length > 1) {
        this.selectionStatus.isFew = true;
        this.checkObjects(this.selected);
      }
    }
  }

  clearSelection() {
    if (this.selected.length > 0) {
      for (let i = 0; i < this.selected.length; i++) {
        this.selected[i].userData.setUnselected();
      }

      this.selected = [];
    }
    this.checkSelection();
  }

  selectObject(object) {
    this.clearSelection();

    if (
      object.userData.isSelectable === true &&
      object.userData.isSelected === false
    ) {
      object.userData.setSelected();
      this.selected = [object];
    }
    this.checkSelection();
  }

  addToSelection(object) {
    if (
      object.userData.isSelectable === true &&
      object.userData.isSelected === false
    ) {
      object.userData.setSelected();
      this.selected.push(object);
    }
    this.checkSelection();
  }

  removeObjectFromSelection(object) {
    if (object.userData.isSelected === true) {
      object.userData.setUnselected();
      this.selected.splice(this.selected.indexOf(object), 1);
    }
    this.checkSelection();
  }

  clearContainer() {
    let objects = this.container.children;
    let length = objects.length;

    for (let i = 0; i < length; i++) {
      objects[0].userData.remove();
    }

    this.clearSelection();
  }

  groupSelected() {
    if (this.selected.length > 1) {
      let group = new Group(this.selected).obj3D;
      this.container.attach(group);
      this.selectObject(group);

      return group;
    }

    return null;
  }

  ungroupSelected() {
    let group = this.selected[0];
    this.clearSelection();
    group.userData.ungroup();
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

  restoreProject(json) {
    this.clearSelection();
    this.clearContainer();

    let project = JSON.parse(json);

    this.project.name = project.name;
    this.size = project.room.size;

    this.setRoomSize(this.size.width, this.size.height, this.size.depth, 1000);
    this.setRoomTextures(project.room.textures);
    this.restoreObjects(project.objects);
  }

  restoreBuffered(tmp) {
    this.clearSelection();

    this.restoreObjects(tmp);
  }

  snapshot() {
    if (this.actionQueue.current < this.actionQueue.queue.length - 1) {
      this.actionQueue.queue.splice(this.actionQueue.current);
    }

    this.actionQueue.current++;
    this.actionQueue.queue.push(this.saveState());

    if (this.actionQueue.queue.length > MAX_ACTION_QUEUE_LENGTH) {
      this.actionQueue.queue.shift();
    }
  }

  undo() {
    if (this.actionQueue.current > 0) {
      this.actionQueue.current--;
      this.restoreState(this.actionQueue.queue[this.actionQueue.current]);
    }
  }

  redo() {
    if (this.actionQueue.current < this.actionQueue.queue.length) {
      this.restoreState(this.actionQueue.queue[this.actionQueue.current]);
      this.actionQueue.current++;
    }
  }

  restoreState(state) {
    this.clearSelection();
    this.clearContainer();

    this.size = state.room.size;

    this.setRoomSize(this.size.width, this.size.height, this.size.depth, 1000);
    this.setRoomTextures(state.room.textures);
    this.restoreObjects(state.objects);
  }

  saveBuffered(tmp) {
    let topObjects = [];
    let objects = tmp;

    for (let i = 0; i < objects.length; i++) {
      topObjects.push(objects[i].userData.toJSON());
    }

    return topObjects;
  }

  saveState() {
    let topObjects = [];
    let objects = this.container.children;

    for (let i = 0; i < objects.length; i++) {
      topObjects.push(objects[i].userData.toJSON());
    }

    return {
      room: {
        size: this.project.size,
        textures: {
          walls: this.slabTextures.walls,
          floor: this.slabTextures.floor,
        },
      },
      objects: topObjects,
    };
  }

  saveProject(isLocal) {
    let topObjects = [];
    let objects = this.container.children;

    for (let i = 0; i < objects.length; i++) {
      topObjects.push(objects[i].userData);
    }

    let project = {
      name: this.project.name,
      room: {
        size: this.project.size,
        textures: this.slabTextures,
      },
      objects: topObjects,
    };

    return JSON.stringify(project);
  }

  setProject(name, width, height, depth) {
    if (this.project.name !== name) {
      this.project.name == name;
    }
    if (
      this.project.size.width !== width ||
      this.project.size.height !== height ||
      this.project.size.depth !== depth
    ) {
      this.project.size.width = width;
      this.project.size.height = height;
      this.project.size.depth = depth;
    }
  }

  getProject() {
    return this.project;
  }

  getSelectedCorners() {
    if (
      this.selected.length === 1 &&
      this.selected[0].userData.type > TYPES.ITEM
    ) {
      return this.selected[0].userData.corners;
    }
    return null;
  }

  setSelectedCorners(corners) {
    if (
      this.selected.length === 1 &&
      this.selected[0].userData.type > TYPES.ITEM
    ) {
      let select = this.selected[0].userData;
      this.selected[0].userData.setCorners(corners);
      this.selected[0] = select.obj3D;
    }
  }

  getSelectedSize() {
    if (
      this.selected.length === 1 &&
      this.selected[0].userData.type > TYPES.ITEM
    ) {
      return this.selected[0].userData.size;
    }
    return null;
  }

  setSelectedSize(size) {
    if (
      this.selected.length === 1 &&
      this.selected[0].userData.type > TYPES.ITEM
    ) {
      let select = this.selected[0].userData;
      this.selected[0].userData.setSize(size.width, size.height, size.depth);
      this.selected[0] = select.obj3D;
    }
  }

  rotateSelectedX(angle) {
    let selected = this.selected;
    for (let i = 0; i < selected.length; i++) {
      selected[i].userData.rotateX(angle);
    }
  }

  rotateSelectedY(angle) {
    let selected = this.selected;
    for (let i = 0; i < selected.length; i++) {
      selected[i].userData.rotateY(angle);
    }
  }

  rotateSelectedZ(angle) {
    let selected = this.selected;
    for (let i = 0; i < selected.length; i++) {
      selected[i].userData.rotateZ(angle);
    }
  }

  resetSelectedRotation() {
    let selected = this.selected;
    for (let i = 0; i < selected.length; i++) {
      selected[i].userData.resetRotation();
    }
  }

  restoreModule(json) {
    let project = JSON.parse(json);

    this.restoreObjects(project.objects);
  }

  setSelectedTextures(textures, objects) {
    for (let i = 0; i < objects.length; i++) {
      switch (objects[i].userData.type) {
        case TYPES.GROUP:
          let children = [];

          for (let j = 0; j < objects[i].children.length; j++) {
            if (objects[i].children[j] !== objects[i].userData.box3Helper) {
              children.push(objects[i].children[j]);
            }
          }

          this.setSelectedTextures(textures, children);
          break;
        case TYPES.LDSP:
          if (textures.ldsp !== -1)
            objects[i].userData.updateTexture(
              this.textures.wood[textures.ldsp]
            );
          break;
        case TYPES.FACADE:
          let texture =
            textures.facade === -1
              ? objects[i].userData.texture.id
              : textures.facade;
          let pattern =
            textures.pattern === -1
              ? objects[i].userData.pattern.id
              : textures.pattern;
          objects[i].userData.updateTexture(
            this.textures.wood[texture],
            this.textures.pattern[pattern]
          );
          break;
        case TYPES.WORKTOP:
          if (textures.worktop !== -1)
            objects[i].userData.updateTexture(
              this.textures.stone[textures.worktop]
            );
          break;
      }
    }
  }
}

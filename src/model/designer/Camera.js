const CAMERA_TYPES = {
  PERSPECTIVE: 1,
  ORTHOGRAPHIC: 2,
};
Object.freeze(CAMERA_TYPES);

export class Camera {
  constructor(type) {
    this.type = type;
    this.matrix = null;
  }
}

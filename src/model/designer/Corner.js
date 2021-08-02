export const CORNER_TYPES = {
  NONE: -1,
  OTHER: 0,
  RIGHT_CONVEX: 1,
  RIGHT_CONCAVE: 2,
  CURVE_CONVEX: 3,
  CURVE_CONCAVE: 4,
  CUT: 5,
};
Object.freeze(CORNER_TYPES);

export class Corner {
  constructor(type, in0, out0) {
    this.type = type;
    this.in = in0;
    this.out = out0;
  }
}

export class Corners {
  constructor(cornerNE, cornerSE, cornerSW, cornerNW) {
    (this.NE =
      cornerNE !== undefined
        ? cornerNE
        : new Corner(CORNER_TYPES.RIGHT_CONVEX, 0, 0)),
      (this.SE =
        cornerSE !== undefined
          ? cornerSE
          : new Corner(CORNER_TYPES.RIGHT_CONVEX, 0, 0)),
      (this.SW =
        cornerSW !== undefined
          ? cornerSW
          : new Corner(CORNER_TYPES.RIGHT_CONVEX, 0, 0)),
      (this.NW =
        cornerNW !== undefined
          ? cornerNW
          : new Corner(CORNER_TYPES.RIGHT_CONVEX, 0, 0));
  }

  createShape(shape, width, height) {
    this.createShapeCorner(shape, this.NE, width, height, true);
    this.createShapeCorner(shape, this.SE, width, 0);
    this.createShapeCorner(shape, this.SW, 0, 0);
    this.createShapeCorner(shape, this.NW, 0, height);
  }

  createShapeCorner(shape, corner, x, y, isMoveTo) {
    let in0 = corner.in,
      out0 = corner.out;
    let inX = 0,
      inY = 0,
      outX = 0,
      outY = 0,
      xc = 0,
      yc = 0;
    if (x === 0) {
      if (y === 0) {
        inX = in0;
        outY = out0;

        xc = in0;
        yc = out0;
      } else if (y > 0) {
        inY = -in0;
        outX = out0;

        xc = out0;
        yc = -in0;
      }
    } else if (x > 0) {
      if (y === 0) {
        inY = in0;
        outX = -out0;

        xc = -out0;
        yc = in0;
      } else if (y > 0) {
        inX = -in0;
        outY = -out0;

        xc = -in0;
        yc = -out0;
      }
    }

    if (isMoveTo === true) {
      shape.moveTo(x + inX, y + inY);
    } else {
      shape.lineTo(x + inX, y + inY);
    }

    switch (corner.type) {
      case CORNER_TYPES.RIGHT_CONVEX:
        shape.lineTo(x, y);
        shape.lineTo(x + outX, y + outY);
        break;
      case CORNER_TYPES.RIGHT_CONCAVE:
        shape.lineTo(x + xc, y + yc);
        shape.lineTo(x + outX, y + outY);
        break;
      case CORNER_TYPES.CUT:
        shape.lineTo(x + outX, y + outY);
        break;
      case CORNER_TYPES.CURVE_CONVEX:
        shape.quadraticCurveTo(x, y, x + outX, y + outY);
        break;
      case CORNER_TYPES.CURVE_CONCAVE:
        shape.quadraticCurveTo(x + xc, y + yc, x + outX, y + outY);
        break;
    }
  }
}

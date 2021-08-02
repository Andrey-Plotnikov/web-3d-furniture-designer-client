<template>
  <div class="board-editor">
    <div class="single-column">
      <div class="board-editor-content">
        <div class="select">
          <select @change="NW_Change($event, $event.target.selectedIndex)">
            <option>Прямой внешний</option>
            <option>Прямой внутренний</option>
            <option>Округлый внешний</option>
            <option>Округлый внутренний</option>
            <option>Срезанный</option>
          </select>
        </div>
        <div class="input">
          <input
            type="text"
            :value="corners.NW.out"
            :readonly="corners.NW.type === 1"
            @input="NW_Out_Change($event, $event.target.value)"
          />
        </div>
        <div class="none"></div>
        <div class="input">
          <input
            type="text"
            :value="corners.NE.in"
            :readonly="corners.NE.type === 1"
            @input="NE_In_Change($event, $event.target.value)"
          />
        </div>
        <div
          class="select"
          @change="NE_Change($event, $event.target.selectedIndex)"
        >
          <select>
            <option>Прямой внешний</option>
            <option>Прямой внутренний</option>
            <option>Округлый внешний</option>
            <option>Округлый внутренний</option>
            <option>Срезанный</option>
          </select>
        </div>

        <div class="input">
          <input
            type="text"
            :value="corners.NW.in"
            :readonly="corners.NW.type === 1"
            @input="NW_In_Change($event, $event.target.value)"
          />
        </div>
        <div class="svg">
          <svg class="svg-shape-editor" :viewBox="viewbox">
            <g class="background-group">
              <line :x1="0" :y1="size.height" :x2="0" :y2="-size.height"></line>
              <line :x1="size.width" :y1="0" :x2="-size.width" :y2="0"></line>
            </g>
            <g class="shape-group">
              <path :d="shapePath"></path>
            </g>
            <g class="edges-group"></g>
            <g class="points-group"></g>
          </svg>
        </div>
        <div class="input">
          <input
            type="text"
            :value="corners.NE.out"
            :readonly="corners.NE.type === 1"
            @input="NE_Out_Change($event, $event.target.value)"
          />
        </div>

        <div></div>
        <div></div>

        <div class="input">
          <input
            type="text"
            :value="corners.SW.out"
            :readonly="corners.SW.type === 1"
            @input="SW_Out_Change($event, $event.target.value)"
          />
        </div>
        <div class="input">
          <input
            type="text"
            :value="corners.SE.in"
            :readonly="corners.SE.type === 1"
            @input="SE_In_Change($event, $event.target.value)"
          />
        </div>

        <div
          class="select"
          @change="SW_Change($event, $event.target.selectedIndex)"
        >
          <select>
            <option>Прямой внешний</option>
            <option>Прямой внутренний</option>
            <option>Округлый внешний</option>
            <option>Округлый внутренний</option>
            <option>Срезанный</option>
          </select>
        </div>
        <div class="input">
          <input
            type="text"
            :value="corners.SW.in"
            :readonly="corners.SW.type === 1"
            @input="SW_In_Change($event, $event.target.value)"
          />
        </div>
        <div class="none"></div>
        <div class="input">
          <input
            type="text"
            :value="corners.SE.out"
            :readonly="corners.SE.type === 1"
            @input="SE_Out_Change($event, $event.target.value)"
          />
        </div>
        <div
          class="select"
          @change="SE_Change($event, $event.target.selectedIndex)"
        >
          <select>
            <option>Прямой внешний</option>
            <option>Прямой внутренний</option>
            <option>Округлый внешний</option>
            <option>Округлый внутренний</option>
            <option>Срезанный</option>
          </select>
        </div>
      </div>
      <div class="footer-buttons">
        <button @click="submit()">Сохранить</button>
        <button @click="close()" class="sec">Отменить</button>
      </div>
    </div>
  </div>
</template>

<script>
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

export default {
  name: "shape-editor",
  data() {
    return {
      viewbox: `0 0 1 1`,
      shapePath: "",

      size: {
        width: 0,
        height: 0,
      },
      corners: {
        NE: {
          in: 0,
          out: 0,
          type: 1,
        },
        SE: {
          in: 0,
          out: 0,
          type: 1,
        },
        SW: {
          in: 0,
          out: 0,
          type: 1,
        },
        NW: {
          in: 0,
          out: 0,
          type: 1,
        },
      },
    };
  },
  methods: {
    show(size, corners) {
      this.$parent.show = true;

      if (size !== undefined && corners !== undefined) {
        this.size = {
          width: size.width,
          height: size.height,
        };
        this.corners = {
          NE: {
            in: corners.NE.in,
            out: corners.NE.out,
            type: corners.NE.type,
          },
          SE: {
            in: corners.SE.in,
            out: corners.SE.out,
            type: corners.SE.type,
          },
          SW: {
            in: corners.SW.in,
            out: corners.SW.out,
            type: corners.SW.type,
          },
          NW: {
            in: corners.NW.in,
            out: corners.NW.out,
            type: corners.NW.type,
          },
        };
      }

      this.updateViewBox();
      this.updateShape();
    },
    submit() {
      let corners = {
        NE: {
          in: +this.corners.NE.in,
          out: +this.corners.NE.out,
          type: +this.corners.NE.type,
        },
        SE: {
          in: +this.corners.SE.in,
          out: +this.corners.SE.out,
          type: +this.corners.SE.type,
        },
        SW: {
          in: +this.corners.SW.in,
          out: +this.corners.SW.out,
          type: +this.corners.SW.type,
        },
        NW: {
          in: +this.corners.NW.in,
          out: +this.corners.NW.out,
          type: +this.corners.NW.type,
        },
      };

      this.$emit("submit", corners);
      this.$parent.show = false;
    },
    close() {
      this.$parent.show = false;
    },
    checkValue(value, opposite, length) {
      if (value + opposite > length) {
        return length - opposite;
      }
      return value;
    },
    checkInput(target, value, cornerProp, sideProp, opposite, length) {
      if (!value.match(/^\d*((\.)|(\.5)|(\.0+))?$/mu)) {
        target.value = this.corners[cornerProp][sideProp];
      } else {
        this.corners[cornerProp][sideProp] = this.checkValue(
          +value,
          opposite,
          length
        );
        this.updateShape();
      }
    },
    NE_In_Change(event, value) {
      this.checkInput(
        event.target,
        value,
        "NE",
        "in",
        this.corners.NW.out,
        this.size.width
      );
    },
    NE_Out_Change(event, value) {
      this.checkInput(
        event.target,
        value,
        "NE",
        "out",
        this.corners.SE.in,
        this.size.height
      );
    },
    SE_In_Change(event, value) {
      this.checkInput(
        event.target,
        value,
        "SE",
        "in",
        this.corners.NE.out,
        this.size.height
      );
    },
    SE_Out_Change(event, value) {
      this.checkInput(
        event.target,
        value,
        "SE",
        "out",
        this.corners.SW.in,
        this.size.width
      );
    },
    SW_In_Change(event, value) {
      this.checkInput(
        event.target,
        value,
        "SW",
        "in",
        this.corners.SE.out,
        this.size.width
      );
    },
    SW_Out_Change(event, value) {
      this.checkInput(
        event.target,
        value,
        "SW",
        "out",
        this.corners.NW.in,
        this.size.height
      );
    },
    NW_In_Change(event, value) {
      this.checkInput(
        event.target,
        value,
        "NW",
        "in",
        this.corners.SW.out,
        this.size.height
      );
    },
    NW_Out_Change(event, value) {
      this.checkInput(
        event.target,
        value,
        "NW",
        "out",
        this.corners.NE.in,
        this.size.width
      );
    },
    NE_Change(event, selectedIndex) {
      this.corners.NE.type = selectedIndex + 1;
      if (selectedIndex + 1 === CORNER_TYPES.RIGHT_CONVEX) {
        this.corners.NE.in = 0;
        this.corners.NE.out = 0;
      }
      this.updateShape();
    },
    SE_Change(event, selectedIndex) {
      this.corners.SE.type = selectedIndex + 1;
      if (selectedIndex + 1 === CORNER_TYPES.RIGHT_CONVEX) {
        this.corners.SE.in = 0;
        this.corners.SE.out = 0;
      }
      this.updateShape();
    },
    SW_Change(event, selectedIndex) {
      this.corners.SW.type = selectedIndex + 1;
      if (selectedIndex + 1 === CORNER_TYPES.RIGHT_CONVEX) {
        this.corners.SW.in = 0;
        this.corners.SW.out = 0;
      }
      this.updateShape();
    },
    NW_Change(event, selectedIndex) {
      this.corners.NW.type = selectedIndex + 1;
      if (selectedIndex + 1 === CORNER_TYPES.RIGHT_CONVEX) {
        this.corners.NW.in = 0;
        this.corners.NW.out = 0;
      }
      this.updateShape();
    },
    updateViewBox() {
      let max = 0;
      if (this.size.width >= this.size.height) {
        max = this.size.width;
      } else {
        max = this.size.height;
      }

      let value = -max / 2 - max * 0.05;
      this.viewbox = `${value} ${value} ${-value * 2} ${-value * 2}`;
    },
    updateShape() {
      let width = this.size.width;
      let height = this.size.height;

      this.shapePath = "";
      this.formCorner(this.corners.NE, width / 2, height / 2, true);
      this.formCorner(this.corners.SE, width / 2, -height / 2, false);
      this.formCorner(this.corners.SW, -width / 2, -height / 2, false);
      this.formCorner(this.corners.NW, -width / 2, height / 2, false);
      this.shapePath += "Z";
    },

    formCorner(corner, x, y, isMoveTo) {
      let in0 = +corner.in,
        out0 = +corner.out;
      let inX = 0,
        inY = 0,
        outX = 0,
        outY = 0,
        xc = 0,
        yc = 0;
      if (x < 0) {
        if (y < 0) {
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
        if (y < 0) {
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

      if (!isMoveTo) this.shapePath += `L ${x + inX} ${y + inY} `;
      else this.shapePath = `M ${x + inX} ${y + inY} `;

      switch (corner.type) {
        case CORNER_TYPES.RIGHT_CONVEX:
          this.shapePath += `L ${x} ${y} `;
          this.shapePath += `L ${x + outX} ${y + outY} `;
          break;
        case CORNER_TYPES.RIGHT_CONCAVE:
          this.shapePath += `L ${x + xc} ${y + yc} `;
          this.shapePath += `L ${x + outX} ${y + outY} `;
          break;
        case CORNER_TYPES.CUT:
          this.shapePath += `L ${x + outX} ${y + outY} `;
          break;
        case CORNER_TYPES.CURVE_CONVEX:
          this.shapePath += `Q ${x} ${y} ${x + outX} ${y + outY} `;
          break;
        case CORNER_TYPES.CURVE_CONCAVE:
          this.shapePath += `Q ${x + xc} ${y + yc} ${x + outX} ${y + outY} `;
          break;
      }
    },
  },
};
</script>

<style scoped>
.svg-shape-editor {
  min-width: 30rem;
  min-height: 30rem;
  max-width: 30rem;
  max-height: 30rem;
  width: 30rem;
  height: 30rem;
  transform: scaleY(-1);
}
.svg-shape-editor g {
  outline: solid 1px rgba(0, 0, 0, 0);
  outline-offset: -5px;
  pointer-events: bounding-box;
}
/* .svg-shape-editor g:hover {
    outline-color: green;
}
.svg-shape-editor path:hover {
    stroke: red;
} */

.board-editor-content {
  display: grid;
  grid-template-columns: 8rem 8rem auto 8rem 8rem;
  grid-template-rows: 0fr 0fr 1fr 0fr 0fr;
  gap: 0.3rem 0.3rem;
  grid-template-areas:
    ".  .   .   .  ."
    ". svg svg svg ."
    ". svg svg svg ."
    ". svg svg svg ."
    ".  .   .   .  .";
}
.board-editor-content > * {
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
}
.board-editor-content select {
  height: 100%;
  width: 100%;
  text-align: center;
  text-align-last: center;

  overflow: hidden;
  text-overflow: ellipsis;
}
.board-editor-content select > option {
  text-align: center;
  text-align-last: center;
}
.board-editor-content input {
  width: 10rem;
  text-align: center;
  width: 100%;
}
.board-editor-content > .svg {
  border: 2px solid lightslategray;
  grid-area: svg;
}

.background-group {
  stroke: rgba(0, 0, 0, 0.2);
  stroke-width: 1px;
}

.shape-group {
  stroke: #2196f3;
  fill: rgba(33, 150, 243, 0.1);
}

input[readonly] {
  color: #999999;
}

.invalid {
  color: red;
}
</style>

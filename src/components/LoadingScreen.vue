<template>
  <div v-show="show" id="loading-screen-1" class="loading-screen">
    <div class="windows8">
      <div class="wBall" id="wBall_1">
        <div class="wInnerBall"></div>
      </div>
      <div class="wBall" id="wBall_2">
        <div class="wInnerBall"></div>
      </div>
      <div class="wBall" id="wBall_3">
        <div class="wInnerBall"></div>
      </div>
      <div class="wBall" id="wBall_4">
        <div class="wInnerBall"></div>
      </div>
      <div class="wBall" id="wBall_5">
        <div class="wInnerBall"></div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "loading-screen",
  data: function () {
    return {
      show: false,
    };
  },
  methods: {},
};
</script>

<style scoped>
.loading-screen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 9999;
  background-color: #ffffff;
  display: flex;
  justify-content: center;
  align-items: center;
}

.windows8 {
  position: relative;
  width: 78px;
  height: 78px;
  margin: auto;
}

.windows8 .wBall {
  position: absolute;
  width: 74px;
  height: 74px;
  opacity: 0;
  transform: rotate(225deg);
  animation: orbit 4.5325s infinite;
}

.windows8 .wBall .wInnerBall {
  position: absolute;
  width: 10px;
  height: 10px;
  background: rgb(0, 0, 0);
  left: 0px;
  top: 0px;
  border-radius: 10px;
}

.windows8 #wBall_1 {
  animation-delay: 0.986s;
}

.windows8 #wBall_2 {
  animation-delay: 0.193s;
}

.windows8 #wBall_3 {
  animation-delay: 0.3965s;
}

.windows8 #wBall_4 {
  animation-delay: 0.5895s;
}

.windows8 #wBall_5 {
  animation-delay: 0.793s;
}

@keyframes orbit {
  0% {
    opacity: 1;
    z-index: 99;
    transform: rotate(180deg);
    animation-timing-function: ease-out;
  }

  7% {
    opacity: 1;
    transform: rotate(300deg);
    animation-timing-function: linear;
    origin: 0%;
  }

  30% {
    opacity: 1;
    transform: rotate(410deg);
    animation-timing-function: ease-in-out;
    origin: 7%;
  }

  39% {
    opacity: 1;
    transform: rotate(645deg);
    animation-timing-function: linear;
    origin: 30%;
  }

  70% {
    opacity: 1;
    transform: rotate(770deg);
    animation-timing-function: ease-out;
    origin: 39%;
  }

  75% {
    opacity: 1;
    transform: rotate(900deg);
    animation-timing-function: ease-out;
    origin: 70%;
  }

  76% {
    opacity: 0;
    transform: rotate(900deg);
  }

  100% {
    opacity: 0;
    transform: rotate(900deg);
  }
}
</style>

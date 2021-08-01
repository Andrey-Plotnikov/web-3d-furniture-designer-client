<template>
  <div id="app">
    <router-view />
  </div>
</template>

<style>
#app {
  /* font-family: Avenir, Helvetica, Arial, sans-serif; */
  font-family: Geneva, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
body {
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -o-user-select: none;
  user-select: none;
  margin: 0;
  padding: 0;
  max-width: 100vw;
  min-width: 100vw;
  max-height: 100vh;
  min-height: 100vh;
  font-family: Verdana, Geneva, sans-serif;
}
* {
  outline: 0 !important;
}

.main .modal {
  max-width: 20rem;
  width: 20rem;
}
.register .modal {
  max-width: 20rem;
  width: 20rem;
}

.modal-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  max-width: 100vw;
  min-width: 100vw;
  max-height: 100vh;
  min-height: 100vh;
  margin: auto;
  display: flex;
  justify-content: center;
  align-items: center;
}
.darken {
  background-color: rgba(0, 0, 0, 0.1);
}
.modal {
  box-shadow: 0 0 0.5rem 0rem rgba(0, 0, 0, 0.2);
  padding: 1rem;
  background-color: white;
  max-height: 100vh;
  overflow: auto;
  max-height: 600px;
}
.modal-content {
  display: flex;
  flex-direction: column;
}

p {
  margin: 0;
}

canvas {
  min-width: 100%;
  min-height: 100%;
}

input {
  padding: 0.65rem 1rem 0.75rem 1rem !important;
}
input:active {
  border-color: red;
}
input:focus {
  border-color: green;
}
input,
select {
  border: 1px solid #999999;
}
input::placeholder {
  color: #aaaaaa;
  font-weight: lighter;
}

button {
  border: 1px solid #2e7d32;
  background-color: #43a047;
  color: white;
}
button:hover {
  cursor: pointer;
  box-shadow: 0 0 0.1rem 0 #43a047;
}
button.link {
  border: 0;
  background-color: #ffffff;
  color: #1976d2;
  color: #333333;
}
button.sec {
  border: 1px solid #999999;
  background-color: #ffffff;
  color: #444444;
}
button.sec:hover {
  cursor: pointer;
  box-shadow: 0 0 0.1rem 0 #999999;
}
button:active {
  transform: scale(0.95, 0.95);
}

a {
  color: #1e88e5;
  text-decoration: none;
}
a:hover {
  cursor: pointer;
  /* color: #1565C0; */
  text-decoration: underline;
}
a > button {
  width: 100%;
}

a,
input,
button,
select {
  font-size: 1rem;
  letter-spacing: 0.025rem;
}
input,
button,
select {
  padding: 0.5rem;
}

router-link > button {
  margin-bottom: inherit;
}

.row-baseline {
  display: flex;
  align-items: baseline;
  text-align: center;
}
.row-baseline > * {
  width: 100%;
}
.title {
  margin: 0;
  margin-bottom: 0.25rem;
}

.close-cross {
  position: inherit;
  top: 1rem;
  right: 1rem;
  font-size: 2rem;
  color: #f44336;
}
.close-cross:hover {
  cursor: pointer;
  color: #d32f2f;
}

.window .footer-buttons {
  display: flex;
  flex-direction: row-reverse;
}
.window .footer-buttons button {
  margin-left: 0.5rem;
}
.window .footer-buttons button:last-child {
  margin-left: 0;
}

.window {
  box-shadow: 0 0 0.5rem 0rem rgba(0, 0, 0, 0.15);
  padding: 1rem;
  padding-bottom: 0;
  background-color: white;
  max-height: 100vh;
  overflow: auto;
}
.window-content {
  display: flex;
  flex-direction: column;
}
.window-button-footer {
  display: flex;
  flex-direction: row-reverse;
  justify-content: right;
}
.window-button-footer > button {
  margin-left: 1rem;
}
.column-container {
  display: flex;
  flex-direction: column;
  text-align: center;
}
.column-container > * {
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
}
/* .column-container > *:last-child {
    margin-bottom: 0;
}
.column-container > *:first-child {
    margin-top: 0;
}
.column-container > *:only-child {
    margin-top: 0;
    margin-bottom: 0;
} */
.column-container > .row {
  display: flex;
}

.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.row > * {
  margin-left: 0.5rem;
  margin-right: 0.5rem;
}
.row > *:only-child {
  margin-left: 0;
  margin-right: 0;
}
.row > *:first-child {
  margin-left: 0;
}
.row > *:last-child {
  margin-right: 0;
}

.single-column {
  display: flex;
  flex-direction: column;
}
.single-column > * {
  margin-bottom: 1rem;
  width: 100%;
}
/* .single-column > *:only-child, .single-column > *:last-child {
    margin-bottom: 0;
} */
.single-column h4 {
  margin-top: 0;
  margin-bottom: 0.5rem;
}

.block > * {
  margin-bottom: 0.4rem;
}
/* .block > *:only-child, .single-column > *:last-child {
    margin-bottom: 0;
} */

.window-control .control-buttons {
  display: flex;
  flex-direction: row-reverse;
}

/* .block {
    margin: 0;
    margin-bottom: 1rem;
}
.block h4 {
    margin: 0;
    margin-bottom: 0.5rem;
} */

/* .status-place {
    text-align: center;
}
.status-place.error {
    color: #d32f2f;
} */

fieldset {
  margin: 0;
  padding: 0;
  border: 1px solid #999999;
  text-align: left;
}
fieldset > legend {
  margin-left: 0.5rem;
  padding: 0 0.5rem;
  color: #555555;
  font-size: 0.8rem;
}
fieldset > input {
  width: 100%;
  border: none;
  box-sizing: border-box;
  padding: 0.25rem 1rem 0.75rem 1rem;
}

.center-align {
  text-align: center;
}

.info-block {
  /* text-align: center; */
  font-size: 0.75rem;
  color: #2e7d32;
}
.info-block:first-child {
  margin-top: 0.5rem;
}
ul.info-block {
  list-style-type: square;
  list-style-position: inside;
  padding: 0;
  margin: 0;
}
.info-block .error {
  color: #c62828;
}

.register .window {
  width: 20rem;
}
</style>

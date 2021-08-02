import {
  EventDispatcher,
  Matrix4,
  Plane,
  Raycaster,
  Vector2,
  Vector3,
} from "three";

var DragControls = function (_objects, _camera, _domElement) {
  var _plane = new Plane();
  var _raycaster = new Raycaster();

  var _mouse = new Vector2();
  var _offset = new Vector3();
  var _intersection = new Vector3();
  var _worldPosition = new Vector3();
  var _inverseMatrix = new Matrix4();
  var _intersections = [];

  var _selected = null,
    _hovered = null;

  var shift = new Vector3();
  var planeNormal = new Vector3(0, 0, 0);
  var pointOfIntersection = new Vector3();
  var axes = ["", ""];

  var scope = this;

  function setCamera(camera) {
    _camera = camera;
  }

  function activate() {
    _domElement.addEventListener("pointermove", onPointerMove);
    _domElement.addEventListener("pointerdown", onPointerDown);
    _domElement.addEventListener("pointerup", onPointerCancel);
    _domElement.addEventListener("pointerleave", onPointerCancel);
  }

  function deactivate() {
    _domElement.removeEventListener("pointermove", onPointerMove);
    _domElement.removeEventListener("pointerdown", onPointerDown);
    _domElement.removeEventListener("pointerup", onPointerCancel);
    _domElement.removeEventListener("pointerleave", onPointerCancel);

    _domElement.style.cursor = "";
  }

  function dispose() {
    deactivate();
  }

  function getObjects() {
    return _objects;
  }

  function onPointerMove(event) {
    event.preventDefault();

    switch (event.pointerType) {
      case "mouse":
      case "pen":
        onMouseMove(event);
        break;

      // TODO touch
    }
  }

  function onMouseMove(event) {
    var rect = _domElement.getBoundingClientRect();

    _mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    _mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    _raycaster.setFromCamera(_mouse, _camera);

    if (_selected && scope.enabled) {
      if (_raycaster.ray.intersectPlane(_plane, _intersection)) {
        _raycaster.ray.intersectPlane(_plane, pointOfIntersection);
        let newPos = pointOfIntersection.add(shift).round().clone();

        let off = _selected.position.clone();
        off.subVectors(newPos, off);

        _selected.userData.setPosition(newPos.x, newPos.y, newPos.z);

        let thresholds = ["", ""];

        for (let i = 0; i < 2; i++) {
          if (off[axes[i]] > 0) {
            thresholds[i] = "max";
          } else {
            thresholds[i] = "min";
          }
        }

        off = new Vector3();
        for (let i = 0; i < 2; i++) {
          let val = _selected.userData.box3[thresholds[i]][axes[i]];
          off[axes[i]] = Math.round(val) - val;
        }
        _selected.userData.setPositionOffset(off);
      }

      scope.dispatchEvent({ type: "drag", object: _selected });

      return;
    }

    _intersections.length = 0;

    _raycaster.setFromCamera(_mouse, _camera);
    _raycaster.intersectObjects(_objects, true, _intersections);

    if (_intersections.length > 0) {
      var object = _intersections[0].object;

      let cameraNormal = new Vector3();
      _camera.getWorldDirection(cameraNormal);
      cameraNormal.x = Math.abs(cameraNormal.x);
      cameraNormal.y = Math.abs(cameraNormal.y);
      cameraNormal.z = Math.abs(cameraNormal.z);

      if (cameraNormal.x > cameraNormal.y) {
        if (cameraNormal.x > cameraNormal.z) {
          planeNormal = new Vector3(1, 0, 0);
          axes[0] = "y";
          axes[1] = "z";
        } else {
          planeNormal = new Vector3(0, 0, 1);
          axes[0] = "x";
          axes[1] = "y";
        }
      } else {
        if (cameraNormal.y > cameraNormal.z) {
          planeNormal = new Vector3(0, 1, 0);
          axes[0] = "x";
          axes[1] = "z";
        } else {
          planeNormal = new Vector3(0, 0, 1);
          axes[0] = "x";
          axes[1] = "y";
        }
      }

      _plane.setFromNormalAndCoplanarPoint(
        planeNormal,
        _worldPosition.setFromMatrixPosition(object.matrixWorld)
      );

      if (_hovered !== object && _hovered !== null) {
        scope.dispatchEvent({ type: "hoveroff", object: _hovered });

        _domElement.style.cursor = "auto";
        _hovered = null;
      }

      if (_hovered !== object) {
        scope.dispatchEvent({ type: "hoveron", object: object });

        _domElement.style.cursor = "pointer";
        _hovered = object;
      }
    } else {
      if (_hovered !== null) {
        scope.dispatchEvent({ type: "hoveroff", object: _hovered });

        _domElement.style.cursor = "auto";
        _hovered = null;
      }
    }
  }

  function onPointerDown(event) {
    event.preventDefault();

    switch (event.pointerType) {
      case "mouse":
      case "pen":
        onMouseDown(event);
        break;

      // TODO touch
    }
  }

  function onMouseDown(event) {
    event.preventDefault();

    _intersections.length = 0;

    _raycaster.setFromCamera(_mouse, _camera);
    _raycaster.intersectObjects(_objects, true, _intersections);

    if (_intersections.length > 0) {
      _selected = _intersections[0].object;
      while (_selected.parent.userData.isContainer !== true) {
        _selected = _selected.parent;
      }

      if (_selected.userData.isSelected === false) {
        onMouseCancel(event);
        return;
      }

      if (_raycaster.ray.intersectPlane(_plane, _intersection)) {
        let cameraNormal = new Vector3();
        _camera.getWorldDirection(cameraNormal);
        cameraNormal.x = Math.abs(cameraNormal.x);
        cameraNormal.y = Math.abs(cameraNormal.y);
        cameraNormal.z = Math.abs(cameraNormal.z);

        if (cameraNormal.x > cameraNormal.y) {
          if (cameraNormal.x > cameraNormal.z) {
            planeNormal = new Vector3(1, 0, 0);
            axes[0] = "y";
            axes[1] = "z";
          } else {
            planeNormal = new Vector3(0, 0, 1);
            axes[0] = "x";
            axes[1] = "y";
          }
        } else {
          if (cameraNormal.y > cameraNormal.z) {
            planeNormal = new Vector3(0, 1, 0);
            axes[0] = "x";
            axes[1] = "z";
          } else {
            planeNormal = new Vector3(0, 0, 1);
            axes[0] = "x";
            axes[1] = "y";
          }
        }

        _plane.setFromNormalAndCoplanarPoint(
          planeNormal,
          _intersections[0].point
        );
        shift.subVectors(_selected.position, _intersections[0].point);
      }

      _domElement.style.cursor = "move";

      scope.dispatchEvent({ type: "dragstart", object: _selected });
    }
  }

  function onPointerCancel(event) {
    event.preventDefault();

    switch (event.pointerType) {
      case "mouse":
      case "pen":
        onMouseCancel(event);
        break;

      // TODO touch
    }
  }

  function onMouseCancel(event) {
    event.preventDefault();

    if (_selected) {
      scope.dispatchEvent({ type: "dragend", object: _selected });

      _selected = null;
    }

    _domElement.style.cursor = _hovered ? "pointer" : "auto";
  }

  activate();

  // API

  this.enabled = true;
  this.transformGroup = false;

  this.activate = activate;
  this.deactivate = deactivate;
  this.dispose = dispose;
  this.getObjects = getObjects;
  this.setCamera = setCamera;
};

DragControls.prototype = Object.create(EventDispatcher.prototype);
DragControls.prototype.constructor = DragControls;

export { DragControls };

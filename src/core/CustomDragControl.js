import {
    EventDispatcher,
    Matrix4,
    Plane,
    Raycaster,
    Vector2,
    Vector3,
    InstancedMesh

} from "three";
import Constructor from "./geometryConstructors/abstract/Constructor";
import Scene from "./Scene";

/**
 * 
 * @param {Scene} scene 
 * @param {*} _objects 
 * @param {*} _camera 
 * @param {*} _domElement 
 */
var CustomDragControl = function (scene, _objects, _camera, _domElement) {

    var _plane = new Plane();
    // var _hPlane = _customPlane;
    var _defaultPlane = new Plane();
    _defaultPlane.set(new Vector3(0, 1, 0), 0);

    _objects.forEach(object => {

        if (object.refPlaneToMove === undefined) {

            object.refPlaneToMove = _defaultPlane;
        }
    });


    var newPosition = new Vector3();
    var touchEnded = true;

    var _raycaster = new Raycaster();

    var _mouse = new Vector2();
    var _offset = new Vector3();
    var _intersection = new Vector3();
    var _worldPosition = new Vector3();
    var _inverseMatrix = new Matrix4();
    var _intersections = [];

    var mouseDownListeners = [];
    var mouseMoveListeners = [];
    var mouseUpListeners = [];

    var _selected = null, _hovered = null;

    var scope = this;
    var default_objects = _objects.slice();

    function addObject(object, addToCurrentSelectableObj = true) {

        if (object.refPlaneToMove === undefined) {
            object.refPlaneToMove = _defaultPlane;
        }
        if (addToCurrentSelectableObj)
            _objects.push(object);
        default_objects.push(object);
    }

    function activate() {

        _domElement.addEventListener('mousemove', onDocumentMouseMove, false);
        _domElement.addEventListener('mousedown', onDocumentMouseDown, false);
        _domElement.addEventListener('mouseup', onDocumentMouseCancel, false);
        _domElement.addEventListener('mouseleave', onDocumentMouseCancel, false);
        _domElement.addEventListener('touchmove', onDocumentTouchMove, false);
        _domElement.addEventListener('touchstart', onDocumentTouchStart, false);
        _domElement.addEventListener('touchend', onDocumentTouchEnd, false);

    }

    function deactivate() {

        _domElement.removeEventListener('mousemove', onDocumentMouseMove, false);
        _domElement.removeEventListener('mousedown', onDocumentMouseDown, false);
        _domElement.removeEventListener('mouseup', onDocumentMouseCancel, false);
        _domElement.removeEventListener('mouseleave', onDocumentMouseCancel, false);
        _domElement.removeEventListener('touchmove', onDocumentTouchMove, false);
        _domElement.removeEventListener('touchstart', onDocumentTouchStart, false);
        _domElement.removeEventListener('touchend', onDocumentTouchEnd, false);

        _domElement.style.cursor = '';

    }

    function dispose() {

        deactivate();

    }

    function getObjects() {

        return _objects;

    }

    function onDocumentMouseMove(event) {

        var rect = _domElement.getBoundingClientRect();

        _mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        _mouse.y = - (((event.clientY) - rect.top) / rect.height) * 2 + 1;

        // if (!_selected) {
        //     return;
        // }

        // console.log("moving...");

        event.preventDefault();
        _raycaster.setFromCamera(_mouse, _camera);

        if (_selected && scope.enabled) {

            if (_raycaster.ray.intersectPlane(_selected.refPlaneToMove, _intersection)) {

                if (_selected.moveItself) {

                    _selected.dispatchEvent({ type: 'drag', object: _selected, pos: _intersection.sub(_offset).applyMatrix4(_inverseMatrix) });
                }
                else {

                    newPosition.copy(_intersection.sub(_offset).applyMatrix4(_inverseMatrix));

                    if (!scene.geoConstructor.active || _selected.parentGeo.isInstrument) {
                        // _selected.isMoving = true;

                        if (_selected.applyConstraint) {
                            const intersect = _raycaster.intersectObject(scene.plane);
                            if (intersect.length > 0) {
                                _selected.applyConstraint(intersect[0].point, newPosition);

                            }
                        }

                        _selected.position.copy(newPosition);

                        const intersect = _raycaster.intersectObject(scene.plane);

                        if (_selected && intersect.length > 0) {
                            scope.dispatchEvent({ type: 'drag', object: _selected, pointerPos: intersect[0].point });
                        }
                    }

                }

            }

            // return;
        }

        _intersections.length = 0;

        // _raycaster.setFromCamera(_mouse, _camera);
        _raycaster.intersectObjects(_objects, false, _intersections);

        if (_intersections.length > 0) {

            var object = _intersections[0].object;

            // object.refPlaneToMove.setFromNormalAndCoplanarPoint(_camera.getWorldDirection(object.refPlaneToMove.normal), _worldPosition.setFromMatrixPosition(object.matrixWorld));

            if (!object.userData.notMovable && _hovered !== object) {

                scope.dispatchEvent({ type: 'hoveron', object: object });
                if(!scene.geoConstructor.active) _domElement.style.cursor =  'pointer';
                _hovered = object;

            }

        } else {

            if (_hovered !== null && (!_selected || !_selected.isMoving)) {

                scope.dispatchEvent({ type: 'hoveroff', object: _hovered });

                if(!scene.geoConstructor.active)  _domElement.style.cursor = 'auto';
                _hovered = null;

            }

        }

        if (scene.geoConstructor.active) {

            const intersect = _raycaster.intersectObject(scene.plane);

            if (intersect.length > 0) {

                scene.geoConstructor.onPointerMove({
                    x: intersect[0].point.x, y: intersect[0].point.y,
                    hoveredItem: _hovered ? _hovered.parentGeo : undefined,
                })

                scene.animationController.requestRender();
            }


        }

    }

    function onDocumentMouseDown(event) {

        event.preventDefault();

        _intersections.length = 0;

        _raycaster.setFromCamera(_mouse, _camera);

        _raycaster.intersectObjects(_objects, false, _intersections);

        if (_intersections.length > 0) {

            let i;
            for (i = 0; i < _intersections.length; i++) {

                if (!_intersections[i].object.instanceMatrix && !_intersections[i].object.userData.notMovable) {

                    _selected = (scope.transformGroup === true) ? _objects[i] : _intersections[i].object;
                    break;
                }
            }

            if (i === _intersections.length) {
                _selected = undefined;
                return;
            }
            else {

                if (_raycaster.ray.intersectPlane(_selected.refPlaneToMove, _intersection)) {

                    _inverseMatrix.invert(_selected.parent.matrixWorld);
                    _offset.copy(_intersection).sub(_worldPosition.setFromMatrixPosition(_selected.matrixWorld));

                }

                const intersect = _raycaster.intersectObject(scene.plane);

                if (_selected && intersect.length > 0) {

                    scope.dispatchEvent({ type: 'dragstart', object: _selected, pointerPos: intersect[0].point });
                }


            }

            // _domElement.style.cursor = 'grabbing';
        }

        if (scene.pressedKey !== ' ' && scene.geoConstructor.active) {

            const intersect = _raycaster.intersectObject(scene.plane);
            
            if (intersect.length > 0) {

                scene.geoConstructor.canvasClicked({
                    x: intersect[0].point.x, y: intersect[0].point.y,
                    hoveredItem: _selected ? _selected.parentGeo : undefined,
                })

                scene.animationController.requestRender();
            }


        }
    }

    function onDocumentMouseCancel(event) {

        event.preventDefault();

        if (_selected) {

            scope.dispatchEvent({ type: 'dragend', object: _selected });

            if (_selected) _selected.isMoving = false;
            _selected = null;

        }

        if(!scene.geoConstructor.active) _domElement.style.cursor = _hovered ? 'pointer' : 'auto';


    }

    function onDocumentTouchMove(event) {

        if (!_selected || !_intersection || event.touches.length >= 2) {
            return;
        }


        event.preventDefault();
        event = event.changedTouches[0];

        var rect = _domElement.getBoundingClientRect();

        _mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        _mouse.y = - ((event.clientY - rect.top) / rect.height) * 2 + 1;

        _raycaster.setFromCamera(_mouse, _camera);

        touchEnded = false;

        if (_selected && scope.enabled) {

            if (_raycaster.ray.intersectPlane(_selected.refPlaneToMove, _intersection)) {

                if (_selected.moveItself) {

                    _selected.dispatchEvent({ type: 'drag', object: _selected, pos: _intersection.sub(_offset).applyMatrix4(_inverseMatrix) });
                }
                else {

                    newPosition.copy(_intersection.sub(_offset).applyMatrix4(_inverseMatrix));

                    if (_selected.applyConstraint) {

                        _selected.applyConstraint(newPosition);

                    }
                    _selected.position.copy(newPosition);
                    // _selected.position.copy(_intersection.sub(_offset).applyMatrix4(_inverseMatrix));
                    scope.dispatchEvent({ type: 'drag', object: _selected });
                }
            }

            return;

        }

    }

    function onDocumentTouchStart(event) {

        let touchCount = event.touches.length;

        if (touchCount >= 2) {

            if (touchEnded === false) {

                scope.dispatchEvent({ type: 'drag', object: undefined });

            }
            else {

                scope.dispatchEvent({ type: 'dragend', object: undefined });

            }
            return;
        }


        event = event.changedTouches[0];

        var rect = _domElement.getBoundingClientRect();

        _mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        _mouse.y = - ((event.clientY - rect.top) / rect.height) * 2 + 1;

        _intersections.length = 0;

        _raycaster.setFromCamera(_mouse, _camera);
        _raycaster.intersectObjects(_objects, false, _intersections);

        if (_intersections.length > 0) {


            let i;
            for (i = 0; i < _intersections.length; i++) {

                if (!_intersections[i].object.instanceMatrix && !_intersections[i].object.userData.notMovable) {

                    _selected = (scope.transformGroup === true) ? _objects[i] : _intersections[i].object;
                    break;
                }
            }

            if (i === _intersections.length) {
                _selected = undefined;
                return;
            }


            // _selected.refPlaneToMove.setFromNormalAndCoplanarPoint(_camera.getWorldDirection(_selected.refPlaneToMove.normal), _worldPosition.setFromMatrixPosition(_selected.matrixWorld));

            if (_raycaster.ray.intersectPlane(_selected.refPlaneToMove, _intersection)) {

                _inverseMatrix.invert(_selected.parent.matrixWorld);
                _offset.copy(_intersection).sub(_worldPosition.setFromMatrixPosition(_selected.matrixWorld));

            }


            if(!scene.geoConstructor.active)  _domElement.style.cursor = 'move';

            scope.dispatchEvent({ type: 'dragstart', object: _selected });

        }
    }


    function onDocumentTouchEnd(event) {

        event.preventDefault();

        if (_selected) {

            scope.dispatchEvent({ type: 'dragend', object: _selected });

            _selected = null;

        }

        if(!scene.geoConstructor.active) _domElement.style.cursor = 'auto';

        touchEnded = true;

    }

    function addMouseDownListener(listener) {
        mouseDownListeners.push(listener);
    }

    function addMouseMoveListener(listener) {
        mouseMoveListeners.push(listener);
    }

    function addMouseUpListener(listener) {
        mouseUpListeners.push(listener);
    }

    function fireMouseDownEvent() {
        mouseDownListeners.forEach(listener => {
            listener();
        });
    }

    function fireMouseMoveEvent(pos) {
        mouseMoveListeners.forEach(listener => {
            listener(pos);
        });
    }

    function fireMouseUpEvent() {
        mouseUpListeners.forEach(listener => {
            listener();
        });
    }

    /**
     * 
     * @param {Constructor} geoConstructor 
     */
    function filterSelectableItemForGeoConstruction(geoConstructor) {

        _objects.length = 0;
        default_objects.forEach(object => {

            if (geoConstructor) {
                if (geoConstructor.isItemSelectable(object.parentGeo)) {
                    _objects.push(object);
                }
            }
            else {
                _objects.push(object);
            }

        });

    }

    activate();

    // API

    this.enabled = true;
    this.transformGroup = false;

    this.activate = activate;
    this.deactivate = deactivate;
    this.dispose = dispose;
    this.getObjects = getObjects;
    this.addObject = addObject;
    this.filterSelectableItemForGeoConstruction = filterSelectableItemForGeoConstruction;

};

CustomDragControl.prototype = Object.create(EventDispatcher.prototype);
CustomDragControl.prototype.constructor = CustomDragControl;

export { CustomDragControl };


import { EdgesGeometry, LineSegments, Mesh, MeshBasicMaterial, PlaneGeometry } from "three";
import Scene from "../Scene";
import { reactive, ref } from "vue";


export default class SelectionManager {
    /**
     * 
     * @param {Scene} scene 
     */
    constructor(scene) {

        this.scene = scene;
        this.sceneStates = scene.states;

        this.selectedItem = ref();
        this.selectedItems = reactive([]);
        this.editingItem = ref();

        this.items = this.scene.items;

        this.selectionRect = new Mesh(new PlaneGeometry(3, 3), new MeshBasicMaterial({
            color: 0x006eff,
            opacity: .08,
            transparent: true,
        }));
        this.selectionRect.renderOrder = 99999;
        this.selectionRect.visible = false;

        this.edge = new LineSegments(new EdgesGeometry(this.selectionRect.geometry), new MeshBasicMaterial({
            color: 0x006eff
        }));

        scene.add(this.selectionRect);
        this.selectionRect.add(this.edge);

        this.scene.on("modeChange", () => {
            this.clearSelection();
        })

        this.scene.on("Delete:down", () => {
            this.deleteSelectedItems();
        });

    }

    updateSelectedItems() {

        this.sceneStates.selectedItems.length = 0;
        this.selectedItems.length = 0;

        for (let i = 0; i < this.items.length; i++) {

            if (this.items[i].isSelected.value) {
                this.sceneStates.selectedItems.push(this.items[i]);
                this.selectedItems.push(this.items[i]);
            }
        }

        for (let pt of this.scene.intersectionPts) {

            if (pt.isSelected.value) {
                this.sceneStates.selectedItems.push(pt);
                this.selectedItems.push(pt);
            }
        }

        if (this.sceneStates.mode === 'play') {

            this.selectedItem.value = undefined;
            this.sceneStates.selectedItem = undefined;
            this.sceneStates.selectedItems.length = 0;
            this.selectedItems.length = 0;

        }
        else {

            this.sceneStates.selectedItem = this.selectedItems.length === 1 ? this.selectedItems[0] : undefined;

            this.selectedItem.value = this.selectedItems.length === 1 ? this.selectedItems[0] : undefined;

            if (!this.selectedItem.value || (this.selectedItem.value && this.editingItem.value && (this.selectedItem.value.name !== this.editingItem.value.name))) {
                this.setEditingItem(undefined);
            }
        }
    }

    removeSelection(item) {

        const index = this.selectedItems.findIndex(ele => ele.name === item.name);
        if (index > -1) this.selectedItems.splice(index, 1);

        if (this.sceneStates.selectedItem && item.name === this.sceneStates.selectedItem.name) this.sceneStates.selectedItem = undefined;

    }

    onPointerDown(e) {

        if (!this.multiSelectable()) return;

        this.pointerDownEvent = e;
        this.selectionRect.geometry = new PlaneGeometry(0.001, 0.001);
        this.edge.geometry = new EdgesGeometry(this.selectionRect.geometry);
        this.selectionRect.visible = true;

        this.selectionWidth = this.selectionHeight = 0;

    }

    onPointerMove(e) {

        if (!this.multiSelectable()) return;

        this.selectionWidth = Math.abs(e.x - this.pointerDownEvent.x);
        this.selectionHeight = Math.abs(e.y - this.pointerDownEvent.y);

        this.selectionRect.geometry = new PlaneGeometry(Math.abs(this.selectionWidth), Math.abs(this.selectionHeight));
        this.edge.geometry = new EdgesGeometry(this.selectionRect.geometry);
        this.selectionRect.position.set((e.x + this.pointerDownEvent.x) / 2, (e.y + this.pointerDownEvent.y) / 2, .2);

    }

    onPointerUp(e) {

        if (!this.multiSelectable()) return;

        if (this.scene.pointerDownedButton === 0) {

            if (this.scene.pressedKey === 'Control') {
                if (e.tappedItem) {
                    // e.tappedItem.setSelection(!e.tappedItem.isSelected.value);
                }
            }
            else {
                if (e.tappedItem) {
                    if (this.selectedItems.length === 0) {
                        // e.tappedItem.setSelection(!e.tappedItem.isSelected.value);
                    }
                    else {
                        this.clearSelection([e.tappedItem]);
                    }
                }
                else {
                    this.clearSelection([]);
                }
            }
        }
        else if (this.scene.pointerDownedButton === 2) {

            if (!this.selectionRect.visible) return;


            // get selections
            this.selectionRect.geometry.computeBoundingBox();

            const hw = this.selectionWidth / 2;
            const hh = this.selectionHeight / 2;
            const pos = this.selectionRect.position;

            const rectPolygon = new FlattenPolygon(
                [[pos.x + hw, pos.y + hh], [pos.x + hw, pos.y - hh], [pos.x - hw, pos.y - hh], [pos.x - hw, pos.y + hh]]
            )


            for (let item of this.scene.items) {

                if (!item.userCreated || !(item.isGeometry || item.isGraphicItem)) continue;

                let itemToSelect;

                if (item.isPoint) {
                    itemToSelect = new FlattenPoint(item.position.x, item.position.y);
                }
                else if (item.isSegment) {
                    itemToSelect = new FlattenSegment(
                        new FlattenPoint(item.pt1.x, item.pt1.y), new FlattenPoint(item.pt2.x, item.pt2.y)
                    )
                }
                else if (item.isPolygon) {
                    itemToSelect = new FlattenPolygon(item.pts);
                }
                else if (item.isCircle) {
                    itemToSelect = new FlattenCircle(new FlattenPoint(item.centerPt.x, item.centerPt.y), item.radius);
                }
                else if(item.isAngle){
                    itemToSelect = new FlattenPoint(item.pt2.x, item.pt2.y)
                }
                else if(item.isArc){
                    itemToSelect = new FlattenArc(new FlattenPoint(item.centerPt.x, item.centerPt.y), item.radius, item.arcRotationAngle, item.arcRotationAngle + item.arcAngle, true);
                }
                else if(item.isLabel){
                    itemToSelect = new FlattenPoint(item.position.x, item.position.y)
                }

                if(itemToSelect)                
                    item.setSelection(rectPolygon.contains(itemToSelect));
            }
        }

        
        this.selectionRect.visible = false;
        this.updateSelectedItems();
        this.scene.requestRender();

    }

    clearSelection(exceptItems = []) {

        for (let item of this.scene.items) {

            if (!item.userCreated) continue;

            if (exceptItems.find(ele => ele.name === item.name))
                item.setSelection(true);
            else
                if (item.isSelected.value) item.setSelection(false);

        }

        for (let item of this.scene.intersectionPts) {

            if (exceptItems.find(ele => ele.name === item.name)) {
                item.setSelection(true);
            }

            else {
                if (item.isSelected.value) item.setSelection(false);
            }
        }

        this.updateSelectedItems();
    }

    multiSelectable() {
        return (this.sceneStates.mode === 'select' || this.sceneStates.mode === 'constructorWithInstruments' || this.sceneStates.mode === 'play');
    }

    deleteSelectedItems() {

        const cmds = [];
        const deletedItems = [];

        const removeItSelfDependents = (geo) => {

            if (geo.dependents && geo.dependents.length > 0) {

                for (let dependent of geo.dependents) {

                    removeItSelfDependents(dependent);

                }
            }

            if (!deletedItems.find((ele) => ele === geo.name)) {

                cmds.push(new CmdRemoveGeometry(geo.name));
                deletedItems.push(geo.name);

            }
        };

        for (let item of this.selectedItems) {
            if (item.isInstrument) {
                item.hide();
            } else if (item.isGeometry || item.isGraphicItem) {

                if (item.isPolygon) {

                    for (let segName of item.definition.segmentNames) {
                        const segment = this.scene.getItemByName(segName);
                        if (segment) removeItSelfDependents(segment);
                    }

                    for (let ptName of item.definition.pointNames) {
                        const point = this.scene.getItemByName(ptName);
                        if (point) removeItSelfDependents(point);

                    }
                }
                else {
                    removeItSelfDependents(item);
                }
            }
        }

        cmds.forEach((cmd) => {
            cmd.execute(this.scene);
        });

        if (cmds.length > 0) {
            this.scene.addCommand(cmds);
        }

        this.scene.requestRender();
    }

    setEditingItem(item) {

        if (item && this.editingItem.value && this.editingItem.value.name === item.name) {
            this.editingItem.value = undefined;
        }
        else {
            this.editingItem.value = item;
        }
    }
}

import { Point as FlattenPoint, Circle as FlattenCircle, Polygon as FlattenPolygon, Box as FlattenBox, Line as FlattenLine, Segment as FlattenSegment, Arc as FlattenArc, } from '@flatten-js/core'; 
import CmdRemoveGeometry from "../commands/CmdRemoveGeometry";
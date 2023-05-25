
import TWEEN from '@tweenjs/tween.js';
import { MeshLambertMaterial, InstancedMesh, RepeatWrapping, MeshBasicMaterial, TextureLoader, Object3D, Group, BoxGeometry, Mesh, Vector2, MeshStandardMaterial, EquirectangularReflectionMapping, MeshPhysicalMaterial, PlaneGeometry, LinearToneMapping, MeshPhongMaterial } from "three";
import Scene from './Scene';

export default class Paper {

    constructor(scene) {

        this.scene = scene;

        this.paperWidth = 17;
        this.paperHeight = 21;

        this.lineHeight = .9;

        this.marginWidth = 1.5;
        this.lineWidth = .028;
        this.paperThickness = 0.02;

        this.paperColor = 0xf5f4f0;
        this.lineColor = 0xEBF0F3;


        this.group = new Group();
        this.scene.add(this.group);
        this.group.visible = false;
        this.group.matrixAutoUpdate = false;

        this.paperGeometry = new BoxGeometry(this.paperWidth, this.paperHeight, this.paperThickness);
        this.paperGeometry.translate(0, 0, -0.011)
        this.paperMaterial = new MeshLambertMaterial({

            color: 0xfafafa,
            emissive: 0xffffff,
            emissiveIntensity: .2,

        });

        // const textureLoader = new TextureLoader();
        // textureLoader.load("/v2GeoConst3D/images/Layout - Copy.png", texture => {
        //     texture.wrapS = texture.wrapT = RepeatWrapping;
        //     texture.repeat = new Vector2(3, 3);
        //     this.paperMaterial.map = texture;
        //     this.paperMaterial.needsUpdate = true
        // })

        this.paperMesh = new Mesh(this.paperGeometry, this.paperMaterial);
        this.paperMesh.matrixAutoUpdate = false;
        this.paperMesh.visible = false;
        this.paperMesh.receiveShadow = true;

        this.scene.add(this.paperMesh);

        this.name = "Paper";
        this.opacityTween = new TWEEN.Tween();

        this.drawPaperLinesMesh();
    }

    drawPaperLinesMesh() {

        let noOfLines = 20;

        let noOfLineAboveHorizonal = parseInt(noOfLines * .48); // horizontal line included
        let noOfLineBelowHorizonal = noOfLines - noOfLineAboveHorizonal;

        this.lineMaterial = new MeshLambertMaterial({
            color: this.lineColor,
        });

        this.lineGeometry = new PlaneGeometry(this.paperWidth - 0.01, this.lineWidth);
        this.lineGeometry.translate(0, 0, 0.001);

        this.lineInstancedMesh = new InstancedMesh(this.lineGeometry, this.lineMaterial, noOfLines);
        this.lineInstancedMesh.matrixAutoUpdate = false;
        this.lineInstancedMesh.visible = false;
        this.scene.add(this.lineInstancedMesh);

        let dummy = new Object3D();

        let lineIndexCounter = 0;

        for (let i = noOfLineAboveHorizonal; i > -noOfLineBelowHorizonal; i--) {

            dummy.position.set(0, this.lineHeight * i, 0);
            dummy.updateMatrix();
            this.lineInstancedMesh.setMatrixAt(lineIndexCounter++, dummy.matrix);

        }

        // draw margin
        this.marginMaterial = new MeshLambertMaterial({
            color: this.lineColor,

        });

        let marginGeometry = new PlaneGeometry(
            this.lineWidth * 1.1,
            (noOfLines - 1) * this.lineHeight,
            // 0.01,
        );
        marginGeometry.translate(-(this.paperWidth / 2) + (this.marginWidth), -this.lineHeight / 2, 0.002);

        this.marginMesh = new Mesh(marginGeometry, this.marginMaterial);
        this.marginMesh.matrixAutoUpdate = false;
        this.marginMesh.visible = false;
        this.scene.add(this.marginMesh);

    }

    show(options = {}) {


        this.paperMaterial.opacity = 1;
        this.lineMaterial.opacity = 1;
        this.marginMaterial.opacity = 1;


        this.paperMesh.visible = true;
        this.lineInstancedMesh.visible = true;
        this.marginMesh.visible = true;

    }

    setLineVisibility(visibility) {

        this.lineInstancedMesh.visible = visibility;
        this.marginMesh.visible = visibility;

    }

    showLines() {

    }

    hideLines() {

    }
}
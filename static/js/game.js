import { THREE, OrbitControls, CANNON, KeyboardState } from "engine";
import { NORMAL } from "materials";

import Axes from "util/axes";
import SkySphere from "util/skysphere";

import Terrain from "procedural/terrain";
import { perlin } from "procedural/noise";
import { Biome } from "procedural/biome";

import Plane from "util/plane";
import Amoeba from "amoeba";

export default class Game {
    constructor(container_id, worldSize=32) {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.view_angle = 45;
        this.aspect = this.width / this.height;
        this.near = 0.1;
        this.far = 10000;
        this.worldSize = worldSize;

        this.clock = new THREE.Clock();
        this.renderer = new THREE.WebGLRenderer({ alpha: true });
        this.renderer.setSize(this.width, this.height);
        this.renderer.setClearColor(0x000000, 1);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.soft = true;

        this.camera = new THREE.PerspectiveCamera(this.view_angle, this.aspect, this.near, this.far);
        this.camera.position.y = 0.5;
        this.camera.position.x = -2;

        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.keyboard = new KeyboardState();

        this.scene = new THREE.Scene();
        this.biome = new Biome();

        document.getElementById(container_id).appendChild(this.renderer.domElement);
        window.addEventListener("resize", () => this.resize());
    }

    init() {
        this.scene.add(SkySphere("/static/images/galaxy_starfield.png", 128 * this.worldSize));
        this.scene.add(Axes(this.width));

        const ambientLight = new THREE.AmbientLight(0x4F2F2F);
        this.scene.add(ambientLight);

        const pointLight = new THREE.PointLight(0xFFFF00, 0.8, 10000);
        pointLight.position.set(this.worldSize/2, this.worldSize, -this.worldSize/2);
        this.scene.add(pointLight);

        var chunk = Terrain.Ground(this.worldSize, 0, 0);
        this.scene.add(chunk);
        this.biome.put(0, 0, chunk);

        var block_size = 5;
        this.water = Terrain.Water(this.worldSize * block_size);
        this.scene.add(this.water);

        this.amoeba = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), new THREE.MeshLambertMaterial({ color: 0xffff00, emissive: 0xaa0033 }));
        this.amoeba.add(this.camera);
        this.scene.add(this.amoeba);
    }

    resize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.renderer.setSize(this.width, this.height);
        this.camera.aspect = this.width / this.height;
        this.camera.updateProjectionMatrix();
    }

    update() {
        var delta = this.clock.getDelta();
        var timestamp = this.clock.getElapsedTime();

        if (this.keyboard.pressed("a")) {
            this.amoeba.rotation.y += 0.05;
        }
        if (this.keyboard.pressed("d")) {
            this.amoeba.rotation.y -= 0.05;
        }

        var n = new THREE.Vector3(1, 0, 0).applyEuler(this.amoeba.rotation);
        if (this.keyboard.pressed("w")) {
            this.amoeba.position.add(n);
        }
        if (this.keyboard.pressed("s")) {
            this.amoeba.position.add(n.negate());
        }

        if (this.keyboard.pressed("e")) {
            this.amoeba.position.y += 1;
        }
        if (this.keyboard.pressed("q")) {
            this.amoeba.position.y -= 1;
        }

        this.controls.update(delta);

        var size = Math.sqrt(this.water.geometry.vertices.length);
        var Fanimate = 2.3;
        var Pa = 100;
        var A = 0.2;
        for (let i = 0; i < this.water.geometry.vertices.length; i++) {
            var v = this.water.geometry.vertices[i];
            var Fo = 2 * Math.PI / 3 * (Math.pow(v.x - v.z, 2) % 3) + Pa * perlin(v.x / Fanimate, v.z / Fanimate);
            v.y = A * Math.sin(Fanimate * timestamp + Fo);
        }

        this.water.geometry.verticesNeedUpdate = true;
        this.water.geometry.normalsNeedUpdate = true;
        this.water.geometry.computeFaceNormals();

        var lodTarget = this.camera;
        if (this.keyboard.pressed("shift")) {
            lodTarget = this.amoeba;
        }

        var chunkX = Math.floor(this.amoeba.position.x / this.worldSize + 0.5);
        var chunkY = Math.floor(this.amoeba.position.z / this.worldSize + 0.5);
        var visibility = 5;
        var max = 96;
        for (let i = -visibility; i <= visibility; i++) {
            for (let j = -visibility; j <= visibility; j++) {
                var x = chunkX + i;
                var y = chunkY + j;
                if (Math.abs(x) > max || Math.abs(y) > max) continue;
                if (!this.biome.get(x, y)) {
                    var chunk = Terrain.Ground(this.worldSize, x, y);
                    this.scene.add(chunk);
                    this.biome.put(x, y, chunk);
                }

                var chunk = this.biome.get(x, y);
                chunk.update(lodTarget);
            }
        }


        //TODO move culling logic into biome
        //TODO add a universal dispose method
        this.biome.cull(chunkX, chunkY, (x, y, chunk) => {
            if (Math.abs(chunkX - x) <= visibility && Math.abs(chunkY - y) <= visibility) {
                return false;
            }

            this.scene.remove(chunk);
            for (let i = 0; i < chunk.levels.length; i++) {
                chunk.levels[i].object.geometry.dispose();
                chunk.levels[i].object.material.dispose();
            }
            return true;
        });
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }
}

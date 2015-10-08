import { THREE, OrbitControls, CANNON, KeyboardState } from "engine";
import { NORMAL } from "materials";

import Axes from "util/axes";
import SkySphere from "util/skysphere";

import Terrain from "procedural/terrain";
import { perlin } from "procedural/noise";

import Plane from "util/plane";
import Amoeba from "amoeba";

export default class Game {
    constructor(container_id, world_size=32) {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.view_angle = 45;
        this.aspect = this.width / this.height;
        this.near = 0.1;
        this.far = 10000;
        this.world_size = world_size;

        this.renderer = new THREE.WebGLRenderer({ alpha: true });
        this.renderer.setSize(this.width, this.height);
        this.renderer.setClearColor(0x000000, 1);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.soft = true;

        this.camera = new THREE.PerspectiveCamera(this.view_angle, this.aspect, this.near, this.far);
        this.camera.position.x = 100;
        this.camera.position.y = 150;
        this.camera.position.z = 100;

        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.keyboard = new KeyboardState();

        this.scene = new THREE.Scene();

        document.getElementById(container_id).appendChild(this.renderer.domElement);
        window.addEventListener("resize", () => this.resize());
    }

    init() {
        this.scene.add(this.camera);
        this.scene.add(SkySphere("/static/images/galaxy_starfield.png", 8 * this.world_size));
        this.scene.add(Axes(this.width));

        const pointLight = new THREE.PointLight(0xFFFF00, 0.8, 10000);
        pointLight.position.set(this.world_size/2, this.world_size, -this.world_size/2);
        this.scene.add(pointLight);

        var ground = Terrain.Ground(this.world_size, 0, 0);
        this.scene.add(ground);

        var block_size = 3;
        this.water = Terrain.Water(this.world_size * block_size);
        this.scene.add(this.water);

        function *spiral() {
            for (let r = 1; r <= block_size / 2; r++) {
                for (let i = -r; i <= r; i++) { yield [i, r]; }
                for (let j = r - 1; j >= -r; j--) { yield [r, j]; }
                for (let i = r - 1; i >= -r; i--) { yield [i, -r]; }
                for (let j = -r + 1; j < r; j++) { yield [-r, j]; }
            }
        }

        var generator = spiral();
        var add = () => {
            var gen = generator.next();
            if (!gen.done) {
                var x, y;
                [x,y] = gen.value;

                var ground = Terrain.Ground(this.world_size, x, y);
                this.scene.add(ground);

                setTimeout(add, 100);
            }
        };

        setTimeout(add, 5000);
    }

    resize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.renderer.setSize(this.width, this.height);
        this.camera.aspect = this.width / this.height;
        this.camera.updateProjectionMatrix();
    }

    update(timestamp) {
        var size = Math.sqrt(this.water.geometry.vertices.length);
        var Fanimate = 0.0023;
        var Pa = 100;
        var A = 0.2;
        for (let i = 0; i < this.water.geometry.vertices.length; i++) {
            var v = this.water.geometry.vertices[i];
            var Fo = 2 * Math.PI / 3 * (Math.pow(v.x - v.y, 2) % 3) + Pa * perlin(v.x / Fanimate, v.y / Fanimate);
            v.z = A * Math.sin(Fanimate * timestamp + Fo);
        }

        this.water.geometry.verticesNeedUpdate = true;
        this.water.geometry.normalsNeedUpdate = true;
        this.water.geometry.computeFaceNormals();
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }
}

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
        this.camera.position.y = 50;
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

        const pointLight = new THREE.PointLight(0xFFFF00, 0.8, 1000);
        //pointLight.castShadow = true;
        pointLight.position.set(this.world_size/2, 50, -this.world_size/2);
        this.scene.add(pointLight);

        window.scene = this.scene;
        var ground = Terrain.DiamondSquare(this.world_size);
        ground.position.set(-this.world_size / 2, 0, this.world_size / 2);
        this.scene.add(ground);

        function *spiral() {
            for (let r = 1; r < 5; r++) {
                for (let i = -r; i <= r; i++) { yield [i, r]; }
                for (let j = r - 1; j >= -r; j--) { yield [r, j]; }
                for (let i = r - 1; i >= -r; i--) { yield [i, -r]; }
                for (let j = -r + 1; j < r; j++) { yield [-r, j]; }
            }
        }

        var F = 0.1;
        var generator = spiral();
        var add = () => {
            var asdf = generator.next();
            if (!asdf.done) {
                var x, y;
                [x,y] = asdf.value;

                var a = perlin( x      / F,  y      / F);
                var b = perlin((x + 1) / F,  y      / F);
                var c = perlin( x      / F, (y + 1) / F);
                var d = perlin((x + 1) / F, (y + 1) / F);

                var ground = Terrain.DiamondSquare(this.world_size, a, b, c, d);
                ground.position.set(x * this.world_size - this.world_size / 2, 0, y * this.world_size + this.world_size / 2);
                this.scene.add(ground);

                setTimeout(add, 100);
            }
        };

        setTimeout(add, 100);
    }

    resize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.renderer.setSize(this.width, this.height);
        this.camera.aspect = this.width / this.height;
        this.camera.updateProjectionMatrix();
    }

    update() {
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }
}

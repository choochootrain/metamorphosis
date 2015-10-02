import { THREE, OrbitControls, CANNON, KeyboardState } from "engine";
import { NORMAL } from "materials";

import Axes from "util/axes";
import SkySphere from "util/skysphere";

import Terrain from "procedural/terrain";
import Biome from "procedural/biome";

import Plane from "util/plane";
import Amoeba from "amoeba";

export default class Game {
    constructor(container_id, world_size=64) {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.view_angle = 45;
        this.aspect = this.width / this.height;
        this.near = 0.1;
        this.far = 10000;
        this.world_size = world_size;

        this.world = new CANNON.World();
        this.world.gravity.set(0, -2, 0);

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
        this.scene.add(SkySphere("/static/images/galaxy_starfield.png", 4 * this.world_size));
        this.scene.add(Axes(this.width));

        const pointLight = new THREE.DirectionalLight(0xFFFF00, 0.8, 100);
        pointLight.castShadow = true;
        pointLight.position.set(this.world_size/2, 50, -this.world_size/2);
        this.scene.add(pointLight);

        var ground = Terrain.Ground(this.world_size/2);
        var ground_shape = new CANNON.ConvexPolyhedron(ground.geometry.vertices.map((x) => new CANNON.Vec3(x.x, x.y, x.z)),
                ground.geometry.faces.map((x) => [x.a, x.b, x.c]));
        var ground_body = new CANNON.Body({ mass: 0, material: NORMAL });
        ground_body.addShape(ground_shape);
        ground_body.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
        ground_body.position.set(0, 0, 0);

        ground.position.copy(ground_body.position);
        ground.quaternion.copy(ground_body.quaternion);

        this.scene.add(ground);
        this.world.addBody(ground_body);

        this.scene.add(Terrain.Water(this.world_size));
        const biome = Biome(this.world_size * 7);

        var biome_shape = new CANNON.Plane();
        var biome_body = new CANNON.Body({ mass: 0, material: NORMAL });
        biome_body.addShape(biome_shape);
        biome_body.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
        biome_body.position.set(0, -10, 0);

        this.scene.add(biome);
        this.world.addBody(biome_body);

        biome.position.copy(biome_body.position);
        biome.quaternion.copy(biome_body.quaternion);

        this.amoeba = new Amoeba(this.world, this.scene, 1, 6);
        this.amoeba.body.position.set(1, 25, 0);

        this.world.solver.iterations = 10;
    }

    resize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.renderer.setSize(this.width, this.height);
        this.camera.aspect = this.width / this.height;
        this.camera.updateProjectionMatrix();
    }

    update() {
        // step physics
        this.world.step(1/35);

        const minVelocity = 0.2;
        const acceleration = 1.25;
        const maxVelocity = 10;
        if (this.keyboard.pressed("w")) {
            this.amoeba.body.velocity.x = Math.min(maxVelocity, this.amoeba.body.velocity.x + minVelocity);
        }

        if (this.keyboard.pressed("s")) {
            this.amoeba.body.velocity.x = Math.max(-maxVelocity, this.amoeba.body.velocity.x - minVelocity);
        }

        if (this.keyboard.pressed("d")) {
            this.amoeba.body.velocity.z = Math.min(maxVelocity, this.amoeba.body.velocity.z + minVelocity);
        }

        if (this.keyboard.pressed("a")) {
            this.amoeba.body.velocity.z = Math.max(-maxVelocity, this.amoeba.body.velocity.z - minVelocity);
        }

        if (this.amoeba.body.position.y < -50) {
            this.amoeba.body.position.set(1, 25, 0);
            this.amoeba.body.velocity.set(0, 0, 0);
        }

        // update based on physics
        this.amoeba.update();
        this.camera.position.set(this.amoeba.mesh.position.x - 50, this.amoeba.mesh.position.y + 25, this.amoeba.mesh.position.z);
        this.camera.lookAt(this.amoeba.mesh.position);
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }
}

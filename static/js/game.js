import { THREE, OrbitControls, CANNON } from "engine";
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
        this.world.gravity.set(0, -9.82, 0);

        this.renderer = new THREE.WebGLRenderer({ alpha: true });
        this.renderer.setSize(this.width, this.height);
        this.renderer.setClearColor(0x000000, 1);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.soft = true;

        this.camera = new THREE.PerspectiveCamera(this.view_angle, this.aspect, this.near, this.far);
        window.camera = this.camera;
        this.camera.position.x = 200;
        this.camera.position.y = 100;
        this.camera.position.z = 200;

        this.controls = new OrbitControls(this.camera, this.renderer.domElement);

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

        var ground = Terrain.Ground(this.world_size);
        var shape = new CANNON.ConvexPolyhedron(ground.geometry.vertices.map((x) => new CANNON.Vec3(x.x, x.y, x.z)),
                ground.geometry.faces.map((x) => [x.a, x.b, x.c]));
        var body = new CANNON.Body({ mass: 0, material: NORMAL });
        body.addShape(shape);
        body.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
        body.position.set(0, 0, 0);

        ground.position.copy(body.position);
        ground.quaternion.copy(body.quaternion);

        this.scene.add(ground);
        this.world.addBody(body);

        this.scene.add(Terrain.Water(this.world_size));
        const biome = Biome(this.world_size * 7);
        biome.position.y = -10;
        this.scene.add(biome);

        this.amoeba = new Amoeba(this.world, this.scene, 1);
        this.amoeba.body.position.set(1, 25, 0);

        this.world.solver.iterations = 10;

        //this.scene.fog = new THREE.FogExp2(0xEEDDBB, 0.0010);
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

        // update based on physics
        this.amoeba.update();
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }
}

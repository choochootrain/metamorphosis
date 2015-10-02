import { THREE, CANNON, OrbitControls } from "engine";

import Axes from "util/axes";
import Plane from "util/plane";
import Amoeba from "amoeba";

export default class AmoebaSimulation {
    constructor(container_id, world_size=32) {
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
        this.camera.position.x = 500;
        this.camera.position.y = 750;
        this.camera.position.z = 500;

        this.controls = new OrbitControls(this.camera, this.renderer.domElement);

        this.scene = new THREE.Scene();

        document.getElementById(container_id).appendChild(this.renderer.domElement);
        window.addEventListener("resize", () => this.resize());
    }

    init() {
        this.scene.add(this.camera);
        this.scene.add(Axes(this.width));

        const pointLight = new THREE.DirectionalLight(0xFFFF00, 0.8, 100);
        pointLight.castShadow = true;
        pointLight.position.set(this.world_size/2, 50, -this.world_size/2);
        this.scene.add(pointLight);

        Plane(this.world_size, this.world, this.scene);

        this.amoeba = new Amoeba(this.world, this.scene);
        this.amoeba.body.position.set(1, 275, 0);

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

        // update based on physics
        this.amoeba.update();
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }
}

import { THREE, CANNON } from "engine";
import { NORMAL } from "materials";

const RADIUS = 20;

export default class Amoeba {
    constructor(world, scene) {
        var geo = new THREE.SphereGeometry(RADIUS, 20, 20);
        var mat = new THREE.MeshLambertMaterial({ color: 0xffff00 });
        this.mesh = new THREE.Mesh(geo, mat);
        this.mesh.castShadow = true;

        var shape = new CANNON.Sphere(RADIUS);
        this.body = new CANNON.Body({ mass: 5, material: NORMAL });
        this.body.addShape(shape);
        this.body.position.set(0, 30, 0);

        scene.add(this.mesh);
        world.addBody(this.body);

        this.update();
    }

    update() {
        this.mesh.position.copy(this.body.position);
        this.mesh.quaternion.copy(this.body.quaternion);
    }
}

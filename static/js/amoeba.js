import { THREE, CANNON } from "engine";
import { NORMAL } from "materials";

export default class Amoeba {
    constructor(world, scene, radius=20, segments=4) {
        var geo = new THREE.SphereGeometry(radius, segments, segments);
        var mat = new THREE.MeshLambertMaterial({ color: 0xffff00, emissive: 0xaa0033 });
        this.mesh = new THREE.Mesh(geo, mat);
        this.mesh.castShadow = true;

        var shape = new CANNON.Sphere(radius);
        this.body = new CANNON.Body({ mass: 0.1, material: NORMAL });
        this.body.addShape(shape);

        scene.add(this.mesh);
        world.addBody(this.body);

        this.update();
    }

    update() {
        this.mesh.position.copy(this.body.position);
        this.mesh.quaternion.copy(this.body.quaternion);
    }
}

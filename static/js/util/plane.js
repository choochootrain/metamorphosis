import { THREE, CANNON } from "engine";
import { NORMAL } from "materials";

export default function(world_size, world, scene) {
    var geo = new THREE.PlaneGeometry(world_size * 10, world_size * 10);
    var mat = new THREE.MeshBasicMaterial({ color: 0x193340, side: THREE.DoubleSide });
    var mesh = new THREE.Mesh(geo, mat);
    mesh.receiveShadow = true;

    var shape = new CANNON.Plane();
    var body = new CANNON.Body({ mass: 0, material: NORMAL });
    body.addShape(shape);
    body.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0.1,0), -Math.PI/2);
    body.position.set(0, 0, 0);

    mesh.position.copy(body.position);
    mesh.quaternion.copy(body.quaternion);

    scene.add(mesh);
    world.addBody(body);
}

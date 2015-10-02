import THREE from "three.js";

export default function(texture, radius=200, segments=32) {
    const geometry = new THREE.SphereGeometry(radius, segments, segments);
    const material = new THREE.MeshBasicMaterial({
        map: THREE.ImageUtils.loadTexture(texture),
          side: THREE.FrontSide
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.renderOrder = 1000.0;
    mesh.scale.set(-1, 1, 1);
    mesh.rotation.order = 'XZY';
    return mesh;
}

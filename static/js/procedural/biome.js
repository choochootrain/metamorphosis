import THREE from "three.js";
import noise from "procedural/noise";

const F = 0.9;
const Q = 100;

export default function(size) {
    const data = new Uint8Array(3*size*size);
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            data[0 + 3 * i + size * j] = (255 * Math.abs(noise.perlin(F * i, F * j))) | 0;
            data[1 + 3 * i + size * j] = (255 * Math.abs(noise.perlin(F * i, F * j))) | 0;
            data[2 + 3 * i + size * j] = (255 * Math.abs(noise.perlin(F * i, F * j))) | 0;
        }
    }

    const texture = new THREE.DataTexture(data, size, size, THREE.RGBFormat);
    texture.needsUpdate = true;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    const geometry = new THREE.PlaneGeometry(size, size);
    const material = new THREE.MeshBasicMaterial({
        map: texture,
        side: THREE.FrontSide
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.x = -90*Math.PI/180;
    return mesh;
};

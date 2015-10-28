import { THREE } from "engine";

module.exports = {
    GROUND: new THREE.MeshPhongMaterial({
        color: 0x882244,
        emissive: 0x002200,
        side: THREE.DoubleSide,
        shininess: 10,
        shading: THREE.FlatShading
    }),
    WATER: new THREE.MeshPhongMaterial({
        color: 0x8844AA,
        transparent: true,
        opacity: 0.6,
        emissive: 0x004488,
        side: THREE.DoubleSide,
        shininess: 75,
        shading: THREE.FlatShading
    }),
    SUN: new THREE.MeshLambertMaterial({
        color: 0xFFAA66,
        side: THREE.BackSide
    })
}

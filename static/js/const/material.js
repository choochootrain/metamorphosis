import { THREE } from "engine";

module.exports = {
    GROUND: new THREE.MeshPhongMaterial({
        color: 0x882244,
        transparent: false,
        emissive: 0x002200,
        side: THREE.DoubleSide,
        shininess: 10,
        shading: THREE.FlatShading
    }),
    WATER: new THREE.MeshPhongMaterial({
        color: 0xFF4488,
        transparent: true,
        opacity: 0.6,
        emissive: 0x004488,
        side: THREE.DoubleSide,
        shininess: 75,
        shading: THREE.FlatShading
    })
}

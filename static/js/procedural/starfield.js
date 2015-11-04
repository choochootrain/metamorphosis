import { THREE } from "engine";
import MATERIAL from "const/material";

export var Starfield = function(num, radius, filter) {
    var starsGeometry = new THREE.Geometry();
    for (let i = 0; i < num; i++) {
        var phi = Math.random() * 2 * Math.PI;
        var costheta = Math.random() * 2 - 1;
        var u = Math.random();

        var theta = Math.acos(costheta);
        // generate some more stars near the center for exaggerated parallax effect
        var R, r;
        if (u < 0.2) {
            R = radius * Math.pow(u, 0.5);
            r = 0.5 + 2 * R / radius * Math.random();
        } else if (u < 0.5) {
            R = radius * 10 * u / 0.4;
            r = 10 + 2 * R / radius * Math.random();
        } else if (u < 0.95) {
            R = radius * 20 * u / 0.7;
            r = 20 + 2 * R / radius * Math.random();
        } else {
            R = radius * 20 * u / 0.95;
            r = 30 + 2 * R / radius * Math.random();
        }

        var x = R * Math.sin(theta) * Math.cos(phi);
        var y = R * Math.sin(theta) * Math.sin(phi);
        var z = R * Math.cos(theta);

        if (filter(x, y, z, R)) continue;

        var starGeometry = new THREE.SphereGeometry(r);
        var starMesh = new THREE.Mesh(starGeometry, MATERIAL.STAR);
        starMesh.position.set(x, y, z);
        starMesh.updateMatrix();
        starsGeometry.merge(starGeometry, starMesh.matrix);
    }

    return new THREE.Mesh(starsGeometry, MATERIAL.STAR);
};

import { THREE } from "engine";
import MATERIAL from "const/material";

export var Starfield = function(num, radius, filter) {
    var starsGeometry = new THREE.Geometry();
    var starMaterial = new THREE.MeshBasicMaterial({
        color: 0xDDDDFF
    });
    for (let i = 0; i < num; i++) {
        var phi = Math.random() * 2 * Math.PI;
        var costheta = Math.random() * 2 - 1;
        var u = Math.random();

        var theta = Math.acos(costheta);
        // generate some more stars near the center for exaggerated parallax effect
        var R, r;
        if (u < 0.8) {
            R = radius * Math.pow(u, 0.5);
            r = 0.5 + 2 * R / radius * Math.random();
        } else {
            R = radius * 10 * u / 0.8;
            r = 10 + 2 * R / radius * Math.random();
        }

        var x = R * Math.sin(theta) * Math.cos(phi);
        var y = R * Math.sin(theta) * Math.sin(phi);
        var z = R * Math.cos(theta);

        if (filter(x, y, z, R)) continue;

        var starGeometry = new THREE.SphereGeometry(r);
        var starMesh = new THREE.Mesh(starGeometry, starMaterial);
        starMesh.position.set(x, y, z);
        starMesh.updateMatrix();
        starsGeometry.merge(starGeometry, starMesh.matrix);
    }

    return new THREE.Mesh(starsGeometry, starMaterial);
};

export var Sun = function(radius, segments=32) {
    var light = new THREE.PointLight(MATERIAL.SUN.color.getHex(), 0.8, 10000);
    const geometry = new THREE.SphereGeometry(radius, segments, segments);
    var mesh = new THREE.Mesh(geometry, MATERIAL.SUN);
    light.add(mesh);
    return light;
};

export var Grid = function(worldSize, stepSize) {
    var grid = new THREE.GridHelper(worldSize, stepSize);
    grid.position.set(-stepSize/2, 0, -stepSize/2);
    return grid;
}

// adapted from http://soledadpenades.com/articles/three-js-tutorials/drawing-the-coordinate-axes/

const LINE_WIDTH = 3;

function buildAxis(dest, hex, dashed=false) {
    const geometry = new THREE.Geometry();
    var material;

    if (dashed) {
        material = new THREE.LineDashedMaterial({ linewidth: LINE_WIDTH, color: hex, dashSize: LINE_WIDTH, gapSize: LINE_WIDTH });
    } else {
        material = new THREE.LineBasicMaterial({ linewidth: LINE_WIDTH, color: hex });
    }

    geometry.vertices.push(new THREE.Vector3(0, 0, 0));
    geometry.vertices.push(dest.clone());
    geometry.computeLineDistances(); // This one is SUPER important, otherwise dashed lines will appear as simple plain lines

    return new THREE.Line(geometry, material, THREE.LineSegments);
};

export var Axes = function(length) {
    var axes = new THREE.Object3D();
    axes.add(buildAxis(new THREE.Vector3(length, 0, 0),  0xFF0000, false)); // +X
    axes.add(buildAxis(new THREE.Vector3(-length, 0, 0), 0xFF0000, true));  // -X
    axes.add(buildAxis(new THREE.Vector3(0, length, 0),  0x00FF00, false)); // +Y
    axes.add(buildAxis(new THREE.Vector3(0, -length, 0), 0x00FF00, true));  // -Y
    axes.add(buildAxis(new THREE.Vector3(0, 0, length),  0x0000FF, false)); // +Z
    axes.add(buildAxis(new THREE.Vector3(0, 0, -length), 0x0000FF, true));  // -Z
    return axes;
};

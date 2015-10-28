import { THREE } from "engine";
import MATERIAL from "const/material";

var SkySphere = function(texture, radius, segments=32) {
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
};

var Sun = function(radius, segments=32) {
    var light = new THREE.PointLight(0xFFFFAA, 0.8, 10000);
    const geometry = new THREE.SphereGeometry(radius, segments, segments);
    var mesh = new THREE.Mesh(geometry, MATERIAL.SUN);
    light.add(mesh);
    return light;
};

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

var Axes = function(length) {
    var axes = new THREE.Object3D();
    axes.add(buildAxis(new THREE.Vector3(length, 0, 0),  0xFF0000, false)); // +X
    axes.add(buildAxis(new THREE.Vector3(-length, 0, 0), 0xFF0000, true));  // -X
    axes.add(buildAxis(new THREE.Vector3(0, length, 0),  0x00FF00, false)); // +Y
    axes.add(buildAxis(new THREE.Vector3(0, -length, 0), 0x00FF00, true));  // -Y
    axes.add(buildAxis(new THREE.Vector3(0, 0, length),  0x0000FF, false)); // +Z
    axes.add(buildAxis(new THREE.Vector3(0, 0, -length), 0x0000FF, true));  // -Z
    return axes;
};

module.exports = { Axes, SkySphere, Sun };

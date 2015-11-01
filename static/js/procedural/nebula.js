import { THREE } from "engine";
import { noise, perlin } from "procedural/noise";

function shuffle(o){
    for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
}

var PerlinMaterial = function(width, height, side, opacity=1) {
    var canvas = document.createElement("canvas");
    var context = canvas.getContext("2d");

    canvas.width = width;
    canvas.height = height;

    var imageData = context.createImageData(width, height);

    var offsetX = Math.random() * 100;
    var offsetY = Math.random() * 100;

    var rgb = [0, 1, 2];
    shuffle(rgb);

    var p0 = rgb[0];
    var cx0 = Math.random() * 0.0051;
    var cy0 = Math.random() * 0.0048;

    var p1 = rgb[1];
    var cx1 = Math.random() * 0.0024;
    var cy1 = Math.random() * 0.0019;

    var p2 = rgb[2];
    var cx2 = Math.random() * 0.038;
    var cy2 = Math.random() * 0.054;

    for (let i = 0; i < width; i++) {
        for (let j = 0; j < height; j++) {
            var x = i + offsetX;
            var y = j + offsetY;

            // set opacity
            var r = Math.sqrt(
                Math.pow((i - width / 2) / width, 2) +
                Math.pow((j - height / 2) / height, 2)
            ) * Math.sqrt(2);
            imageData.data[3 + 4 * (i + width * j)] = 255 * opacity * Math.pow(1 - r, 3);

            imageData.data[p0 + 4 * (i + width * j)] = 2048 * Math.abs(perlin(x * cx0, y * cy0, 3));
            imageData.data[p1 + 4 * (i + width * j)] = 1024 * Math.abs(perlin(x * cx1, y * cy1, 5));
            imageData.data[p2 + 4 * (i + width * j)] = 256 * Math.abs(perlin(x * cx2, y * cy2, 7));
        }
    }

    context.putImageData(imageData, 0, 0);

    var texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;

    var material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        depthWrite: false
    });

    if (side !== undefined) {
        material.side = side;
    }
    return material;
};

export var Nebulas = function(scale) {
    var nebulas = new THREE.Object3D();

    var area = scale * scale;

    var R = 500 * Math.floor(100 * Math.random()) + 5000;
    var theta = 2 * Math.PI * Math.random();
    var phi = Math.acos(2 * Math.random() - 1);

    // add some perlin textured sphere segments at close range
    var nSpheres = Math.floor(Math.random() * 4) + 3;
    for (let i = 0; i < nSpheres; i++) {
        var width =  Math.pow(2, Math.floor(Math.random() + Math.log2(scale) - 1 + 0.5));
        var height = area / width;

        var material = PerlinMaterial(width, height, THREE.DoubleSide, Math.random() * 0.2 + 0.5);

        var phiStart = Math.random() * 2 * Math.PI;
        var phiLength = Math.random() * Math.PI / 3 + Math.PI / 3;
        var thetaStart = Math.random() * Math.PI / 2 + Math.PI / 12;
        var thetaLength = Math.random() * (Math.PI - thetaStart - Math.PI / 6) + Math.PI / 4;

        var segment = new THREE.Mesh(new THREE.SphereGeometry(R, 32, 32, phiStart, phiLength, thetaStart, thetaLength), material);
        segment.rotation.z = Math.random() * Math.PI;

        nebulas.add(segment);

        R = 500 * Math.floor(100 * Math.random()) + 5000;
        theta += Math.PI + Math.PI / 3 * Math.random();
        phi += Math.PI + Math.PI / 3 * Math.random();
    }

    // add some perlin textured planes really far away for dat sweet parallax
    R = 500 * Math.floor(100 * Math.random()) + 50000;
    theta = 2 * Math.PI * Math.random();
    phi = Math.acos(2 * Math.random() - 1);

    var nPlanes = Math.floor(Math.random() * 3) + 3;
    for (let i = 0; i < nPlanes; i++) {
        var x = R * Math.cos(theta) * Math.sin(phi);
        var y = R * Math.sin(theta) * Math.sin(phi);
        var z = R * Math.cos(phi);

        var width =  Math.pow(2, Math.floor(Math.random() + Math.log2(scale) - 1 + 0.5));
        var height = area / width;
        var material = PerlinMaterial(width, height, THREE.DoubleSide, Math.random() * 0.2 + 0.6);

        var aura = new THREE.Mesh(new THREE.PlaneGeometry(width * scale, height * scale), material);
        aura.position.set(x, y, z);
        aura.lookAt(new THREE.Vector3());
        aura.rotation.z = Math.random() * Math.PI * 2;
        nebulas.add(aura);

        R = 500 * Math.floor(100 * Math.random()) + 50000;
        theta += Math.PI + 0.2 * Math.random();
        phi += Math.PI + 0.2 * Math.random();
    }

    return nebulas;
};

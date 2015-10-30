import { THREE } from "engine";
import { noise, perlin } from "procedural/noise";

var scratch = document.getElementById("scratch");

export var Cloud = function(width, height, scaleX, scaleY) {
    var canvas = document.createElement("canvas");
    var context = canvas.getContext("2d");

    canvas.width = width;
    canvas.height = height;

    context.fillStyle = "black";
    context.fillRect(0, 0, width, height);

    var imageData = context.createImageData(width, height);
    var R = Math.sqrt(Math.pow(width / 2, 2) + Math.pow(height / 2, 2));
    for (let i = 0; i < width; i++) {
        for (let j = 0; j < height; j++) {
            // set opacity
            var r = Math.sqrt(Math.pow(i - width / 2, 2) + Math.pow(j - height / 2, 2)) / R;
            imageData.data[3 + 4 * (i + width * j)] = 255 * Math.pow(1 - r, 3);

            imageData.data[0 + 4 * (i + width * j)] = 2048 * Math.abs(perlin(i * 0.0041, j * 0.0062, 3));
            imageData.data[1 + 4 * (i + width * j)] = 2048 * Math.abs(perlin(i * 0.0027, j * 0.0017, 3));
            imageData.data[2 + 4 * (i + width * j)] = 256 * Math.abs(perlin(i * 0.033, j * 0.061, 3));

        }
    }

    context.putImageData(imageData, 0, 0);

    var texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;

    var material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        side: THREE.DoubleSide,
    });

    var mesh = new THREE.Mesh(new THREE.PlaneGeometry(width, height), material);
    mesh.scale.x = scaleX;
    mesh.scale.y = scaleY;
    return mesh;
};

import THREE from "three.js";
import { perlin } from "procedural/noise";

var Biome = function() {
    this.chunks = {};

    this.put = function(x, y, chunk) {
        if (!(x in this.chunks)) {
            this.chunks[x] = {};
        }

        this.chunks[x][y] = chunk;
    };

    this.get = function(x, y) {
        if (!(x in this.chunks)) {
            return undefined;
        }

        return this.chunks[x][y];
    };

    this.cull = function(x, y, cb) {
        for (var xc in this.chunks) {
            for (var yc in this.chunks[xc]) {
                if (cb(xc, yc, this.chunks[xc][yc])) {
                    delete this.chunks[xc][yc];
                }
            }
        }
    }
}

var BiomeMap = function(size) {
    const data = new Uint8Array(3*size*size);
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            const z1 = 255 * perlin(i/size, j/size, 4) | 0;
            const z2 = 255 * perlin(i/size, j/size, 8) | 0;

            if (z1 < 64) {
                data[0 + 3 * (i + size * j)] = 255;
            } else if (z1 < 128) {
                data[0 + 3 * (i + size * j)] = 128;
            } else {
                data[0 + 3 * (i + size * j)] = 0;
            }

            if (z2 < 64) {
                data[1 + 3 * (i + size * j)] = 255;
            } else if (z2 < 128) {
                data[1 + 3 * (i + size * j)] = 128;
            } else {
                data[1 + 3 * (i + size * j)] = 0;
            }
        }
    }

    const texture = new THREE.DataTexture(data, size, size, THREE.RGBFormat);
    texture.needsUpdate = true;
    const geometry = new THREE.PlaneGeometry(size, size);
    const material = new THREE.MeshBasicMaterial({
        map: texture,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.5
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.x = -90*Math.PI/180;
    return mesh;
};

export default { BiomeMap, Biome };

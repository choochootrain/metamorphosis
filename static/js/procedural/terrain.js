import { THREE } from "engine";
import { noise, perlin } from "procedural/noise";
import ndarray from "util/ndarray";

import material from "const/material";

function generateHeightmap(worldSize, tileSize, chunkX, chunkY, func) {
    const size = worldSize / tileSize + 1;
    const mid = size / 2 | 0;

    var data = new ndarray.fill(size, size, (i, j) => {
        var x = i + chunkX * (size - 1);
        var y = j + chunkY * (size - 1);
        var z = func(x, y);

        return new THREE.Vector3((i  - mid) * tileSize, z, (j  - mid) * tileSize);
    });

    return data;
}

function buildGeometry(data, sample=1) {
    const size = Math.sqrt(data.size);
    const mid = (size - 1) / 2 | 0;
    const geometry = new THREE.Geometry();

    var c = 0;
    for (let i = 0; i < size - 1; i += sample) {
        for (let j = 0; j < size - 1; j += sample) {
            var i2 = Math.min(i + sample, size - 1);
            var j2 = Math.min(j + sample, size - 1)

            var v1 = data.get(i , j );
            var v2 = data.get(i2, j );
            var v3 = data.get(i , j2);
            var v4 = data.get(i2, j2);

            //TODO dont alternate face sides
            geometry.vertices.push(v1, v2, v3, v4);
            geometry.faces.push(new THREE.Face3(c, c + 1, c + 2), new THREE.Face3(c + 1, c + 2, c + 3));
            c += 4;
        }
    }

    geometry.mergeVertices();
    geometry.computeFaceNormals();
    return geometry;
}

export default {
    Ground: function(worldSize, chunkX, chunkY) {
        const tileSize = 1;
        const data = generateHeightmap(worldSize, tileSize, chunkX, chunkY, (x, y) => {
            var z = 0;

            var p0 = 8   * noise.perlin2(x * 0.01, y * 0.01);
            var p1 = 5   * noise.perlin2(x * 0.03, y * 0.03);
            var p2 = 2   * noise.perlin2(x * 0.1 , y * 0.1 );
            var p3 = 0.2 * noise.perlin2(x * 0.9 , y * 0.9 );

            z += (p0 > 0 ? 1 : -1) * Math.pow(p0, 2);
            z += (p1 > 0 ? 1 : -1) * Math.pow(p1, 2);
            z += (p2 > 0 ? p2 : Math.pow(2, p2) - 1);
            z += (p3 > 0 ? p3 : Math.pow(2, p3) - 1);

            return z;
        });

        var lod = new THREE.LOD();
        for (let i = 0; i < 6; i++) {
            var geometry = buildGeometry(data, Math.pow(2, i));
            var mesh = new THREE.Mesh(geometry, material.GROUND);
            lod.addLevel(mesh, worldSize * i);
        }
        lod.position.x = chunkX * worldSize;
        lod.position.z = chunkY * worldSize;
        lod.updateMatrixWorld();

        return lod;
    },

    Water: function(worldSize) {
        const tileSize = 2;
        const data = generateHeightmap(worldSize, tileSize, 0, 0, (x, y) => 2 * Math.pow(noise.perlin2(0.3 * x, 0.3 * y)));
        const geometry = buildGeometry(data);
        const mesh = new THREE.Mesh(geometry, material.WATER);
        mesh.position.y = -5;
        return mesh;
    },

    DiamondSquare: function(worldSize, initializer) {
        const size = worldSize + 1;
        var data = new Array(size*size);

        if (initializer) {
            initializer(data, size);
        } else {
            data[0 + size * 0] =                   new THREE.Vector3(0,        0,        size / 2 * (Math.random() - 0.5));
            data[(size - 1) + size * 0] =          new THREE.Vector3(size - 1, 0,        size / 2 * (Math.random() - 0.5));
            data[0 + size * (size - 1)] =          new THREE.Vector3(0,        size - 1, size / 2 * (Math.random() - 0.5));
            data[(size - 1) + size * (size - 1)] = new THREE.Vector3(size - 1, size - 1, size / 2 * (Math.random() - 0.5));
        }

        var q = [];
        q.enqueue = function(x, y, iter) {
            //TODO do this efficiently
            var s = size >>> (1 + (iter >>> 1));
            if (x >= 0 && x < size && y >= 0 && y < size && s >= 1) {
                var seen = false;
                for (var i = 0; i < q.length; i++) {
                    if (q[i].x === x && q[i].y === y && q[i].iter === iter) {
                        seen = true;
                        break;
                    }
                }

                if (!seen) {
                    this.push({ x, y, iter });
                }
            }
        }

        q.enqueue(size >>> 1, size >>> 1, 0);

        while (q.length > 0) {
            var length = q.length;
            for (let l = 0; l < length; l++) {
                var ctx = q.shift();
                var x = ctx.x, y = ctx.y, iter = ctx.iter;
                var s = size >>> (1 + (iter >>> 1));

                if (iter % 2 == 0) {
                    if (!data[x + size * y]) {
                        var z1 = data[x - s + size * (y - s)].z;
                        var z2 = data[x + s + size * (y - s)].z;
                        var z3 = data[x - s + size * (y + s)].z;
                        var z4 = data[x + s + size * (y + s)].z;

                        var z = (z1 + z2 + z3 + z4) / 4 + 2*s * (Math.random() - 0.5);
                        data[x + size * y] = new THREE.Vector3(x, y, z);
                    }

                    q.enqueue(x - s, y,     iter + 1);
                    q.enqueue(x + s, y,     iter + 1);
                    q.enqueue(x,     y - s, iter + 1);
                    q.enqueue(x,     y + s, iter + 1);
                } else {
                    if (!data[x + size * y]) {
                        var zs = 0;
                        var zc = 0;

                        if (x - s >= 0)   { zs += data[x - s + size *  y     ].z; zc++ }
                        if (x + s < size) { zs += data[x + s + size *  y     ].z; zc++ }
                        if (y - s >= 0)   { zs += data[x     + size * (y - s)].z; zc++ }
                        if (y + s < size) { zs += data[x     + size * (y + s)].z; zc++ }

                        var z = zs / zc + (s >>> 0) * (Math.random() - 0.5);
                        data[x + size * y] = new THREE.Vector3(x, y, z);
                    }

                    var s2 = s >>> 1;
                    q.enqueue(x + s2, y + s2, iter + 1);
                    q.enqueue(x + s2, y - s2, iter + 1);
                    q.enqueue(x - s2, y + s2, iter + 1);
                    q.enqueue(x - s2, y - s2, iter + 1);
                }
            }
        }

        var geometry = new THREE.Geometry();

        var c = 0;
        for (let i = 0; i < size - 1; i++) {
            for (let j = 0; j < size - 1; j++) {
                var v1 = data[i +     size *  j];
                var v2 = data[i + 1 + size *  j];
                var v3 = data[i +     size * (j + 1)];
                var v4 = data[i + 1 + size * (j + 1)];

                //TODO dont alternate face sides
                geometry.vertices.push(v1, v2, v3, v4);
                geometry.faces.push(new THREE.Face3(c, c + 1, c + 2), new THREE.Face3(c + 1, c + 2, c + 3));
                c = c + 4;
            }
        }

        geometry.mergeVertices();
        geometry.computeFaceNormals();
        var mesh = new THREE.Mesh(geometry, material.GROUND);
        mesh.rotation.x = -90*Math.PI/180;
        return mesh;
    }
};

import { THREE } from "engine";
import { noise, perlin } from "procedural/noise";

function configToData(world_size, config) {
    const size = world_size/config.tile_size;

    const data = new Array(size*size);
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            var z = 0;
            for (let k = 0; k < config.layers.length; k++) {
                if (!config.layers[k].enabled) { continue; }

                const frequency = config.layers[k].frequency;
                const post_compute = config.layers[k].post_compute;
                z += post_compute(noise.perlin2(frequency*i, frequency*j));
            }

            data[i + size * j] = new THREE.Vector3((i-size/2)*config.tile_size, (j-size/2)*config.tile_size, z);
        }
    }

    return data;
}

function dataToGeometry(data) {
    const size = Math.sqrt(data.length);
    const geometry = new THREE.Geometry();

    var c = 0;
    for (let i = 0; i < size - 1; i++) {
        for (let j = 0; j < size - 1; j++) {
            const v1 = data[i     + size *  j];
            const v2 = data[i + 1 + size *  j];
            const v3 = data[i     + size * (j + 1)];
            const v4 = data[i + 1 + size * (j + 1)];

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

const ground_config = {
    tile_size: 1,
    material: new THREE.MeshLambertMaterial({
        color: 0x882244,
        transparent: false,
        emissive: 0x002200,
        side: THREE.DoubleSide
    }),
    layers: [
        {
            enabled: true,
            frequency: 0.01,
            post_compute: function(z) {
                z = z * 8;
                if (z < 0) {
                    return -Math.pow(z, 2);
                } else {
                    return Math.pow(z, 2);
                }
            }
        },
        {
            enabled: true,
            frequency: 0.03,
            post_compute: function(z) {
                z = z * 5;
                if (z < 0) {
                    return -Math.pow(z, 2);
                } else {
                    return Math.pow(z, 2);
                }
            }
        },
        {
            enabled: true,
            frequency: 0.1,
            post_compute: function(z) {
                z = 2 * z;
                if (z < 0) {
                    return Math.pow(2, z) - 1;
                } else {
                    return z;
                }
            }
        },
        {
            enabled: true,
            frequency: 0.9,
            post_compute: function(z) {
                z = z * 0.2;
                if (z < 0) {
                    return Math.pow(2, z) - 1;
                } else {
                    return z;
                }
            }
        }
    ]
};

var water_config = {
    tile_size: 2,
    material: new THREE.MeshLambertMaterial({
        color: 0xFF4488,
        transparent: true,
        opacity: 0.9,
        emissive: 0x004488,
        side: THREE.DoubleSide,
    }),
    layers: [
        {
            enabled: true,
            frequency: 0.3,
            post_compute: function(z) {
                return 2*Math.pow(z, 2);
            }
        },
        {
            enabled: true,
            frequency: 0.9,
            post_compute: function(z) {
                return 0.2*z;
            }
        }
    ]
};

export default {
    Ground: function(world_size) {
        const data = configToData(world_size, ground_config);
        const geometry = dataToGeometry(data);
        const mesh = new THREE.Mesh(geometry, ground_config.material);
        mesh.rotation.x = -90*Math.PI/180;
        return mesh;
    },
    Water: function(world_size) {
        const data = configToData(world_size, water_config);
        const geometry = dataToGeometry(data);
        const mesh = new THREE.Mesh(geometry, water_config.material);
        mesh.rotation.x = -90*Math.PI/180;
        return mesh;
    },
    DiamondSquare: function(world_size, initializer) {
        var size = world_size + 1;
        window.data = new Array(size*size);

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

        const geometry = new THREE.Geometry();

        var c = 0;
        for (let i = 0; i < size - 1; i++) {
            for (let j = 0; j < size - 1; j++) {
                const v1 = data[i +     size *  j];
                const v2 = data[i + 1 + size *  j];
                const v3 = data[i +     size * (j + 1)];
                const v4 = data[i + 1 + size * (j + 1)];

                //TODO dont double push vertices
                //TODO dont alternate face sides
                geometry.vertices.push(v1, v2, v3, v4);
                geometry.faces.push(new THREE.Face3(c, c + 1, c + 2), new THREE.Face3(c + 1, c + 2, c + 3));
                c = c + 4;
            }
        }

        geometry.computeFaceNormals();
        var material = new THREE.MeshLambertMaterial({
          color: 0x882244,
          transparent: false,
          emissive: 0x002200,
          side: THREE.DoubleSide
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.rotation.x = -90*Math.PI/180;
        return mesh;
    }
};

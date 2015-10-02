import { THREE } from "engine";
import noise from "procedural/noise";
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
            const v1 = data[i + size * j];
            const v2 = data[i + 1 + size * j];
            const v3 = data[i + size * (j + 1)];
            const v4 = data[i + 1 + size * (j + 1)];

            //TODO dont double push vertices
            //TODO dont alternate face sides
            geometry.vertices.push(v1, v2, v3, v4);
            geometry.faces.push(new THREE.Face3(c, c + 1, c + 2), new THREE.Face3(c + 1, c + 2, c + 3));
            c = c + 4;
        }
    }

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
    }
};

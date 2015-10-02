import { THREE, CANNON } from "engine";
import { NORMAL } from "materials";
import { perlin } from "procedural/noise";

function makeTerrain(size) {
    const data = new Uint8Array(size*size);
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            data[i + size * j] = 255 * perlin(i/size, j/size, 8) | 0;
        }
    }

    return data;
}

export default function(world_size, world, scene) {
    var data = makeTerrain(world_size);

    const size = Math.sqrt(data.length);
    const geometry = new THREE.Geometry();

    var seen = {};
    function makePolygonMesh(x, y, z) {
        var index = seen[x + " " + y + " " + z];
        if (index !== undefined) {
            return index;
        }

        var newIndex = geometry.vertices.length;
        seen[x + " " + y + " " + z] = newIndex;
        geometry.vertices.push(new THREE.Vector3(x, y, z));
        return newIndex;
    }

    var w = 50;
    for (let i = 0; i < size - 1; i++) {
        for (let j = 0; j < size - 1; j++) {
            var v1 = makePolygonMesh(w*(i-size/2), w*(j-size/2), data[i + size * j]);
            var v2 = makePolygonMesh(w*(i+1-size/2), w*(j-size/2), data[i + 1 + size * j]);
            var v3 = makePolygonMesh(w*(i-size/2), w*(j+1-size/2), data[i + size * (j + 1)]);
            var v4 = makePolygonMesh(w*(i+1-size/2), w*(j+1-size/2), data[i + 1 + size * (j + 1)]);

            //TODO dont alternate face sides
            geometry.faces.push(new THREE.Face3(v1,v2,v3), new THREE.Face3(v2,v4,v3));
        }
    }

    geometry.computeFaceNormals();

    var mat = new THREE.MeshLambertMaterial({
        color: 0x44DD88,
        emissive: 0x002255,
        side: THREE.DoubleSide
    });
    var mesh = new THREE.Mesh(geometry, mat);
    mesh.receiveShadow = true;
    mesh.castShadow = true;
    mesh.rotation.x = -90*Math.PI/180;

    var shape = new CANNON.ConvexPolyhedron(geometry.vertices.map((x) => new CANNON.Vec3(x.x, x.y, x.z)),
            geometry.faces.map((x) => [x.a, x.b, x.c]));
    var body = new CANNON.Body({ mass: 0, material: NORMAL });
    body.addShape(shape);
    body.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0.2, 0), -Math.PI / 2);
    body.position.set(0, 0, 0);

    mesh.position.copy(body.position);
    mesh.quaternion.copy(body.quaternion);

    scene.add(mesh);
    world.addBody(body);
}

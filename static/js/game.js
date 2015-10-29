import { THREE, OrbitControls, CANNON, KeyboardState } from "engine";
import { NORMAL } from "materials";
import { Axes, Grid, Sun, Starfield } from "props";

import { dat, toggleObject } from "util/gui";

import MATERIAL from "const/material";
import Terrain from "procedural/terrain";
import { perlin } from "procedural/noise";
import { Biome, BiomeChunk } from "procedural/biome";

import Plane from "util/plane";
import Amoeba from "amoeba";

export default class Game {
    constructor(container_id, worldSize=32) {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.view_angle = 45;
        this.aspect = this.width / this.height;
        this.near = 0.1;
        this.far = 100000;
        this.worldSize = worldSize;

        this.clock = new THREE.Clock();
        this.renderer = new THREE.WebGLRenderer({ alpha: true });
        this.renderer.setSize(this.width, this.height);
        this.renderer.setClearColor(0x000000, 1);

        this.camera = new THREE.PerspectiveCamera(this.view_angle, this.aspect, this.near, this.far);
        this.camera.position.y = 5;
        this.camera.position.x = -20;

        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.keyboard = new KeyboardState();

        this.scene = new THREE.Scene();
        this.biome = new Biome();

        document.getElementById(container_id).appendChild(this.renderer.domElement);
        window.addEventListener("resize", () => this.resize());
    }

    init() {
        this.gui = new dat.GUI();

        this.propConfig = {
            "starfield": true,
            "axes": true,
            "grid": true
        };

        // don't put stars too close to the terrain
        this.propConfig._starfield = Starfield(1500, this.worldSize * 64, (x, y, z, R) => Math.abs(y) < this.worldSize * 4 && R < this.worldSize * 48);
        this.propConfig._axes = Axes(16 * this.worldSize);
        this.propConfig._grid = Grid(16 * this.worldSize, this.worldSize);

        var props = this.gui.addFolder("Props");
        props.add(this.propConfig, "starfield").onChange(toggleObject("starfield", this.propConfig, this.scene));
        props.add(this.propConfig, "axes").onChange(toggleObject("axes", this.propConfig, this.scene));
        props.add(this.propConfig, "grid").onChange(toggleObject("grid", this.propConfig, this.scene));

        this.lightConfig = {
            "ambientLightColor": 0x222222,
            "sunColor": MATERIAL.SUN.color.getHex(),
            "sunX": this.worldSize * 16,
            "sunY": this.worldSize * 8,
            "sunZ": 0,
            "spotLightColor": 0xAA5533,
            "spotLightX": 0,
            "spotLightY": this.worldSize * 16,
            "spotLightZ": 0,
            "spotLightHelper": false
        };

        var ambientLight = new THREE.AmbientLight(this.lightConfig.ambientLightColor);
        this.scene.add(ambientLight);

        this.sun = Sun(20);
        this.sun.position.set(this.lightConfig.sunX, this.lightConfig.sunY, this.lightConfig.sunZ);
        this.scene.add(this.sun);

        var spotLight = new THREE.SpotLight(0xAA5533);
        spotLight.position.set(this.lightConfig.spotLightX, this.lightConfig.spotLightY, this.lightConfig.spotLightZ);
        this.scene.add(spotLight);

        var lights = this.gui.addFolder("Lights");
        lights.addColor(this.lightConfig, "ambientLightColor").onChange((color) => ambientLight.color = new THREE.Color(color));
        lights.addColor(this.lightConfig, "sunColor").onChange((color) => {
            MATERIAL.SUN.color = new THREE.Color(color);
            this.sun.color = new THREE.Color(color);
        });
        lights.add(this.lightConfig, "sunX").onChange((x) => this.sun.position.x = x);
        lights.add(this.lightConfig, "sunY").onChange((y) => this.sun.position.y = y);
        lights.add(this.lightConfig, "sunZ").onChange((z) => this.sun.position.z = z);
        lights.addColor(this.lightConfig, "spotLightColor").onChange((color) => spotLight.color = new THREE.Color(color));
        lights.add(this.lightConfig, "spotLightX").onChange((x) => spotLight.position.x = x);
        lights.add(this.lightConfig, "spotLightY").onChange((y) => spotLight.position.y = y);
        lights.add(this.lightConfig, "spotLightZ").onChange((z) => spotLight.position.z = z);
        lights.add(this.lightConfig, "spotLightHelper").onChange((enabled) => {
            if (enabled) {
                this.lightConfig._spotLightHelper = new THREE.SpotLightHelper(spotLight);
                this.scene.add(this.lightConfig._spotLightHelper);
            } else {
                this.scene.remove(this.lightConfig._spotLightHelper);
                delete this.lightConfig._spotLightHelper;
            }
        });

        this.amoeba = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), new THREE.MeshLambertMaterial({ color: 0xFFFF00, emissive: 0xAA0033 }));
        this.amoeba.add(this.camera);
        this.amoeba.position.y = this.worldSize / 2;
        this.scene.add(this.amoeba);

        this.terrainConfig = {
            "groundColor": MATERIAL.GROUND.color.getHex(),
            "groundEmissive": MATERIAL.GROUND.emissive.getHex(),
            "groundShininess": MATERIAL.GROUND.shininess,
            "waterColor": MATERIAL.WATER.color.getHex(),
            "waterEmissive": MATERIAL.WATER.emissive.getHex(),
            "waterShininess": MATERIAL.WATER.shininess,
            "waterOpacity": MATERIAL.WATER.opacity,
            "lod": "camera",
            "visibility": 20,
            "fogColor": 0x1E1C19,
            "fogDensity": 0.0001
        };

        this.scene.fog = new THREE.FogExp2(this.terrainConfig.fogColor, this.terrainConfig.fogDensity);
        this.terrainConfig.lodTarget = this.camera;

        var terrain = this.gui.addFolder("Terrain");
        terrain.addColor(this.terrainConfig, "groundColor").onChange((color) => MATERIAL.GROUND.color = new THREE.Color(color));
        terrain.addColor(this.terrainConfig, "groundEmissive").onChange((color) => MATERIAL.GROUND.emissive = new THREE.Color(color));
        terrain.add(this.terrainConfig, "groundShininess").min(0).max(100).onChange((val) => MATERIAL.GROUND.shininess = val);
        terrain.addColor(this.terrainConfig, "waterColor").onChange((color) => MATERIAL.WATER.color = new THREE.Color(color));
        terrain.addColor(this.terrainConfig, "waterEmissive").onChange((color) => MATERIAL.WATER.emissive = new THREE.Color(color));
        terrain.add(this.terrainConfig, "waterShininess").min(0).max(255).onChange((val) => MATERIAL.WATER.shininess = val);
        terrain.add(this.terrainConfig, "waterOpacity", 0, 1).onChange((val) => MATERIAL.WATER.opacity = val);
        terrain.add(this.terrainConfig, "lod").options(["camera", "amoeba"]).onChange((val) => {
            if (val === "camera") {
                this.terrainConfig.lodTarget = this.camera;
            } else {
                this.terrainConfig.lodTarget = this.amoeba;
            }
        });
        terrain.add(this.terrainConfig, "visibility").min(1).max(100).step(1);
        terrain.addColor(this.terrainConfig, "fogColor").onChange((color) => this.scene.fog.color = new THREE.Color(color));
        terrain.add(this.terrainConfig, "fogDensity").min(0).max(0.01).onChange((val) => this.scene.fog.density = val);
    }

    resize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.renderer.setSize(this.width, this.height);
        this.camera.aspect = this.width / this.height;
        this.camera.updateProjectionMatrix();
    }

    update() {
        var delta = this.clock.getDelta();
        var timestamp = this.clock.getElapsedTime();

        if (this.keyboard.pressed("a")) {
            this.amoeba.rotation.y += 0.05;
        }
        if (this.keyboard.pressed("d")) {
            this.amoeba.rotation.y -= 0.05;
        }

        var n = new THREE.Vector3(1, 0, 0).applyEuler(this.amoeba.rotation);
        if (this.keyboard.pressed("w")) {
            this.amoeba.position.add(n);
        }
        if (this.keyboard.pressed("s")) {
            this.amoeba.position.add(n.negate());
        }

        if (this.keyboard.pressed("e")) {
            this.amoeba.position.y += 1;
        }
        if (this.keyboard.pressed("q")) {
            this.amoeba.position.y -= 1;
        }

        this.controls.update(delta);
        var chunkX = Math.floor(this.amoeba.position.x / this.worldSize + 0.5);
        var chunkY = Math.floor(this.amoeba.position.z / this.worldSize + 0.5);
        var visibility = this.terrainConfig.visibility;

        for (let i = -visibility; i <= visibility; i++) {
            for (let j = -visibility; j <= visibility; j++) {
                var x = chunkX + i;
                var y = chunkY + j;
                if (Math.pow(chunkX - x, 2) + Math.pow(chunkY - y, 2) > visibility) continue;
                if (!this.biome.get(x, y)) {
                    var terrainChunk = Terrain.Ground(this.worldSize, x, y);
                    this.scene.add(terrainChunk);
                    var waterChunk = Terrain.Water(this.worldSize, x, y);
                    this.scene.add(waterChunk);
                    this.biome.put(x, y, new BiomeChunk(terrainChunk, waterChunk));
                }

                var chunk = this.biome.get(x, y);
                chunk.terrain.update(this.terrainConfig.lodTarget);

                var size = Math.sqrt(chunk.water.geometry.vertices.length);
                var Fanimate = 2.3;
                var Pa = 100;
                var A = 0.2;
                for (let i = 0; i < chunk.water.geometry.vertices.length; i++) {
                    var v = chunk.water.geometry.vertices[i];
                    var x0 = this.worldSize * x + v.x;
                    var y0 = this.worldSize * y + v.z;
                    var Fo = 2 * Math.PI / 3 * (Math.pow(x0 - y0, 2) % 3) + Pa * perlin(x0 / Fanimate, y0 / Fanimate);
                    v.y = A * Math.sin(Fanimate * timestamp + Fo);
                }

                chunk.water.geometry.verticesNeedUpdate = true;
                chunk.water.geometry.normalsNeedUpdate = true;
                chunk.water.geometry.computeFaceNormals();
            }
        }

        //TODO move culling logic into biome
        //TODO add a universal dispose method
        this.biome.cull((x, y, chunk) => {
            if (Math.pow(chunkX - x, 2) + Math.pow(chunkY - y, 2) <= visibility) {
                return false;
            }

            this.scene.remove(chunk.terrain);
            for (let i = 0; i < chunk.terrain.levels.length; i++) {
                chunk.terrain.levels[i].object.geometry.dispose();
            }
            this.scene.remove(chunk.water);
            chunk.water.geometry.dispose();
            return true;
        });
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }
}

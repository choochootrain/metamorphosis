import THREE from "three";
import _OrbitControls from "three-orbit-controls";
const OrbitControls = _OrbitControls(THREE);

import Axes from "util/axes";
import SkySphere from "util/skysphere";

export default class Game {
  constructor(options) {
    this.WIDTH = window.innerWidth;
    this.HEIGHT = window.innerHeight;
    this.VIEW_ANGLE = 45;
    this.ASPECT = this.WIDTH / this.HEIGHT;
    this.NEAR = 0.1;
    this.FAR = 10000;

    this.renderer = new THREE.WebGLRenderer({ alpha: true });
    this.renderer.setSize(this.WIDTH, this.HEIGHT);
    this.renderer.setClearColor(0x000000, 1);

    this.camera = new THREE.PerspectiveCamera(this.VIEW_ANGLE, this.ASPECT, this.NEAR, this.FAR);
    this.camera.position.x = 200;
    this.camera.position.y = 100;
    this.camera.position.z = 200;

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);

    this.scene = new THREE.Scene();
    this.scene.add(this.camera);

    document.getElementById(options.container_id).appendChild(this.renderer.domElement);
    window.addEventListener("resize", () => this.resize());
  }

  init() {
    this.scene.add(SkySphere("/static/assets/img/galaxy_starfield.png"));
    this.scene.add(Axes(this.WIDTH));
  }

  resize() {
    this.WIDTH = window.innerWidth;
    this.HEIGHT = window.innerHeight;
    this.renderer.setSize(this.WIDTH, this.HEIGHT);
    this.camera.aspect = this.WIDTH / this.HEIGHT;
    this.camera.updateProjectionMatrix()
  }

  update() {
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }
}

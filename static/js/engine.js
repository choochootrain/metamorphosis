import THREE from "three.js";
import CANNON from "cannon";
import _OrbitControls from "three-orbit-controls";
import KeyboardState from "vendor/keyboard_state";

const OrbitControls = _OrbitControls(THREE);

export default { THREE, OrbitControls, CANNON, KeyboardState };

import THREE from "three.js";
import CANNON from "cannon";

import _OrbitControls from "three-orbit-controls";
const OrbitControls = _OrbitControls(THREE);

import KeyboardState from "vendor/keyboard_state";

export default { THREE, OrbitControls, CANNON, KeyboardState };

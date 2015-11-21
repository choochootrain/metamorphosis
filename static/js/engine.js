import THREE from "three.js";
import CANNON from "cannon";

import _OrbitControls from "three-orbit-controls";
const OrbitControls = _OrbitControls(THREE);

import KeyboardState from "vendor/keyboard_state";

import ECS from "util/ecs";

import CopyShader from "vendor/three/CopyShader";
import DigitalGlitch from "vendor/three/DigitalGlitch";
import _EffectComposer from "vendor/three/EffectComposer";
import _RenderPass from "vendor/three/RenderPass";
import {MaskPass, ClearMaskPass} from "vendor/three/MaskPass";
import _ShaderPass from "vendor/three/ShaderPass";
import _GlitchPass from "vendor/three/GlitchPass";

THREE.CopyShader = CopyShader;
THREE.DigitalGlitch = DigitalGlitch;
THREE.EffectComposer = _EffectComposer(THREE)
THREE.RenderPass = _RenderPass(THREE);
THREE.MaskPass = MaskPass;
THREE.ClearMaskPass = ClearMaskPass;
THREE.ShaderPass = _ShaderPass(THREE);
THREE.GlitchPass = _GlitchPass(THREE);

export default { THREE, OrbitControls, CANNON, KeyboardState, ECS };

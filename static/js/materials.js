import { THREE, CANNON } from "engine";

const SLIPPERY = new CANNON.Material("slipperyMaterial", { friction: 0.0 });
const NORMAL = new CANNON.Material("normalMaterial", { friction: 0.3 });

export default {
    SLIPPERY,
    NORMAL
};

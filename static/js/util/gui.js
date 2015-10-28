import _dat from "vendor/dat.gui";

export const dat = _dat;
export var toggleObject = function(name, config, scene, autoAdd=true) {
    var callback = function(enabled) {
        if (enabled) {
            scene.add(config["_" + name]);
        } else {
            scene.remove(config["_" + name]);
        }
    }

    if (autoAdd) {
        callback(true);
    }

    return callback;
}

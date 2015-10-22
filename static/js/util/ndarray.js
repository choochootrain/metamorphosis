import ndarray from "ndarray";
import ndarray_fill from "ndarray-fill";

function array(width, height) {
    return ndarray(new Array(width * height), [width, height]);
}

function fill(width, height, filler) {
    return ndarray_fill(array(width, height), filler);
}

module.exports = { array, fill };

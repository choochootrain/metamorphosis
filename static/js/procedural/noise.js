import noisejs from "noisejs";
const noise = new noisejs.Noise(0.2);

function perlin(x, y, octaves=1) {
    var z = 0;
    var s = 0;
    for (var i = 0; i < octaves; i++) {
        var pp = 1 / (1 << i);   // (1 << i) same as Math.pow(2,i)
        var e = Math.PI / 2 * pp;  // rotate angle
        var ss = Math.sin(e);
        var cc = Math.cos(e);
        var xx = x * ss + y * cc;  // rotation
        var yy = -x * cc + y * ss;
        s += pp; // total amplitude
        var res = pp * noise.perlin2(xx / pp, yy / pp);
        if (i < 4) {
            z += (res > 0 ? 1 : -1) * Math.pow(res, 2);
        } else {
            z += res;
        }
    }
    return 2 * z / s;
}

module.exports = {
    noise,
    perlin
};

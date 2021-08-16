import { noise } from './noise';
import { elevationRescaling, worldCreator } from './worldCreator';

export const makeTerrain = (npoints, seed = Math.round(65536 * Math.random())) => {
    // Initiating Perlin noise
    noise.seed(seed);

    // Set of parameters for generating lands
    var contx = [];
    contx[0] = Math.floor(Math.random() * 4) + 3;
    for (let i = 1; i <= 5; i += 2) contx[i] = (Math.random() - 1) * 0.9 - 0.1;
    for (let i = 2; i <= 6; i += 2) contx[i] = Math.random() * 0.9 + 0.1;
    for (let i = 7; i <= 12; i++) contx[i] = Math.random() - 0.5;
    for (let i = 13; i <= 18; i++) contx[i] = Math.random() / 2 + 0.5;

    const gridLength = npoints * npoints * 2;
    let min = 1000000,
        max = -1000000;
    let zeroGrid = [];
    for (let k = 0; k < gridLength; k++) {
        const i = k % (npoints * 2);
        const j = Math.floor(k / (npoints * 2));
        const f = 0.5;
        const cx = -1.0 + (i + f * Math.random() + (1 - f) / 2 - 0.5) / npoints;
        const cy = -0.5 + (j + f * Math.random() + (1 - f) / 2 - 0.5) / npoints;
        const iter = worldCreator(cx, cy, seed, contx);
        if (iter > max) max = iter;
        if (iter < min) min = iter;
        zeroGrid.push({ z: iter, x: cx, y: cy, id: k, flux: 0, flux2: 0, nb: 0, h: 0, type: 0 });
    }

    zeroGrid.forEach(function (g) {
        g.z = elevationRescaling(g.z, (max + min) / 2.5, 1.05 * max);
        if (g.z <= 0) g.type = -1;
    });

    // Just keep relevant grid parameters
    zeroGrid.forEach(function (g) {
        //	delete g.id;
        delete g.flux;
        delete g.flux2;
        delete g.nb;
        delete g.h;
        delete g.type;
    });
    return zeroGrid;
};

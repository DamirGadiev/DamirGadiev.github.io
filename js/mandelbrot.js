console.log("Mandelbrot started");

/**
 * Get the box boundaries.
 * 
 * @param object center
 *   Position of the fractal center. 
 * @param integer span
 *   Span of the fractal 
 * @param real zoom
 *   Zoom of the fractal 
 */
function getBoundaries(center, span, zoom) {
    //return [center - Math.pow((span/2), zoom), center + Math.pow((span/2), zoom)]
    return {
        min: {
            x: getBoundary(center.x, span, zoom, "min"),
            y: getBoundary(center.y, span, zoom, "min"),
            z: getBoundary(center.z, span, zoom, "min"),
        },
        max: {
            x: getBoundary(center.x, span, zoom, "max"),
            y: getBoundary(center.y, span, zoom, "max"),
            z: getBoundary(center.z, span, zoom, "max"),
        },
    }
}

/**
 * Get the single boundary.
 */
function getBoundary(center, span, zoom, type = "low") {
    switch (type) {
        case "min":
            return center - Math.pow((span / 2), zoom);
            break;
        case "max":
            return center + Math.pow((span / 2), zoom);
            break;
        default:
            return false;
    }
}

/**
 * Prepare grid with the granulatity.
 */
function calculateBulbGrid(boundaries, granularity) {
    console.log("Calculating bulb coordinates");
    var points = [];
    var step = (boundaries.max.x - boundaries.min.x) / granularity;
    for (i = 0; i <= granularity; i++) {
        x = boundaries.min.x + i * step;
        for (j = 0; j <= granularity; j++) {
            y = boundaries.min.y + j * step;
            for (k = 0; k <= granularity; k++) {
                z = boundaries.min.z + k * step;
                points.push({
                    x: x,
                    y: y,
                    z: z,
                })
            }
        }
    }
    return points;
}

/**
 * Calculate the z -> z^n + c
 * @param {array} points 
 */
function calculateMandelbrot(points) {
    var mandelbrot = [];
    points.forEach(function (element) {
        mandelbrot.push(triplexPower(element, 2));
    });
    return mandelbrot;
}

/**
 * Helper function to map everything to 1d array.
 * @param {array} mandelbrot 
 */
function mandelbrotToArray(mandelbrot) {
    var vertices = [];
    mandelbrot.forEach(function (element) {
        vertices.push(element.x);
        vertices.push(element.y);
        vertices.push(element.z);
    })
    return new Float32Array(vertices);
}

/**
 * 
 * @param {triplex} z
 *   Object containing x, y, z coordinates. 
 * @param {integer} n 
 *   Power value.
 */
function triplexPower(z, n) {
    var triplex = {};
    var r = Math.sqrt((Math.pow(z.x, 2) + Math.pow(z.y, 2) + Math.pow(z.z, 2)));
    var tetha = Math.atan(z.y / z.x);
    var phi = Math.asin(z.z / r);
    triplex.x = Math.pow(r, n) * Math.cos(n * tetha) * Math.cos(n * phi);
    triplex.y = Math.pow(r, n) * Math.sin(n * tetha) * Math.cos(n * phi);
    triplex.z = Math.pow(r, n) * Math.sin(n * phi);
    return triplex;
}

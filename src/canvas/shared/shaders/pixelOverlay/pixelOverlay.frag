precision mediump float;

varying vec2 vUv;

uniform float uTime;
uniform float uHover;     // 0→1 appear, 1→0 disappear
uniform vec2 uResolution; // plane pixel dimensions
uniform vec3 uColor1;     // #eeeeee
uniform vec3 uColor2;     // #2ad0d5

#define GAP 6.0
#define MAX_SIZE 2.0
#define MIN_SIZE 0.5

float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 34.123);
    return fract(p.x * p.y);
}

void main() {
    vec2 uv = vUv * uResolution;

    // Grid cell
    vec2 cell = floor(uv / GAP);
    vec2 cellCenter = (cell + 0.5) * GAP;
    vec2 local = uv - cellCenter;

    // Per-cell random values
    float rnd = hash(cell);
    float rnd2 = hash(cell + 71.3);
    float rnd3 = hash(cell + 137.7);

    // Distance from center for radial reveal
    vec2 center = uResolution * 0.5;
    float dist = length(cellCenter - center);
    float maxDist = length(center);
    float normalizedDist = dist / maxDist;

    // Delayed radial appear
    float delay = normalizedDist * 0.7 + rnd * 0.3;
    float appear = smoothstep(delay - 0.05, delay + 0.35, uHover);

    // Shimmer oscillation once fully appeared
    float shimmerPhase = uTime * (1.0 + rnd2 * 3.0) + rnd * 6.28;
    float shimmer = mix(MIN_SIZE, MAX_SIZE, 0.5 + 0.5 * sin(shimmerPhase));

    float growSize = mix(0.0, MAX_SIZE, appear);
    float pixelSize = appear > 0.95 ? shimmer * appear : growSize;

    // Square pixel mask
    float halfSize = pixelSize * 0.5;
    float mask = step(abs(local.x), halfSize) * step(abs(local.y), halfSize);

    // Randomly pick color
    vec3 color = mix(uColor1, uColor2, step(0.5, rnd3));

    float alpha = mask * appear * 0.85;

    gl_FragColor = vec4(color, alpha);
}

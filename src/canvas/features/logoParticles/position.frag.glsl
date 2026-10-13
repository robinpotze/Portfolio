// Logo particle simulation, run by GPUComputationRenderer (it declares texturePosition and defines resolution).
uniform sampler2D tOrigin;
uniform sampler2D tGrid;
uniform sampler2D tRandom;
uniform float uTime;
uniform float uDelta;
uniform float uMorph;
uniform float uMorphStagger;
uniform float uSpring;
uniform float uCurlScale;
uniform float uCurlSpeed;
uniform float uCurlStrength;

#include ../../core/shaders/curl.glsl;

void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec3 pos = texture2D(texturePosition, uv).xyz;
    vec3 origin = texture2D(tOrigin, uv).xyz;
    vec3 grid = texture2D(tGrid, uv).xyz;
    vec4 random = texture2D(tRandom, uv);

    // Each particle lags by a random amount, so the panel dissolves instead of moving as one sheet.
    float morph = clamp((uMorph - random.w * uMorphStagger) / (1.0 - uMorphStagger), 0.0, 1.0);

    // Spring from the dot-matrix cell toward the logo surface as morph rises.
    vec3 goal = mix(grid, origin, morph);
    pos += (goal - pos) * uSpring * uDelta;

    // Curl swirl: barely there at rest (keeps the panel crisp), strongest halfway through the transition.
    pos += curlNoise(pos * uCurlScale + uTime * uCurlSpeed) * uCurlStrength * (0.02 + sin(3.14159265 * morph)) * uDelta;

    gl_FragColor = vec4(pos, 1.0);
}

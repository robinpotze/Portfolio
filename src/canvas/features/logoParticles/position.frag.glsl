// Logo particle simulation, run by GPUComputationRenderer (it declares texturePosition and defines resolution).
uniform sampler2D tOrigin;
uniform sampler2D tRandom;
uniform sampler2D tFluid;
uniform float uTime;
uniform float uDelta;
uniform float uMorph;
uniform float uMorphStagger;
uniform float uGridColumns;
uniform float uGridRows;
uniform vec2 uGridSize;
uniform float uGridZ;
uniform float uSpring;
uniform float uCurlScale;
uniform float uCurlSpeed;
uniform float uCurlStrength;
uniform float uFluidStrength;
uniform mat4 uModelViewProjection;
uniform mat3 uScreenToLocal;

#include ../../core/shaders/curl.glsl;

// Dot-matrix cell for this particle, row 0 at the top (must match the seed loop in LogoParticles.jsx).
vec3 gridPoint(vec2 uv) {
    vec2 texel = floor(uv * resolution.xy);
    float cell = mod(texel.y * resolution.x + texel.x, uGridColumns * uGridRows);
    vec2 spacing = uGridSize / vec2(uGridColumns, uGridRows);
    float column = mod(cell, uGridColumns);
    float row = floor(cell / uGridColumns);
    return vec3((column - (uGridColumns - 1.0) * 0.5) * spacing.x, ((uGridRows - 1.0) * 0.5 - row) * spacing.y, uGridZ);
}

void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec3 pos = texture2D(texturePosition, uv).xyz;
    vec3 origin = texture2D(tOrigin, uv).xyz;
    vec3 grid = gridPoint(uv);
    vec4 random = texture2D(tRandom, uv);

    // Each particle lags by a random amount, so the panel dissolves instead of moving as one sheet.
    float morph = clamp((uMorph - random.w * uMorphStagger) / (1.0 - uMorphStagger), 0.0, 1.0);

    // Spring from the dot-matrix cell toward the logo surface as morph rises.
    vec3 goal = mix(grid, origin, morph);
    pos += (goal - pos) * uSpring * uDelta;

    // Curl swirl: barely there at rest (keeps the panel crisp), strongest halfway through the transition.
    pos += curlNoise(pos * uCurlScale + uTime * uCurlSpeed) * uCurlStrength * (0.02 + sin(3.14159265 * morph)) * uDelta;

    // Push by the fluid velocity under the particle on screen, mapped back into the logo's local space.
    vec4 clip = uModelViewProjection * vec4(pos, 1.0);
    vec2 screenUv = clip.xy / clip.w * 0.5 + 0.5;
    vec2 flow = texture2D(tFluid, screenUv).xy;
    pos += uScreenToLocal * vec3(flow, 0.0) * uFluidStrength * uDelta;

    gl_FragColor = vec4(pos, 1.0);
}

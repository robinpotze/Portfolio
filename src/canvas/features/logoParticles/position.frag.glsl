// Logo particle simulation, run by GPUComputationRenderer (it declares texturePosition and defines resolution).
uniform sampler2D tOrigin;
uniform sampler2D tRandom;
uniform sampler2D tCell;
uniform sampler2D tFluid;
uniform float uTime;
uniform float uDelta;
uniform float uMorph;
uniform float uMorphStagger;
uniform vec2 uGridSize;
uniform float uGridZ;
uniform float uSpring;
uniform float uCurlScale;
uniform float uCurlSpeed;
uniform float uCurlStrength;
uniform float uFluidStrength;
uniform mat4 uModelViewProjection;
uniform mat3 uScreenToLocal;
uniform float uStream;
uniform mat4 uStreamToLocal;
uniform float uTrunkY;
uniform float uTrunkHalf;
uniform float uTrunkRadius;
uniform float uFlow;
uniform float uFlowStep;

#include ../../core/shaders/curl.glsl;

// Point on the flowing trunk in carousel space, mapped into the particles' local space.
// wrapped: the particle crossed the bottom this frame and restarts at the top.
vec3 streamTarget(vec4 random, out bool wrapped) {
    // Decorrelated from random.x (radius, point size) and random.y (Task 5's branch pick), or the trunk renders as cones.
    float seed = fract(sin(dot(random.xyz, vec3(12.9898, 78.233, 37.719))) * 43758.5453);
    float along = fract(seed + uFlow);
    wrapped = along < uFlowStep;
    float angle = random.z * 6.2831853;
    float radius = uTrunkRadius * sqrt(fract(random.x * 13.37));
    vec3 p = vec3(cos(angle) * radius, uTrunkY + uTrunkHalf * (1.0 - 2.0 * along), sin(angle) * radius);
    return (uStreamToLocal * vec4(p, 1.0)).xyz;
}

void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec3 pos = texture2D(texturePosition, uv).xyz;
    vec3 origin = texture2D(tOrigin, uv).xyz;
    // Dot-matrix cell: a fraction of the panel, scaled to its live size.
    vec3 grid = vec3(texture2D(tCell, uv).xy * uGridSize, uGridZ);
    vec4 random = texture2D(tRandom, uv);

    // Each particle lags by a random amount, so the panel dissolves instead of moving as one sheet.
    float morph = clamp((uMorph - random.w * uMorphStagger) / (1.0 - uMorphStagger), 0.0, 1.0);

    // Spring from the dot-matrix cell toward the logo surface as morph rises.
    // Second stage: logo → stream, with the same per-particle lag.
    float stream = clamp((uStream - random.w * uMorphStagger) / (1.0 - uMorphStagger), 0.0, 1.0);
    bool wrapped;
    vec3 streamGoal = streamTarget(random, wrapped);

    vec3 goal = mix(mix(grid, origin, morph), streamGoal, stream);
    pos += (goal - pos) * uSpring * uDelta;
    // Jump wrapped particles straight to the top instead of springing back up the whole trunk.
    if (stream >= 1.0 && wrapped) {
        pos = goal;
    }

    // Curl swirl: barely there at rest (keeps the panel crisp), strongest halfway through the transition.
    pos += curlNoise(pos * uCurlScale + uTime * uCurlSpeed) * uCurlStrength * (0.02 + sin(3.14159265 * morph) + sin(3.14159265 * stream)) * uDelta;

    // Push by the fluid velocity under the particle on screen, mapped back into the logo's local space.
    vec4 clip = uModelViewProjection * vec4(pos, 1.0);
    vec2 screenUv = clip.xy / clip.w * 0.5 + 0.5;
    vec2 flow = texture2D(tFluid, screenUv).xy;
    pos += uScreenToLocal * vec3(flow, 0.0) * uFluidStrength * uDelta;

    gl_FragColor = vec4(pos, 1.0);
}

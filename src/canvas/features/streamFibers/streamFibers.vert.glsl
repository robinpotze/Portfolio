uniform float uTrunkY;
uniform float uTrunkHalf;
uniform float uSpread;
uniform float uFlow;
uniform float uTrail;
uniform vec3 uCardCenter;
uniform vec3 uCardRight;
uniform vec3 uCardUp;
uniform float uBranchInset;
uniform float uBranchBow;
uniform float uBranchGrow;
uniform float uBranchShare;
uniform vec4 uSway;
uniform float uSpark;
uniform float uHead;
uniform float uSparkSpread;
uniform float uSparkFlow;
uniform float uPointSize;
uniform float uDpr;
uniform sampler2D tSimPosition;
uniform sampler2D tSimRandom;
uniform mat4 uLocalToStream;
uniform float uStream;
uniform float uMorphStagger;
attribute vec2 simUv;
attribute float trail;
varying float vAlpha;

#include ../../core/shaders/streamPath.glsl;

void main() {
    // The sim particle this strand grows out of: its random gives the same seed, angle, radius and branch pick.
    vec4 random = texture2D(tSimRandom, simUv);
    float seed = streamSeed(random);
    float angle = random.z * 6.2831853;
    float radius = uSpread * sqrt(fract(random.x * 13.37)) * mix(1.0, uSparkSpread, uSpark);
    // Head at the flow position, tail sampled slightly earlier on the same path.
    float head = fract(seed + uFlow * mix(1.0, uSparkFlow, uSpark));
    float along = head - trail * uTrail;
    vec3 p = trunkPoint(along, angle, radius, uTrunkY, uTrunkHalf, uSway);
    float alpha = (1.0 - trail) * (1.0 - trail) * mix(0.25, 1.0, random.w);
    if (uSpark < 0.5 && random.y < uBranchShare && uBranchGrow > 0.0) {
        // Face (0 top, 1 bottom, 2 left, 3 right) and place across it from random.y, which is uniform 0–1 on this
        // path and independent of the flow seed, so each face stays evenly filled.
        float pick = random.y / uBranchShare;
        float face = floor(pick * 4.0);
        float across = (fract(pick * 4.0) * 2.0 - 1.0) * uBranchInset;
        vec3 normal = face < 2.0 ? uCardUp * (1.0 - 2.0 * face) : uCardRight * (2.0 * face - 5.0);
        vec3 side = face < 2.0 ? uCardRight : uCardUp;
        vec3 target = uCardCenter + normal * uBranchInset + side * across;
        float out_ = fract(seed + uFlow * 2.0) - trail * uTrail * 2.0;
        p = pyramidBranchPoint(clamp(out_, 0.0, 1.0) * uBranchGrow, angle, radius, target, uCardCenter, uBranchBow, uSway);
        // Tail gate at the apex; soft fade at the card so heads don't pop when they wrap.
        alpha *= step(0.0, out_) * (1.0 - smoothstep(0.92, 1.0, out_));
    } else {
        // Hide the part of a tail that would wrap past the top of the trunk.
        alpha *= step(0.0, along);
    }
    // Morph (same per-particle stagger as the sim): the strand stretches from its particle onto the path.
    // At sp = 1 the path is exact, so the (then frozen) sim texture is not read.
    float sp = clamp((uStream - random.w * uMorphStagger) / (1.0 - uMorphStagger), 0.0, 1.0);
    if (sp < 1.0) {
        vec3 particle = (uLocalToStream * vec4(texture2D(tSimPosition, simUv).xyz, 1.0)).xyz;
        p = mix(particle, p, sp);
    }
    vAlpha = alpha;
    vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    // Sparks always; strand heads only while the strand is still collapsed onto its particle.
    float size = max(uSpark, uHead * (1.0 - sp));
    gl_PointSize = uPointSize * uDpr * size / -mvPosition.z;
    // Size 0 is undefined in GLSL ES (some drivers draw 1 px): move empty points out of clip space.
    if (uSpark + uHead > 0.5 && size <= 0.0) {
        gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
    }
}

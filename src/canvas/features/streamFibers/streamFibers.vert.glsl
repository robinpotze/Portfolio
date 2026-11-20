uniform float uTrunkY;
uniform float uTrunkHalf;
uniform float uSpread;
uniform float uFlow;
uniform float uTrail;
uniform float uBranchY;
uniform vec3 uBranchEnd;
uniform float uBranchGrow;
uniform float uBranchShare;
uniform vec4 uSway;
uniform float uSpark;
uniform float uPointSize;
uniform float uDpr;
attribute vec4 random;
attribute float trail;
varying float vAlpha;

#include ../../core/shaders/streamPath.glsl;

void main() {
    // Same seed as the particle sim, so fibres sit where the particles were.
    float seed = fract(sin(dot(random.xyz, vec3(12.9898, 78.233, 37.719))) * 43758.5453);
    float angle = random.z * 6.2831853;
    float radius = uSpread * sqrt(fract(random.x * 13.37)) * mix(1.0, 3.0, uSpark);
    // Head at the flow position, tail sampled slightly earlier on the same path.
    float head = fract(seed + uFlow * mix(1.0, 0.5, uSpark));
    float along = head - trail * uTrail;
    vec3 p = trunkPoint(along, angle, radius, uTrunkY, uTrunkHalf, uSway);
    float alpha = (1.0 - trail) * (1.0 - trail) * mix(0.25, 1.0, random.w);
    if (uSpark < 0.5 && random.y < uBranchShare && uBranchGrow > 0.0) {
        float out_ = fract(seed + uFlow * 2.0) - trail * uTrail * 2.0;
        p = branchPoint(clamp(out_, 0.0, 1.0) * uBranchGrow, angle, radius, uBranchY, uBranchEnd, uSway);
        alpha *= step(0.0, out_);
    }
    // Hide the part of a tail that would wrap past the top of the trunk.
    alpha *= step(0.0, along);
    vAlpha = alpha;
    vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    gl_PointSize = uPointSize * uDpr * uSpark / -mvPosition.z;
}

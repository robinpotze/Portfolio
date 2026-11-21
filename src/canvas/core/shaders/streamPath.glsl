// Stream path in carousel (rig) space, shared by the logo-particle sim and the fibres so the hand-off lines up.
// sway = (bundle amplitude, frequency, phase = time × speed, per-strand amplitude).

// Per-particle path seed; decorrelated from random.x (radius) and random.y (branch pick).
float streamSeed(vec4 random) {
    return fract(sin(dot(random.xyz, vec3(12.9898, 78.233, 37.719))) * 43758.5453);
}

vec2 swayBend(float y, vec4 sway) {
    return sway.x * vec2(sin(y * sway.y + sway.z), cos(y * sway.y * 0.7 + sway.z * 1.3));
}

vec2 swayStrand(float y, float angle, vec4 sway) {
    return sway.w * vec2(sin(y * sway.y * 3.1 + angle + sway.z * 1.7), cos(y * sway.y * 2.3 + angle * 1.3 + sway.z));
}

// along 0 = top of the trunk, 1 = bottom.
vec3 trunkPoint(float along, float angle, float radius, float trunkY, float trunkHalf, vec4 sway) {
    float y = trunkY + trunkHalf * (1.0 - 2.0 * along);
    vec2 offset = swayBend(y, sway) + swayStrand(y, angle, sway) + vec2(cos(angle), sin(angle)) * radius;
    return vec3(offset.x, y, offset.y);
}

// Branch strand from the trunk (above or below the card) onto one card corner, as a cubic Bézier.
// t 0 = on the trunk at startY, 1 = on the corner. The strand keeps the flow's sway and tapers onto the corner.
vec3 cornerBranchPoint(float t, float angle, float radius, float startY, vec3 corner, vec3 cardCenter, float outward, vec4 sway) {
    vec2 bend = swayBend(startY, sway);
    vec3 p0 = vec3(bend.x, startY, bend.y);
    // Leave along the flow first, then swing outward past the corner and land on it.
    vec3 p1 = vec3(p0.x, mix(startY, corner.y, 0.6), p0.z);
    vec3 p2 = corner + (corner - cardCenter) * outward;
    float u = 1.0 - t;
    vec3 p = u * u * u * p0 + 3.0 * u * u * t * p1 + 3.0 * u * t * t * p2 + t * t * t * corner;
    vec2 offset = swayStrand(p.y, angle, sway) * (1.0 - t) + vec2(cos(angle), sin(angle)) * radius * (1.0 - t);
    return p + vec3(offset.x, 0.0, offset.y);
}

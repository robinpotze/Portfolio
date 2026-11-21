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

// Branch strand on one face of a pyramid: apex on the trunk at the card's height, base on the card's edge.
// t 0 = apex, 1 = target on the card. Mid-way the strand is pulled toward the pyramid axis (apex → card centre),
// so the faces bow inward; the flow's sway and spread taper to 0 so it lands exactly on the edge.
vec3 pyramidBranchPoint(float t, float angle, float radius, vec3 target, vec3 cardCenter, float bow, vec4 sway) {
    vec2 bend = swayBend(cardCenter.y, sway);
    vec3 apex = vec3(bend.x, cardCenter.y, bend.y);
    vec3 straight = mix(apex, target, t);
    vec3 axis = mix(apex, cardCenter, t);
    vec3 p = straight + (axis - straight) * bow * sin(3.14159265 * t);
    vec2 offset = (swayStrand(p.y, angle, sway) + vec2(cos(angle), sin(angle)) * radius) * (1.0 - t);
    return p + vec3(offset.x, 0.0, offset.y);
}

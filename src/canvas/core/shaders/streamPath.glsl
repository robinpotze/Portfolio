// Stream path in carousel (rig) space, shared by the logo-particle sim and the fibres so the hand-off lines up.
// sway = (bundle amplitude, frequency, phase = time × speed, per-strand amplitude).

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

// t 0 = on the trunk at the card's height, 1 = at branchEnd. Bows upward mid-way so it reads as a curve.
vec3 branchPoint(float t, float angle, float radius, float branchY, vec3 branchEnd, vec4 sway) {
    vec2 bend = swayBend(branchY, sway);
    vec3 p = mix(vec3(bend.x, branchY, bend.y), branchEnd, t) + vec3(0.0, sin(3.14159265 * t) * 0.25, 0.0);
    vec2 offset = swayStrand(p.y, angle, sway) + vec2(cos(angle), sin(angle)) * radius * (1.0 - 0.5 * t);
    return p + vec3(offset.x, 0.0, offset.y);
}

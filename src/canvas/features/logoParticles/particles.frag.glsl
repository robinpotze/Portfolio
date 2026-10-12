varying vec4 vRandom;

void main() {
    vec2 c = gl_PointCoord - 0.5;
    if (dot(c, c) > 0.25) {
        discard;
    }
    gl_FragColor = vec4(vec3(0.933), 1.0);
}

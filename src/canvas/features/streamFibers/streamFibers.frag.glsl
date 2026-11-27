uniform vec3 uColor;
uniform float uFade;
varying float vAlpha;

void main() {
    gl_FragColor = vec4(uColor * vAlpha * uFade, 1.0);
}

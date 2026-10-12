uniform sampler2D tPosition;
uniform float uPointSize;
uniform float uDpr;
attribute vec4 random;
varying vec4 vRandom;

void main() {
    // position.xy is this particle's texel UV in the simulation texture.
    vec3 pos = texture2D(tPosition, position.xy).xyz;
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = uPointSize * uDpr * mix(0.5, 1.5, random.x) / -mvPosition.z;
    gl_Position = projectionMatrix * mvPosition;
    vRandom = random;
}

uniform sampler2D tPosition;
uniform float uPointSize;
uniform float uDpr;
uniform float uIntro;
uniform vec2 uGridSize;
attribute vec4 random;
varying vec4 vRandom;

void main() {
    // position.xy is this particle's texel UV in the simulation texture.
    vec3 pos = texture2D(tPosition, position.xy).xyz;
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);

    // Power-on: dots grow in a diagonal sweep from the panel's top-left to its bottom-right.
    vec2 panel = clamp(pos.xy / uGridSize + 0.5, 0.0, 1.0);
    float delay = 0.25 * (panel.x + 1.0 - panel.y);
    float power = clamp((uIntro - delay) / 0.5, 0.0, 1.0);

    gl_PointSize = uPointSize * uDpr * mix(0.5, 1.5, random.x) * power / -mvPosition.z;
    gl_Position = projectionMatrix * mvPosition;
    // Size 0 is undefined in GLSL ES (some drivers draw 1 px); move dots that aren't powered on yet out of clip space instead.
    if (power <= 0.0) {
        gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
    }
    vRandom = random;
}

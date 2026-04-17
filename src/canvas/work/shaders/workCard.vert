precision mediump float;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vViewPos;

void main() {
    vUv = uv;
    vNormal = normalMatrix * normal;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vViewPos = -mvPosition.xyz;
    gl_Position = projectionMatrix * mvPosition;
}

// Fullscreen pass (FullScreenQuad's triangle is already in clip space) with neighbour UVs for finite differences.
uniform vec2 texelSize;
#include neighbors.glsl;

void main() {
    vec2 dx = vec2(texelSize.x, 0.0);
    vec2 dy = vec2(0.0, texelSize.y);
    vUv = uv;
    vL = uv - dx;
    vR = uv + dx;
    vT = uv + dy;
    vB = uv - dy;
    gl_Position = vec4(position.xy, 0.0, 1.0);
}

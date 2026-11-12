precision highp float;
attribute vec3 position;

// Fullscreen triangle: positions are already in clip space.
void main() {
    gl_Position = vec4(position, 1.0);
}

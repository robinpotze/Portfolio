// Logo particle simulation, run by GPUComputationRenderer (it declares texturePosition and defines resolution).
uniform sampler2D tOrigin;
uniform sampler2D tRandom;
uniform float uTime;
uniform float uDelta;
uniform float uDisperse;
uniform float uSpring;
uniform float uCloudRadius;
uniform float uCurlScale;
uniform float uCurlSpeed;
uniform float uCurlStrength;

#include ../../core/shaders/curl.glsl;

void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec3 pos = texture2D(texturePosition, uv).xyz;
    vec3 origin = texture2D(tOrigin, uv).xyz;
    vec4 random = texture2D(tRandom, uv);

    // Spring toward the logo surface, or toward a random point in the cloud while dispersed.
    vec3 goal = mix(origin, origin + (random.xyz - 0.5) * uCloudRadius, uDisperse);
    pos += (goal - pos) * uSpring * uDelta;

    // Curl drift: a slight shimmer on the logo, a strong swirl in the cloud.
    pos += curlNoise(pos * uCurlScale + uTime * uCurlSpeed) * uCurlStrength * (0.15 + uDisperse) * uDelta;

    gl_FragColor = vec4(pos, 1.0);
}

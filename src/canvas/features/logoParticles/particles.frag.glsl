uniform sampler2D tVideo;
uniform sampler2D tMatcap;
uniform float uHasVideo;
uniform vec2 uResolution;
uniform float uTime;
varying vec4 vRandom;

vec3 softLight(vec3 base, vec3 blend) {
    vec3 dark = 2.0 * base * blend + base * base * (1.0 - 2.0 * blend);
    vec3 light = sqrt(base) * (2.0 * blend - 1.0) + 2.0 * base * (1.0 - blend);
    return mix(dark, light, step(0.5, blend));
}

void main() {
    vec2 c = gl_PointCoord - 0.5;
    if (dot(c, c) > 0.25) {
        discard;
    }

    // The shared video texture has flipY = false, so texture row 0 is the top of the video.
    vec2 screenUv = gl_FragCoord.xy / uResolution;
    vec3 color = mix(vec3(0.933), texture2D(tVideo, vec2(screenUv.x, 1.0 - screenUv.y)).rgb, uHasVideo);

    // Glossy highlight: the matcap, rotated per particle over time.
    float angle = uTime + vRandom.z * 6.2831853;
    vec2 matcapUv = mat2(cos(angle), -sin(angle), sin(angle), cos(angle)) * c + 0.5;
    color = softLight(color, texture2D(tMatcap, matcapUv).rgb);

    // A few particles sparkle above the bloom threshold.
    color *= 1.0 + pow(vRandom.y, 20.0) * 2.0;

    gl_FragColor = vec4(color, 1.0);
}

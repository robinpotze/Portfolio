precision mediump float;

uniform sampler2D uTexture;
uniform sampler2D uNoiseTex;
uniform vec2 uTextureSize;
uniform vec2 uPlaneSize;
uniform float uTime;
uniform float uRoughness;
uniform float uNoiseScale;
uniform float uRefractPower;
uniform float uChromaticAberration;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vViewPos;

#define PI 3.14159265359
#define SAMPLES 3

float random(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

float ggx(float dNH, float roughness) {
    float a2 = roughness * roughness;
    a2 = a2 * a2;
    float dNH2 = dNH * dNH;
    if (dNH2 <= 0.0) return 0.0;
    return a2 / (PI * pow(dNH2 * (a2 - 1.0) + 1.0, 2.0));
}

float fresnel(float d) {
    float f0 = 0.1;
    return f0 + (1.0 - f0) * pow(1.0 - d, 5.0);
}

// ── Cover-fit UV mapping ──
vec2 coverUv(vec2 uv, vec2 texSize, vec2 planeSize) {
    float texAspect = texSize.x / texSize.y;
    float planeAspect = planeSize.x / planeSize.y;

    vec2 scale;
    if (planeAspect > texAspect) {
        scale = vec2(1.0, texAspect / planeAspect);
    } else {
        scale = vec2(planeAspect / texAspect, 1.0);
    }

    return (uv - 0.5) * scale + 0.5;
}

void main() {
    // Base UV in texture space (cover-fit)
    vec2 baseUv = coverUv(vUv, uTextureSize, uPlaneSize);

    // Noise-driven roughness variation across surface
    vec4 noise = texture2D(uNoiseTex, vUv * uNoiseScale);
    vec4 noise2 = texture2D(uNoiseTex, vUv + (noise.xy - 0.5) * 2.0);
    float roughness = smoothstep(0.3, 0.8, noise2.y) * uRoughness;

    // Chromatic aberration refraction — using noise offsets instead of view-space normals
    vec3 refractCol = vec3(0.0);
    for (int i = 0; i < SAMPLES; i++) {
        float fi = float(i);
        float slide = 0.003 + random(baseUv + fi * 0.2) * 0.005;
        vec2 roughnessOffset = vec2(
            random(baseUv + fi * 0.1) - 0.5,
            random(baseUv + fi * 0.2) - 0.5
        ) * roughness * 0.3;

        vec2 uvR = clamp(baseUv + roughnessOffset - vec2(uRefractPower + slide * 1.0, 0.0), 0.0, 1.0);
        vec2 uvG = clamp(baseUv + roughnessOffset, 0.0, 1.0);
        vec2 uvB = clamp(baseUv + roughnessOffset + vec2(uRefractPower + slide * 1.0, 0.0) * uChromaticAberration, 0.0, 1.0);

        refractCol += vec3(
            texture2D(uTexture, uvR).r,
            texture2D(uTexture, uvG).g,
            texture2D(uTexture, uvB).b
        );
    }
    refractCol /= float(SAMPLES);
    vec3 color = refractCol;

    // Specular highlights
    vec3 viewDir = normalize(vViewPos);
    vec3 lightDir = normalize(vec3(-1.0, 0.8, -1.0));
    vec3 halfVec = normalize(viewDir + lightDir);
    vec3 normal = normalize(vNormal);
    normal *= (gl_FrontFacing ? 1.0 : -1.0);
    float dNH = dot(normal, halfVec);
    float spec = ggx(dNH, 0.003 + roughness * 0.4);
    spec = clamp(spec, 0.0, 1.0);
    color += spec;

    // Fresnel rim
    float F = fresnel(max(0.0, dot(viewDir, normal)));
    color += color * F * 0.3;

    // Gentle brightness and cool tint
    color *= 1.1;
    color *= vec3(1.0, 1.02, 1.05);

    // Vignette — darkens center where text sits for legibility
    vec2 vigUv = vUv - 0.5;
    float vignette = dot(vigUv, vigUv) * 2.0;
    color *= mix(0.55, 1.0, vignette);

    gl_FragColor = vec4(color, 1.0);
}

precision highp float;

// Laser beam (a horizontal and a vertical arc of glow taps), travelling wisps and volumetric fog.
// Lengths are in frame units where the screen is 204.8 wide (see `sc` in main).

// Beam shape and motion
#define PI 3.14159265359
#define TWO_PI 6.28318530718
#define EPS 1e-6
#define DT_LOCAL 0.0038
#define EDGE_SOFT (DT_LOCAL * 4.0)
#define TAP_RADIUS 6
#define R_H 150.0
#define R_V 150.0
#define FLARE_HEIGHT 16.0
#define FLARE_AMOUNT 8.0
#define FLARE_EXP 2.0
#define TOP_FADE_START 0.1
#define TOP_FADE_EXP 1.0
#define FLOW_PERIOD 0.5
#define FLOW_SHARPNESS 1.5

// Wisps: animated micro-streaks travelling down the beam toward its base
#define W_BASE_X 1.5
#define W_LAYER_GAP 0.25
#define W_LANES 10
#define W_SIDE_DECAY 0.5
#define W_HALF 0.01
#define W_AA 0.15
#define W_CELL 20.0
#define W_SEG_MIN 0.01
#define W_SEG_MAX 0.55
#define W_CURVE_AMOUNT 15.0
#define W_CURVE_RANGE (FLARE_HEIGHT - 3.0)
#define W_BOTTOM_EXP 10.0

// Fog
#define FOG_CONTRAST 1.2
#define FOG_BOTTOM_BIAS 0.8
#define FOG_TILT_MAX_X 0.35
#define FOG_TILT_SHAPE 1.5
#define FOG_BEAM_MIN 0.0
#define FOG_BEAM_MAX 0.75
#define FOG_MASK_GAMMA 0.5
#define FOG_EXPAND_SHAPE 12.2
#define FOG_EDGE_MIX 0.5

// Horizontal vignette for the fog volume
#define HFOG_EDGE_START 0.20
#define HFOG_EDGE_END 0.98
#define HFOG_EDGE_GAMMA 1.4
#define HFOG_Y_RADIUS 25.0
#define HFOG_Y_SOFT 60.0

// Beam extents and edge masking
#define EDGE_X0 0.22
#define EDGE_X1 0.995
#define EDGE_X_GAMMA 1.25
#define EDGE_LUMA_T0 0.0
#define EDGE_LUMA_T1 2.0
#define DITHER_STRENGTH 1.0

// Driven by LaserPlane and LaserFlowMaterial (see there for which change per frame)
uniform vec3 iResolution;
uniform vec4 iMouse;
uniform float uWispDensity;
uniform float uTiltScale;
uniform float uFlowTime;
uniform float uFogTime;
uniform float uBeamXFrac;
uniform float uBeamYFrac;
uniform float uFlowSpeed;
uniform float uVLenFactor;
uniform float uHLenFactor;
uniform float uFogIntensity;
uniform float uFogScale;
uniform float uWSpeed;
uniform float uWIntensity;
uniform float uFlowStrength;
uniform float uDecay;
uniform float uFalloffStart;
uniform float uFogFallSpeed;
uniform vec3 uColor;
uniform float uFade;
uniform float uFogQuality;

// Linear → sRGB transfer curve. The threshold is 10× below the spec value (0.0031308); kept on purpose to preserve the look.
float linearToSrgb(float x) {
    return x <= 0.00031308 ? 12.92 * x : 1.055 * pow(x, 1.0 / 2.4) - 0.055;
}

// Inverse-square glow of point q seen from p, capped at `power`.
float glow(vec2 p, vec2 q, float power) {
    float d = distance(p, q);
    float f = power * uFalloffStart;
    float r = (f * f) / (d * d + EPS);
    return power * min(1.0, r);
}

// Same glow with an elliptical falloff stretched by s.
float glowElliptic(vec2 p, vec2 q, float power, vec2 s) {
    vec2 d = p - q;
    float dd = (d.x * d.x) / (s.x * s.x) + (d.y * d.y) / (s.y * s.y);
    float f = power * uFalloffStart;
    float r = (f * f) / (dd + EPS);
    return power * min(1.0, r);
}

float triangleWave(float x) {
    float f = fract(x);
    return 1.0 - abs(f * 2.0 - 1.0);
}

// 1 inside [tmin, tmax], fading out over EDGE_SOFT at both ends.
float arcWindow(float t, float tmin, float tmax) {
    float a = smoothstep(tmin, tmin + EDGE_SOFT, t);
    float b = 1.0 - smoothstep(tmax - EDGE_SOFT, tmax, t);
    return max(0.0, a * b);
}

float hash21(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 34.123);
    return fract(p.x * p.y);
}

float valueNoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    float a = hash21(i);
    float b = hash21(i + vec2(1, 0));
    float c = hash21(i + vec2(0, 1));
    float d = hash21(i + vec2(1, 1));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

// Fractal noise: 3 octaves on high fog quality, 2 otherwise.
float fbm(vec2 p) {
    int octaves = uFogQuality > 0.5 ? 3 : 2;
    float v = 0.0;
    float amp = 0.6;
    mat2 m = mat2(0.86, 0.5, -0.5, 0.86);
    for (int i = 0; i < 3; ++i) {
        if (i >= octaves) break;
        v += amp * valueNoise(p);
        p = m * p * 2.03 + 17.1;
        amp *= 0.52;
    }
    return v;
}

// 1 for x in [0, l], with W_AA soft edges.
float segmentGate(float x, float l) {
    float a = smoothstep(0.0, W_AA, x);
    float b = 1.0 - smoothstep(l, l + W_AA, x);
    return max(0.0, a * b);
}

// How much the beam widens near its base: 1 at y = 0, 0 at FLARE_HEIGHT.
float flareProfile(float y) {
    return pow(1.0 - clamp(y, 0.0, FLARE_HEIGHT) / FLARE_HEIGHT, FLARE_EXP);
}

// Streaks in lanes on both sides of the vertical beam, scrolling down toward its base.
float wisps(vec2 uv, float topFade) {
    float y = uv.y;
    float yf = (y + uFlowTime * uWSpeed) / W_CELL;
    float dRaw = clamp(uWispDensity, 0.0, 2.0);
    float d = dRaw <= 0.0 ? 1.0 : dRaw;
    float lanesF = floor(float(W_LANES) * min(d, 1.0) + 0.5);
    int lanes = int(max(1.0, lanesF));
    // Density up to 1 shows a share of segments; above 1 adds extra ones.
    float sp = min(d, 1.0);
    float ep = max(d - 1.0, 0.0);
    // Lanes follow the flare outward near the base.
    float fm = flareProfile(max(y, 0.0));
    float rm = clamp(1.0 - y / W_CURVE_RANGE, 0.0, 1.0);
    float cm = fm * rm;
    const float G = 0.05;
    float xS = 1.0 + (FLARE_AMOUNT * W_CURVE_AMOUNT * G) * cm;
    float sPix = clamp(y / R_V, 0.0, 1.0);
    float bGain = pow(1.0 - sPix, W_BOTTOM_EXP);
    float sum = 0.0;
    for (int s = 0; s < 2; ++s) {
        float sgn = s == 0 ? -1.0 : 1.0;
        for (int i = 0; i < W_LANES; ++i) {
            if (i >= lanes) break;
            float off = W_BASE_X + float(i) * W_LAYER_GAP;
            float xc = sgn * (off * xS);
            float dx = abs(uv.x - xc);
            float lat = 1.0 - smoothstep(W_HALF, W_HALF + W_AA, dx);
            float amp = exp(-off * W_SIDE_DECAY);
            float seed = hash21(vec2(off, sgn * 17.0));
            float yf2 = yf + seed * 7.0;
            float ci = floor(yf2);
            float fy = fract(yf2);
            float seg = mix(W_SEG_MIN, W_SEG_MAX, hash21(vec2(ci, off * 2.3)));
            float spR = hash21(vec2(ci, off + sgn * 31.0));
            float seg1 = segmentGate(fy, seg) * step(spR, sp);
            if (ep > 0.0) {
                float spR2 = hash21(vec2(ci * 3.1 + 7.0, off * 5.3 + sgn * 13.0));
                float f2 = fract(fy + 0.5);
                seg1 += segmentGate(f2, seg * 0.9) * step(spR2, ep);
            }
            sum += amp * lat * seg1;
        }
    }
    float span = smoothstep(-3.0, 0.0, y) * (1.0 - smoothstep(R_V - 6.0, R_V, y));
    return uWIntensity * sum * topFade * bGain * span;
}

void main() {
    vec2 frag = gl_FragCoord.xy;
    vec2 C = iResolution.xy * 0.5;
    float invW = 1.0 / max(C.x, 1.0);
    float sc = 512.0 / iResolution.x * 0.4;
    vec2 uv = (frag - C) * sc;
    vec2 off = vec2(uBeamXFrac * iResolution.x * sc, uBeamYFrac * iResolution.y * sc);
    vec2 uvc = uv - off;
    float edgeX = abs((frag.x - C.x) * invW);
    float basePhase = 1.5 * PI + uDecay * 0.5;
    float tauMin = basePhase - uDecay;
    float tauMax = basePhase;

    // Horizontal beam: glow taps along the arc near this pixel.
    float a = 0.0;
    float cx = clamp(uvc.x / (R_H * uHLenFactor), -1.0, 1.0);
    float tH = clamp(TWO_PI - acos(cx), tauMin, tauMax);
    for (int k = -TAP_RADIUS; k <= TAP_RADIUS; ++k) {
        float tu = tH + float(k) * DT_LOCAL;
        float wt = arcWindow(tu, tauMin, tauMax);
        if (wt <= 0.0) continue;
        float spd = max(abs(sin(tu)), 0.02);
        float u = clamp((basePhase - tu) / max(uDecay, EPS), 0.0, 1.0);
        float env = pow(1.0 - abs(u * 2.0 - 1.0), 0.8);
        vec2 p = vec2((R_H * uHLenFactor) * cos(tu), 0.0);
        a += wt * glow(uvc, p, env * spd);
    }

    // Vertical beam: flow pulses travel down it and a flare widens it toward the base.
    float b = 0.0;
    float yPix = uvc.y;
    float cy = clamp(-yPix / (R_V * uVLenFactor), -1.0, 1.0);
    float tV = clamp(TWO_PI - acos(cy), tauMin, tauMax);
    for (int k = -TAP_RADIUS; k <= TAP_RADIUS; ++k) {
        float tu = tV + float(k) * DT_LOCAL;
        float wt = arcWindow(tu, tauMin, tauMax);
        if (wt <= 0.0) continue;
        float yb = (-R_V) * cos(tu);
        float s = clamp(yb / R_V, 0.0, 1.0);
        float spd = max(abs(sin(tu)), 0.02);
        float env = pow(1.0 - s, 0.6) * spd;
        float cap = 1.0 - smoothstep(TOP_FADE_START, 1.0, s);
        cap = pow(cap, TOP_FADE_EXP);
        env *= cap;
        float ph = s / FLOW_PERIOD + uFlowTime * uFlowSpeed;
        float fl = pow(triangleWave(ph), FLOW_SHARPNESS);
        env *= mix(1.0 - uFlowStrength, 1.0, fl);
        float yp = (-R_V * uVLenFactor) * cos(tu);
        float m = pow(smoothstep(FLARE_HEIGHT, 0.0, yp), FLARE_EXP);
        float wx = 1.0 + FLARE_AMOUNT * m;
        vec2 sig = vec2(wx, 1.0);
        vec2 p = vec2(0.0, yp);
        float mask = step(0.0, yp);
        b += wt * glowElliptic(uvc, p, mask * env, sig);
    }

    float sPix = clamp(yPix / R_V, 0.0, 1.0);
    float topA = pow(1.0 - smoothstep(TOP_FADE_START, 1.0, sPix), TOP_FADE_EXP);
    float L = a + b * topA;
    float w = wisps(vec2(uvc.x, yPix), topA);

    // Volumetric fog: falls along a direction tilted toward the mouse, masked around the beam.
    float fog = 0.0;
    if (uFogQuality > 0.01) {
        vec2 fuv = uvc * uFogScale;
        float mAct = step(1.0, length(iMouse.xy));
        float nx = ((iMouse.x - C.x) * invW) * mAct;
        float ax = abs(nx);
        float stMag = mix(ax, pow(ax, FOG_TILT_SHAPE), 0.35);
        float st = sign(nx) * stMag * uTiltScale;
        st = clamp(st, -FOG_TILT_MAX_X, FOG_TILT_MAX_X);
        vec2 dir = normalize(vec2(st, 1.0));
        fuv += uFogTime * uFogFallSpeed * dir;
        vec2 prp = vec2(-dir.y, dir.x);
        fuv += prp * (0.08 * sin(dot(uvc, prp) * 0.08 + uFogTime * 0.9));
        float n = fbm(fuv + vec2(fbm(fuv + vec2(7.3, 2.1)), fbm(fuv + vec2(-3.7, 5.9))) * 0.6);
        n = pow(clamp(n, 0.0, 1.0), FOG_CONTRAST);
        float pixW = 1.0 / max(iResolution.y, 1.0);
        #ifdef GL_OES_standard_derivatives
        float wL = max(fwidth(L), pixW);
        #else
        float wL = pixW;
        #endif
        float m0 = pow(smoothstep(FOG_BEAM_MIN - wL, FOG_BEAM_MAX + wL, L), FOG_MASK_GAMMA);
        float bm = 1.0 - pow(1.0 - m0, FOG_EXPAND_SHAPE);
        bm = mix(bm * m0, bm, FOG_EDGE_MIX);
        float yP = 1.0 - smoothstep(HFOG_Y_RADIUS, HFOG_Y_RADIUS + HFOG_Y_SOFT, abs(yPix));
        float hE = 1.0 - smoothstep(HFOG_EDGE_START, HFOG_EDGE_END, edgeX);
        hE = pow(clamp(hE, 0.0, 1.0), HFOG_EDGE_GAMMA);
        float hW = mix(1.0, hE, clamp(yP, 0.0, 1.0));
        float bBias = mix(1.0, 1.0 - sPix, FOG_BOTTOM_BIAS);
        float radialFade = 1.0 - smoothstep(0.0, 0.7, length(uvc) / 120.0);
        fog = n * (uFogIntensity * 1.8) * bBias * bm * hW * radialFade;
    }

    // Tone-map in sRGB, dither, and fade toward the screen edges where the beam is faint.
    float LF = L + fog;
    float dith = (hash21(frag) - 0.5) * (DITHER_STRENGTH / 255.0);
    float tone = linearToSrgb(LF + w);
    vec3 col = tone * uColor + dith;
    float alpha = clamp(linearToSrgb(L + w * 0.6) + dith * 0.6, 0.0, 1.0);
    float xF = pow(clamp(1.0 - smoothstep(EDGE_X0, EDGE_X1, edgeX), 0.0, 1.0), EDGE_X_GAMMA);
    float scene = LF + max(0.0, w) * 0.5;
    float hi = smoothstep(EDGE_LUMA_T0, EDGE_LUMA_T1, scene);
    float eM = mix(xF, 1.0, hi);
    col = col * eM * uFade;
    alpha = alpha * eM * uFade;
    gl_FragColor = vec4(col, alpha);
}

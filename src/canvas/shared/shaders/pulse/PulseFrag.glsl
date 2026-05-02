uniform float uTime;
uniform float uProgress;
uniform float uOpacity;
uniform vec2 uBoundsMin;
uniform vec2 uBoundsMax;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vViewPos;
varying vec2 vLocalPos;

const vec3 BRAND_COLOR=vec3(42.0,208.0,213.0)/255.0;
const vec3 BASE_COLOR=vec3(17.0,17.0,17.0)/255.0;

float hash21(vec2 p){
    p=fract(p*vec2(123.34,456.21));
    p+=dot(p,p+45.32);
    return fract(p.x*p.y);
}

vec2 getRippleUv(){
    vec2 boundsSize=max(uBoundsMax-uBoundsMin,vec2(.00001));
    return clamp((vLocalPos-uBoundsMin)/boundsSize,0.,1.);
}

float loadingRipple(vec2 uv,float progress,float time){
    // Match loading-screen cadence: one full radial cycle every 900ms.
    float cycleProgress=fract(time/0.9);
    float timeStep=floor(time*24.);
    vec2 boundsSize=max(uBoundsMax-uBoundsMin,vec2(.00001));
    float maxDim=max(boundsSize.x,boundsSize.y);
    vec2 boundsCenter=(uBoundsMin+uBoundsMax)*.5;

    // Approximate occasional row shifts by jittering the working UV per scanline.
    float lineCount=96.;
    float rowId=floor(uv.y*lineCount);
    float lineGate=step(.92,hash21(vec2(rowId,timeStep)));
    float lineShift=(hash21(vec2(timeStep+11.,rowId))-0.5)*(24./512.);
    vec2 shiftedUv=clamp(uv+vec2(lineShift*lineGate,0.),0.,1.);

    float grid=74.;
    vec2 blockUv=floor(shiftedUv*grid)/grid;
    vec2 blockCenterUv=blockUv+vec2(.5/grid);
    vec2 blockCenterLocal=uBoundsMin+blockCenterUv*boundsSize;
    vec2 centeredLocal=blockCenterLocal-boundsCenter;
    float dist=length(centeredLocal)/(maxDim*.5);

    float waveFront=cycleProgress*1.6;
    float waveWidth=.45;
    float distFromWave=dist-waveFront;
    float waveIntensity=max(0.,1.-abs(distFromWave)/waveWidth);

    float blockId=hash21(blockCenterUv*173.);
    float waveGate=smoothstep(.12,.7,waveIntensity);

    // Scatter only around the active wavefront so the effect reads as structure, not noise.
    float scatterGate=step(.88,hash21(blockCenterUv*91.+vec2(timeStep,timeStep*1.7)));
    float scatter=blockId*0.7*scatterGate*waveGate;

    // Rare brightness bursts approximate CPU block displacement glitches.
    float glitchSeed=hash21(blockCenterUv*57.+vec2(timeStep*0.7,timeStep*1.3));
    float glitchBoost=step(.985,glitchSeed)*0.42*waveGate;

    float ripple=min(1.,waveIntensity+scatter+glitchBoost);

    // Use bootstrap progress as intensity envelope, not as cycle driver.
    float bootstrapEnvelope=smoothstep(.02,.25,progress);
    ripple*=bootstrapEnvelope;

    return ripple;
}

void main(){
    vec2 rippleUv=getRippleUv();
    float pulse=loadingRipple(rippleUv,uProgress,uTime);
    vec3 color=mix(BASE_COLOR,BRAND_COLOR,pulse);
    float alpha=clamp(pulse*uOpacity,0.,1.);

    if(alpha<0.008){
        discard;
    }

    gl_FragColor=vec4(color,alpha);
}
uniform sampler2D uTrnsTex;
uniform sampler2D uNoiseTex;
uniform samplerCube uEnvMap;
uniform float uTime;
uniform float uRoughness;
uniform float uNoiseScale;
uniform float uRefractPower;
uniform float uChromaticAberration;
uniform vec2 uResolution;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vViewPos;
varying vec3 vWorldNormal;

#define PI 3.14159265359
#define SAMPLES 3  // Reduced from 8 to 3 for better performance

float random(vec2 p){
    return fract(sin(dot(p.xy,vec2(12.9898,78.233)))*43758.5453);
}

// GGX specular distribution
float ggx(float dNH,float roughness){
    float a2=roughness*roughness;
    a2=a2*a2;
    float dNH2=dNH*dNH;
    if(dNH2<=0.)return 0.;
    return a2/(PI*pow(dNH2*(a2-1.)+1.,2.));
}

// Fresnel effect
float fresnel(float d){
    float f0=.1;
    return f0+(1.-f0)*pow(1.-d,5.);
}

void main(){
    vec3 color=vec3(0.);
    
    // Screen UV for refraction
    vec2 screenUv=gl_FragCoord.xy/uResolution;
    
    // Sample noise for roughness variation
    vec4 noise=texture2D(uNoiseTex,vUv*uNoiseScale);
    vec4 noise2=texture2D(uNoiseTex,vUv*1.+(noise.xy-.5)*2.);
    float roughness=smoothstep(.3,.8,noise2.y)*uRoughness;
    
    vec3 normal=normalize(vNormal);
    normal*=(gl_FrontFacing?1.:-1.);
    vec2 refractNormal=normal.xy*(1.-normal.z*.7);
    
    // Chromatic aberration refraction
    vec3 refractCol=vec3(0.);
    for(int i=0;i<SAMPLES;i++){
        float fi=float(i);
        float slide=.005+random(screenUv+fi*.2)*.007;
        vec2 roughnessOffset=vec2(
            random(screenUv+fi*.1)-.5,
            random(screenUv+fi*.2)-.5
        )*roughness*.3;
        
        // Different offsets for R, G, B channels
        vec2 refractUvR=roughnessOffset+screenUv-refractNormal*(uRefractPower+slide*1.);
        vec2 refractUvG=roughnessOffset+screenUv-refractNormal*(uRefractPower+slide*2.);
        vec2 refractUvB=roughnessOffset+screenUv-refractNormal*(uRefractPower+slide*4.);
        
        vec3 bg=vec3(
            texture2D(uTrnsTex,refractUvR).r,
            texture2D(uTrnsTex,refractUvG).g,
            texture2D(uTrnsTex,refractUvB).b
        );
        
        refractCol+=bg*.9;
    }
    refractCol/=float(SAMPLES);
    color+=refractCol;
    
    // Specular highlights
    vec3 viewDir=normalize(vViewPos);
    vec3 lightDir=normalize(vec3(-1.,.8,-1.));
    vec3 halfVec=normalize(viewDir+lightDir);
    float dNH=dot(normal,halfVec);
    float spec=ggx(dNH,.003+roughness*.4);
    spec=clamp(spec,0.,1.);
    color+=spec;
    
    // Fresnel rim light with environment reflections
    float F=fresnel(max(0.,dot(viewDir,normal)));
    vec3 reflectDir=reflect(viewDir,normal);
    vec3 envReflection=textureCube(uEnvMap,reflectDir).rgb;
    color+=mix(color,envReflection,F*.9)*(1.-F);
    
    // Brightness and color tint
    color*=1.2;
    color*=vec3(1.,1.05,1.1);
    
    gl_FragColor=vec4(color,1.);
}
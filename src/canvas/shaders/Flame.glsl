precision mediump float;

uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;

varying vec2 vUv;

// Random function
float random(vec2 st){
    return fract(sin(dot(st.xy,vec2(12.9898,78.233)))*43758.5453123);
}

// Noise function for glitch
float noiseGlitch(vec2 st){
    vec2 i=floor(st);
    vec2 f=fract(st);
    float a=random(i);
    float b=random(i+vec2(1.,0.));
    float c=random(i+vec2(0.,1.));
    float d=random(i+vec2(1.,1.));
    vec2 u=f*f*(3.-2.*f);
    return mix(a,b,u.x)+(c-a)*u.y*(1.-u.x)+(d-b)*u.x*u.y;
}

vec2 getAspectUV(vec2 uv,vec2 resolution){
    vec2 aspectUv=uv;
    aspectUv.x=(aspectUv.x-.5)*(resolution.x/resolution.y)+.5;
    return aspectUv;
}

/* original noise kept intact */
float noise(vec3 p)
{
    vec3 i=floor(p);
    vec4 a=dot(i,vec3(2.,57.,21.))+vec4(0.,57.,21.,78.);
    vec3 f=cos((p-i)*acos(-1.))*(-.5)+.5;
    a=mix(sin(cos(a)*a),sin(cos(1.+a)*(1.+a)),f.x);
    a.xy=mix(a.xz,a.yw,f.y);
    return mix(a.x,a.y,f.z);
}

float sphere(vec3 position,vec4 spread){
    return length(spread.xyz-position)-spread.w;
}

float flame(vec3 position){
    float d=sphere(position*vec3(.5,.5,1.),vec4(0.,-1.,0.,1.));
    return d+(noise(position+vec3(0.,u_time*2.,0.))+noise(position*3.)*.5)*.25*(position.y);
}

float scene_from_flame(vec3 p,float f){// helper using precomputed flame
    return min(100.-length(p),abs(f));
}

vec4 raymarch(vec3 org,vec3 dir){
    const float HIT_EPS=.02;// matches original eps
    const float FAR=100.;
    const int MAX_IT=32;
    
    float t=0.;
    float glow=.0;
    bool glowing=false;
    
    for(int i=0;i<MAX_IT;i++){
        vec3 p=org+dir*t;
        
        // one flame() eval reused for both scene and glow test
        float f=flame(p);
        float d=scene_from_flame(p,f)+HIT_EPS;
        
        // preserve original glow behavior: once inside flame, ramp by i/64
        if(d>HIT_EPS){
            if(f<0.)glowing=true;
            if(glowing)glow=float(i)/64.;
        }
        
        if(d<HIT_EPS||t>FAR)break;// early exit
        t+=d;// step along the ray
    }
    
    return vec4(org+dir*t,glow);
}

void main(){
    vec2 uv=vUv;
    
    // Create random glitch patches - faster time multiplier
    float timeVar=u_time*8.;
    
    // Use noise-based patches instead of grid for organic look
    float patchNoise=noiseGlitch(uv*5.+floor(timeVar));
    
    // Only glitch certain areas (5% of screen)
    float isGlitchPatch=step(.95,patchNoise);
    
    // Within glitch patches, create horizontal displacement strips - thinner strips
    float stripY=floor(uv.y*200.);
    float stripRandom=random(vec2(stripY,floor(timeVar*2.)));
    float isGlitchStrip=step(.7,stripRandom)*isGlitchPatch;
    
    // Small horizontal offset for glitched strips
    float displacement=(stripRandom-.5)*.05*isGlitchStrip;
    uv.x+=displacement;
    
    // Occasional RGB split on glitched strips
    float rgbSplit=isGlitchStrip*.003;
    
    // Apply aspect ratio
    vec2 baseUv=getAspectUV(uv,u_resolution)*2.-1.;
    
    vec3 org=vec3(0.,-2.,4.);
    vec3 dir=normalize(vec3(baseUv.x*1.6,-baseUv.y,-1.5));
    
    vec4 p=raymarch(org,dir);
    float glow=p.w;
    
    vec4 col=mix(vec4(1.,1.,1.,1.),vec4(.0314,.8863,1.,1.),p.y*.02+.4);
    
    // Sample with slight chromatic aberration on glitched strips
    vec4 finalColor;
    if(rgbSplit>.001){
        vec2 uvR=uv+vec2(rgbSplit,0.);
        vec2 uvB=uv-vec2(rgbSplit,0.);
        
        vec2 baseUvR=getAspectUV(uvR,u_resolution)*2.-1.;
        vec2 baseUvB=getAspectUV(uvB,u_resolution)*2.-1.;
        
        vec3 dirR=normalize(vec3(baseUvR.x*1.6,-baseUvR.y,-1.5));
        vec3 dirB=normalize(vec3(baseUvB.x*1.6,-baseUvB.y,-1.5));
        
        float glowR=raymarch(org,dirR).w;
        float glowB=raymarch(org,dirB).w;
        
        vec4 colR=mix(vec4(1.,1.,1.,1.),vec4(.0314,.8863,1.,1.),p.y*.02+.4);
        vec4 colB=mix(vec4(1.,1.,1.,1.),vec4(.0314,.8863,1.,1.),p.y*.02+.4);
        
        finalColor.r=mix(vec4(0.,0.,0.,0.),colR,pow(glowR*2.,4.)).r;
        finalColor.g=mix(vec4(0.,0.,0.,0.),col,pow(glow*2.,4.)).g;
        finalColor.b=mix(vec4(0.,0.,0.,0.),colB,pow(glowB*2.,4.)).b;
        finalColor.a=1.;
    }else{
        finalColor=mix(vec4(0.,0.,0.,0.),col,pow(glow*2.,4.));
    }
    
    // Very subtle scanlines
    float scanline=sin(vUv.y*600.)*.01;
    finalColor.rgb+=scanline;
    
    gl_FragColor=finalColor;
}

uniform sampler2D tFrom;
uniform sampler2D tTo;
uniform float uProgress;
uniform float uIntensity;
uniform vec2 uResolution;
uniform int uTransitionType;

varying vec2 vUv;

// Smooth step with custom curve
float smootherstep(float edge0,float edge1,float x){
    x=clamp((x-edge0)/(edge1-edge0),0.,1.);
    return x*x*x*(x*(x*6.-15.)+10.);
}

// Simple crossfade
vec4 crossfade(vec2 uv,float progress){
    vec4 fromColor=texture2D(tFrom,uv);
    vec4 toColor=texture2D(tTo,uv);
    return mix(fromColor,toColor,progress);
}

// Wipe transition with soft edge (ActiveTheory style)
vec4 wipeTransition(vec2 uv,float progress){
    float edge=smootherstep(0.,.4,progress);
    float softEdge=.15;
    float mixValue=smoothstep(edge-softEdge,edge+softEdge,uv.x);
    
    vec4 fromColor=texture2D(tFrom,uv);
    vec4 toColor=texture2D(tTo,uv);
    
    return mix(fromColor,toColor,mixValue);
}

// Displacement transition
vec4 displacementTransition(vec2 uv,float progress){
    float intensity=uIntensity*(1.-abs(progress-.5)*2.);
    
    vec2 displacement=vec2(
        sin(uv.y*8.+progress*6.28318)*intensity,
        cos(uv.x*8.+progress*6.28318)*intensity
    );
    
    vec4 fromColor=texture2D(tFrom,uv+displacement*(1.-progress));
    vec4 toColor=texture2D(tTo,uv-displacement*progress);
    
    return mix(fromColor,toColor,progress);
}

// Radial wipe from center
vec4 radialTransition(vec2 uv,float progress){
    vec2 center=vec2(.5,.5);
    float dist=length(uv-center)*1.5;
    float mixValue=smoothstep(progress-.3,progress+.1,dist);
    
    vec4 fromColor=texture2D(tFrom,uv);
    vec4 toColor=texture2D(tTo,uv);
    
    return mix(toColor,fromColor,mixValue);
}

// Pixelate transition
vec4 pixelateTransition(vec2 uv,float progress){
    // Create pixelation effect at midpoint
    float pixelation=sin(progress*3.14159)*80.+1.;
    vec2 pixelatedUV=floor(uv*pixelation)/pixelation;
    
    vec4 fromColor=texture2D(tFrom,pixelatedUV);
    vec4 toColor=texture2D(tTo,pixelatedUV);
    
    return mix(fromColor,toColor,progress);
}

// Slide transition
vec4 slideTransition(vec2 uv,float progress){
    float slideAmount=progress;
    
    vec2 fromUV=uv+vec2(slideAmount,0.);
    vec2 toUV=uv-vec2(1.-slideAmount,0.);
    
    vec4 fromColor=texture2D(tFrom,fromUV);
    vec4 toColor=texture2D(tTo,toUV);
    
    // Blend based on UV bounds
    float alpha=step(0.,uv.x-slideAmount);
    return mix(fromColor,toColor,alpha);
}

void main(){
    vec2 uv=vUv;
    vec4 color;
    
    // Choose transition based on uniform
    if(uTransitionType==0){
        color=crossfade(uv,uProgress);
    }else if(uTransitionType==1){
        color=wipeTransition(uv,uProgress);
    }else if(uTransitionType==2){
        color=displacementTransition(uv,uProgress);
    }else if(uTransitionType==3){
        color=radialTransition(uv,uProgress);
    }else if(uTransitionType==4){
        color=pixelateTransition(uv,uProgress);
    }else if(uTransitionType==5){
        color=slideTransition(uv,uProgress);
    }else{
        // Default to crossfade
        color=crossfade(uv,uProgress);
    }
    
    gl_FragColor=color;
}

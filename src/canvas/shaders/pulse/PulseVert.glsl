varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vViewPos;
varying vec2 vLocalPos;

void main(){
    vUv=uv;
    vLocalPos=position.xy;
    vNormal=normalMatrix*normal;
    vec4 mvPosition=modelViewMatrix*vec4(position,1.);
    vViewPos=-mvPosition.xyz;
    gl_Position=projectionMatrix*mvPosition;
}
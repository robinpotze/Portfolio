varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vViewPos;
varying vec3 vWorldNormal;

void main(){
    vUv=uv;
    vNormal=normalMatrix*normal;
    vWorldNormal=normalize((modelMatrix*vec4(normal,0.)).xyz);
    vec4 mvPosition=modelViewMatrix*vec4(position,1.);
    vViewPos=-mvPosition.xyz;
    gl_Position=projectionMatrix*mvPosition;
}
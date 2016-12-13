uniform vec2 repeat;

uniform sampler2D displacementMap;
uniform float displacementScale;
uniform float displacementBias;

varying vec2 vUv;
varying vec3 vViewPosition;
varying vec3 vNormal;

void main() {
    vec3 transformed = position + (normal * (texture2D(displacementMap, uv).x * displacementScale + displacementBias));
    vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.0);

    vNormal = normalize(normalMatrix * normal);
    vViewPosition = -mvPosition.xyz;
    vUv = repeat * uv;

    gl_Position = projectionMatrix * mvPosition;
}

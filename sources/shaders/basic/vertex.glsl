varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;
varying vec3 vView;

void main() {
    vUv = uv;
    vPosition = position;
    vNormal = normalMatrix * normal;
    vView = -(modelViewMatrix * vec4(position, 1.0)).xyz;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}

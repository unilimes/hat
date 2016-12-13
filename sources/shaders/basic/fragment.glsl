uniform vec3 point;
uniform sampler2D tTexture;

varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;
varying vec3 vView;

void main() {
    vec2 uv = vUv;
    vec3 position = normalize(vPosition) * 1.0;
    vec3 normal = normalize(vNormal);
    vec3 vector = normalize((viewMatrix * vec4(cameraPosition, 0.0)).xyz);
    vec3 view = vView;

    vec4 color = texture2D(tTexture, uv);

    float diffuse = max(dot(normal, vector), 0.0); // + 0.5;

    gl_FragColor = vec4(color.rgb * diffuse, color.a);
}

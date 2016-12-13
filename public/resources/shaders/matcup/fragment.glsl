uniform float time;
uniform float bump;
uniform float noise;

uniform sampler2D tNormal;
uniform sampler2D tMatCap;

uniform vec3 color;

uniform float useScreen;
uniform float useRim;
uniform float rimPower;
uniform float normalScale;
uniform float normalRepeat;

varying vec2 vUv;
varying vec3 vViewPosition;
varying vec3 vNormal;

float random(vec3 scale, float seed) {
    return fract(sin(dot(gl_FragCoord.xyz + seed, scale)) * 43758.5453 + seed);
}

void main() {
    vec3 normal = vNormal;

    vec3 q0 = dFdx(vViewPosition.xyz);
    vec3 q1 = dFdy(vViewPosition.xyz);
    vec2 st0 = dFdx(vUv.st);
    vec2 st1 = dFdy(vUv.st);

    vec3 S = normalize(q0 * st1.t - q1 * st0.t);
    vec3 T = normalize(-q0 * st1.s + q1 * st0.s);
    vec3 N = normalize(normal);

    vec3 mapN = texture2D(tNormal, vUv * normalRepeat).xyz * 2.0 - 1.0;
    mapN.xy = vec2(normalScale, -normalScale) * mapN.xy;

    mat3 tsn = mat3(S, T, N);

    vec3 finalNormal = normalize(tsn * mapN);

    vec3 r = reflect(normalize(-vViewPosition.xyz), normalize(normal));
    float m = 2.0 * sqrt(r.x * r.x + r.y * r.y + (r.z + 1.0) * (r.z + 1.0));

    vec2 calculatedNormal = vec2(r.x / m + 0.5, r.y / m + 0.5);

    vec3 base = texture2D(tMatCap, calculatedNormal).rgb;

    if (useRim > 0.0) {
        float f = rimPower * abs(dot(normal, normalize(vViewPosition)));
        f = useRim * (1.0 - smoothstep(0.0, 1.0, f));
        base += vec3(f);
    }

    if (useScreen == 1.0) {
        base = vec3(1.0) - (vec3(1.0) - base) * (vec3(1.0) - base);
    }

    base += noise * (0.5 - random(vec3(1.0), length(gl_FragCoord)));

    gl_FragColor = vec4(base * color, 1.0);
}

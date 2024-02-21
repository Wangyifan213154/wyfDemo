const vibrationGLSL = `
uniform sampler2D colorTexture; //输入的场景渲染照片
varying vec2 v_textureCoordinates;
#define EDGE .2
float rand(float co) { return fract(sin(co*(91.3458)) * 47453.5453); }
float rand(vec2 co){ return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453); }
float rand(vec3 co){ return rand(co.xy+rand(co.z)); }
float pi = atan(1.)*4.;
void main(void) {

float iTime = czm_frameNumber / 60.0;
vec2 resolution = czm_viewport.zw;

float randFloor = 20.;
float vertPhase = .2;
float frequency = .008;
float amplitude = 2.;
float vertMin = 0.0;
float vertMax = 1.;

float vertGatePhase = .8;
float Gatefrequency = 1.8;
float gateMin = .1;
float gateMax = .4;


vec2 uv = gl_FragCoord.xy/resolution.xy;
float time = iTime;
//if ((rand(time+uv.y) > 0.9) && (sin(time/frequency)>.5)) {
//    uv += vec2(0.010,0) * ;
//}

float pass1 = clamp(asin(sin((time+uv.y*vertGatePhase)*2.*pi/Gatefrequency)),gateMin,gateMax);

float scroll = amplitude * clamp(sin(time/frequency+(uv.y*vertPhase)),vertMin,vertMax);

//float gate = round((((sin(time/frequency+(uv.y*vertPhase)))) +.5));
float randX =  floor(rand(time*0.2)*randFloor)/randFloor * .3;
uv += vec2(scroll*pass1*.01,0); //uv += vec2(scroll*pass1*.101,0);
//pass1*.02

//uv += vec2(randX * .001,0);
//scroll*



vec4 c = texture2D(colorTexture, uv);

gl_FragColor = mix(texture2D(colorTexture, v_textureCoordinates), c, 0.3);
}`

export default vibrationGLSL

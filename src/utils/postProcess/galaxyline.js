export const galaxyLineGLSL = `
#define iTime czm_frameNumber / 100.0
#define iResolution czm_viewport.zw
#define PI 3.141592653589793
#define fragCoord gl_FragCoord
uniform sampler2D colorTexture; //输入的场景渲染照片
uniform vec4 iMouse;
varying vec2 v_textureCoordinates;

#define S(a, b, t) smoothstep(a, b, t)
#define NUM_LAYERS 4.

float N21(vec2 p) {
	vec3 a = fract(vec3(p.xyx) * vec3(213.897, 653.453, 253.098));
    a += dot(a, a.yzx + 79.76);
    return fract((a.x + a.y) * a.z);
}

vec2 GetPos(vec2 id, vec2 offs, float t) {
    float n = N21(id+offs);
    float n1 = fract(n*10.);
    float n2 = fract(n*100.);
    float a = t+n;
    return offs + vec2(sin(a*n1), cos(a*n2))*.4;
}

float GetT(vec2 ro, vec2 rd, vec2 p) {
	return dot(p-ro, rd);
}

float LineDist(vec3 a, vec3 b, vec3 p) {
	return length(cross(b-a, p-a))/length(p-a);
}

float df_line( in vec2 a, in vec2 b, in vec2 p)
{
    vec2 pa = p - a, ba = b - a;
	float h = clamp(dot(pa,ba) / dot(ba,ba), 0., 1.);
	return length(pa - ba * h);
}

float line(vec2 a, vec2 b, vec2 uv) {
    float r1 = .04;
    float r2 = .01;

    float d = df_line(a, b, uv);
    float d2 = length(a-b);
    float fade = S(1.5, .5, d2);

    fade += S(.05, .02, abs(d2-.75));
    return S(r1, r2, d)*fade;
}

float NetLayer(vec2 st, float n, float t) {
    vec2 id = floor(st)+n;

    st = fract(st)-.5;
   const int alenth = 9;
    vec2 p[alenth];
    int i=0;
    for(float y=-1.; y<=1.; y++) {
    	for(float x=-1.; x<=1.; x++) {
              if(y==-1.){
                 if(x==-1.){
                   p[0] = GetPos(id, vec2(x,y), t);
                 }
                 if(x==0.){
                   p[1] = GetPos(id, vec2(x,y), t);
                 }
                 if(x==1.){
                   p[2] = GetPos(id, vec2(x,y), t);
                 }
              }
              if(y==0.){
                 if(x==-1.){
                   p[3] = GetPos(id, vec2(x,y), t);
                 }
                 if(x==0.){
                   p[4] = GetPos(id, vec2(x,y), t);
                 }
                 if(x==1.){
                   p[5] = GetPos(id, vec2(x,y), t);
                 }
              }
              if(y==1.){
                 if(x==-1.){
                   p[6] = GetPos(id, vec2(x,y), t);
                 }
                 if(x==0.){
                   p[7] = GetPos(id, vec2(x,y), t);
                 }
                 if(x==1.){
                   p[8] = GetPos(id, vec2(x,y), t);
                 }
              }
            // p[i++] = GetPos(id, vec2(x,y), t);
    	}
    }

    float m = 0.;
    float sparkle = 0.;

    for(int i=0; i<9; i++) {
        m += line(p[4], p[i], st);

        float d = length(st-p[i]);

        float s = (.005/(d*d));
        s *= S(1., .7, d);
        float pulse = sin((fract(p[i].x)+fract(p[i].y)+t)*5.)*.4+.6;
        pulse = pow(pulse, 20.);

        s *= pulse;
        sparkle += s;
    }

    m += line(p[1], p[3], st);
	  m += line(p[1], p[5], st);
    m += line(p[7], p[5], st);
    m += line(p[7], p[3], st);

    float sPhase = (sin(t+n)+sin(t*.1))*.25+.5;
    sPhase += pow(sin(t*.1)*.5+.5, 50.)*5.;
    m += sparkle*sPhase;//(*.5+.5);

    return m;
}
void main(void) {
  vec2 uv = (gl_FragCoord.xy * 2. - iResolution.xy) / min(iResolution.x, iResolution.y);
  // vec2 uv = v_textureCoordinates;

  // float iTime = time2+50.0;//czm_frameNumber/20.0;
  // iTime = 1.0;
  // 使用外接time 把值限制在范围内，保证闪烁效果既不特别闪，也不会出现间断消失。
  // vec2 iResolution = vec2(800.0);
  vec2 M = vec2(1.0)/iResolution.xy-.5;
  float t = iTime*.1;

  float s = sin(t);
  float c = cos(t);
  mat2 rot = mat2(c, -s, s, c);
  vec2 st = uv*rot;
  M *= rot*2.;

  float m = 0.;
  for(float i=0.; i<1.; i+=1./NUM_LAYERS) {
  float z = fract(t+i);
  float size = mix(15., 1., z);
  float fade = S(0., .6, z)*S(1., .8, z);

  m += fade * NetLayer(st*size-M*z, i, iTime);
  }

  float fft  = 0.0;
  float glow = -uv.y*fft*2.;

  vec3 baseCol = vec3(s, cos(t*.4), -sin(t*.24))*.4+.6;
  vec3 col = baseCol*m;
  col += baseCol*glow;

  #ifdef SIMPLE
  uv *= 10.;
  col = vec3(1)*NetLayer(uv, 0., iTime);
  uv = fract(uv);
  //if(uv.x>.98 || uv.y>.98) col += 1.;
  #else
  col *= 1.-dot(uv,uv);
  t = mod(iTime, 230.);
  col *= S(0., 20., t)*S(224., 200., t);
  #endif

  vec4 fragColor = vec4(col,1);

  gl_FragColor = mix(texture2D(colorTexture, v_textureCoordinates), fragColor, 0.2); //将雨和三维场景融合
}`

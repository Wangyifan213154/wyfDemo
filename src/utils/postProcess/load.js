export const loadGLSL =
  // `
  // uniform sampler2D colorTexture; //输入的场景渲染照片
  // varying vec2 v_textureCoordinates;
  // #define nWai    50.
  // #define nNei    20.
  // #define nGtoD   57.3
  // #define midWid  -30.
  // #define nGrad   45.

  // float getDistance(vec2 p)
  // {
  //     return pow((p.x * p.x + p.y * p.y), 0.5);
  // }

  // float getGradient(vec2 p)
  // {
  //     return atan(abs(p.y / p.x)) * nGtoD;
  // }
  // void main(void) {
  // float iTime = czm_frameNumber / 20.0;
  // vec2 resolution = czm_viewport.zw;
  // // vec2 FC = gl_FragCoord.xy;
  // // vec2 uv = (gl_FragCoord.xy * 2. - resolution.xy) / min(resolution.x, resolution.y);
  // // vec2 uv = gl_FragCoord.xy / resolution.xy * 2. -1.;
  // vec2 uv = gl_FragCoord.xy;
  // uv = vec2( uv.x - 0.5 * resolution.x, uv.y - 0.5 * resolution.y);

  // float nDis = getDistance(uv);
  // float nGra = getGradient(uv);

  // bool isMid = false; float midValue = 0.0;
  // int ml = 1;
  // if(mod(nGra, nGrad) < midWid || mod(nGra, nGrad) > (nGrad - midWid))
  // {
  //     isMid=true;
  // }
  // else
  // {
  //     midValue = mod(nGra, nGrad);
  //     ml = int(nGra / nGrad) + 1;
  //     if(uv.x < 0. && uv.y > 0.) ml = ml;
  //     if(uv.x > 0. && uv.y > 0.) ml = 2 + (3 - ml);
  //     if(uv.x > 0. && uv.y < 0.) ml = 4 + ml;
  //     if(uv.x < 0. && uv.y < 0.) ml = 6 + (3 - ml);
  // }

  // float nCurrLight = mod(iTime*3.5, 8.) + 1.;
  // int nCL = int(nCurrLight);

  // if(nDis < nWai && nDis > nNei && !isMid)
  // {
  //     vec4 p1 = vec4(smoothstep( 0.78, 0.8, 1.0 - pow(abs(midValue-nGrad*0.5)/(nGrad-midWid), 1.2) ));

  //     float nMiddle = (nWai - nNei) * 0.5 + nNei;
  //     float sh = 1.0 - abs( nDis - nMiddle ) / (nWai - nNei);

  //     vec4 pp =p1 *  vec4( smoothstep(0.78, 0.8, pow(sh, 0.5) ));

  //     vec4 fragColor = pp * vec4(0.3, 0.3, 0.3, 1.);

  //     if(ml == nCL)
  //         fragColor = pp * vec4(0.6, 0.6, 0.6, 1.);
  //         gl_FragColor.rgb = mix(texture2D(colorTexture, v_textureCoordinates), fragColor, 0.5).rgb;
  //         gl_FragColor.a = texture2D(colorTexture, v_textureCoordinates).a;
  // }
  // else
  //     {
  //         vec4 fragColor = vec4(0., 0., 0., 1.);
  //         gl_FragColor.rgb = mix(texture2D(colorTexture, v_textureCoordinates), fragColor, 0.5).rgb;
  //         gl_FragColor.a = texture2D(colorTexture, v_textureCoordinates).a;
  //     }
  // }
  // `;

  `
uniform sampler2D colorTexture; //输入的场景渲染照片
varying vec2 v_textureCoordinates;
#define PI 3.14159265
void main(void) {
float iTime = czm_frameNumber / 20.0;
vec2 resolution = czm_viewport.zw;
// vec2 FC = gl_FragCoord.xy;
// vec2 uv = (gl_FragCoord.xy * 2. - resolution.xy) / min(resolution.x, resolution.y);
// vec2 uv = gl_FragCoord.xy / resolution.xy * 2. -1.;
// vec2 uv = gl_FragCoord.xy;
// uv = vec2( uv.x - 0.5 * resolution.x, uv.y - 0.5 * resolution.y);

float time = iTime;
float mx = max(resolution.x, resolution.y);
vec2 scrs = resolution.xy/mx;
vec2 uv = vec2(gl_FragCoord.x, resolution.y-gl_FragCoord.y)/mx;
// vec2 m = vec2(iMouse.x/mx,scrs.y-iMouse.y/mx);


vec3 col = vec3(0.0);
float x,y = 0.0;
float radius = 0.01;
const float dotsnb = 10.0;

for(float i = 0.0 ; i < dotsnb ; i++){
    x = 0.03*cos(2.0*PI*i/dotsnb+time*(i+3.0)/3.0);
    y = 0.03*sin(2.0*PI*i/dotsnb+time*(i+3.0)/3.0);

    col += vec3(smoothstep(radius, radius-0.01, distance(uv, scrs/2.0 + vec2(x,y)) ) * (sin(i/dotsnb+time+2.0*PI/3.0)+1.0)/2.0,
                smoothstep(radius, radius-0.01, distance(uv, scrs/2.0 + vec2(x,y)) ) * (sin(i/dotsnb+time+4.0*PI/3.0)+1.0)/2.0,
                smoothstep(radius, radius-0.01, distance(uv, scrs/2.0 + vec2(x,y)) ) * (sin(i/dotsnb+time+6.0*PI/3.0)+1.0)/2.0);      
}

vec4 fragColor = vec4(col,1.0);
gl_FragColor = mix(texture2D(colorTexture, v_textureCoordinates), fragColor, 0.5); //将雨和三维场景融合
}
`

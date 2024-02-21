export const scanLightGLSL = `
uniform sampler2D colorTexture; //输入的场景渲染照片
varying vec2 v_textureCoordinates;
void main(void) {
float iTime = czm_frameNumber / 120.0;
vec2 resolution = czm_viewport.zw;
vec2 FC = gl_FragCoord.xy;
vec2 uv = gl_FragCoord.xy / resolution.xy;//((gl_FragCoord.xy * 2. - resolution.xy) / min(resolution.x, resolution.y)+1.0)*0.5;
// vec2 uv = fragCoord.xy / iResolution.xy;

// float y = mod(-iTime / 4., 1.9) - 0.4;
// float str = -pow((uv.y - y) * 110., 2.) + .8;
// uv.x -= clamp(str * .01, 0., 1.);
// vec4 fragColor = texture2D(colorTexture, v_textureCoordinates);

// float colorAdd = pow(1. - pow(abs(uv.y - y), .3), 3.);
// fragColor.g += colorAdd * .5;
// fragColor.b += colorAdd * 1.;
// Normalized pixel coordinates (from 0 to 1)
// vec2 uv = st;//fragCoord/iResolution.xy;

// float vfun = pow(abs(1.0-(uv.x+uv.y)+sin(iTime*2.0)*0.8),0.1); //斜方向
// float vfun = pow(abs(1.0-(uv.x*0.8)-sin(iTime)*0.8),0.05);// x方向

  float vfun = pow(abs(uv.x-(iTime-floor(iTime))),0.05);// x方向
  // float vfun = pow(abs(1.0-(uv.y)+sin(iTime*2.0)*0.8),0.1);// x方向
  // uv += vec2(iTime*0.1,0.);

  vec3 col = mix( vec3(4.0,.0,.0), vec3(0.,0.,0.),
  vfun );
  col = mix( vec3(0.5,0.0,0.0), col, vfun );

  // Output to screen
  float crust = smoothstep( vfun*0.8,vfun, texture2D(colorTexture,v_textureCoordinates).g );
//   col = vec3( crust+col );
  col = vec3(col);
  vec4 fragColor = vec4(col,1.0);
//   float a = smoothstep(0.0, 1.0, pow(fragColor.r,3.0));
//   fragColor.a = a;
  fragColor.xyz -= texture2D(colorTexture,v_textureCoordinates).r/2.;

gl_FragColor = fragColor;//mix(texture2D(colorTexture, v_textureCoordinates), fragColor, 0.2); //将雨和三维场景融合
}`

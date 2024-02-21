export const findtargetGLSL = `
uniform sampler2D colorTexture; //输入的场景渲染照片
varying vec2 v_textureCoordinates;
const float gridTileWidth = .25;
void main(void) {
float iTime = czm_frameNumber / 80.0;
vec2 resolution = czm_viewport.zw;
// vec2 FC = gl_FragCoord.xy;
// vec2 uv = ((gl_FragCoord.xy * 2. - resolution.xy) / min(resolution.x, resolution.y)+1.0)*0.5;

vec2 uv = gl_FragCoord.xy / resolution.xy * 2. - 1.;
uv.x *= resolution.x / resolution.y;

float thickness = 2. / resolution.y;
float speed = 1. / 5.;
float repeat = 3.;
float thicknessModifier = 7.;

vec2 node = floor(uv / vec2(gridTileWidth)+0.5) * gridTileWidth;
float t = mod(iTime, repeat) * speed;

// more distortion over distance, less distortion over time
float nodeOffset = 1. - t - (1. - distance(node, vec2(0.)) / thicknessModifier);
float uvOffset = 1. - t - (1. - distance(uv, vec2(0.)) / thicknessModifier);

vec2 dist = abs(uv - node) - vec2(nodeOffset);

float num = min(abs(dist.x), abs(dist.y));

vec4 fragColor = mix(texture2D(colorTexture, v_textureCoordinates),
                texture2D(colorTexture, v_textureCoordinates),
              max(0., uvOffset / (gridTileWidth / 2.)));
fragColor *= (mod(iTime, repeat) + .5) / repeat;
fragColor.r += mix(0., step(num, thickness), max(0., sign(dist.y + dist.x)));
float a = 0.2-clamp((czm_frameNumber / 120.0),0.0,0.2);
gl_FragColor = fragColor;//mix(texture2D(colorTexture, v_textureCoordinates), fragColor, 0.2); //将雨和三维场景融合
}
`

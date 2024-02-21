//This file is automatically rebuilt by the Cesium build process.
export default `
czm_material czm_getMaterial(czm_materialInput materialInput)
{
  czm_material material = czm_getDefaultMaterial(materialInput);
  vec2 st = materialInput.st;
  vec4 colorImage = texture2D(image, vec2(fract(st.s*repeat.x + (czm_frameNumber/240.0)*flowSpeed), st.t));
  if(direction){
       colorImage = texture2D(image, vec2(st.s,fract(st.t*repeat.x - (czm_frameNumber/240.0)*flowSpeed)));
  }
  material.alpha = colorImage.a;
  material.diffuse = mix(colorImage.rgb,mixColor.rgb,mixRatio);
  return material;
}
`

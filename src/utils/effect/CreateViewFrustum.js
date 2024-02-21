export default class CreateFrustum {
  // 更新视锥体的姿态export default class CreateFrustum {
  constructor(options) {
    const {
      viewer,
      Cesium,
      position,
      orientation,
      fov,
      near,
      far,
      outlineColor,
      aspectRatio
    } = options
    this.Viewer = viewer
    this.Cesium = Cesium
    this.outlineColor = outlineColor
    this.position = position
    this.orientation = orientation
    this.orientation2 = orientation
    this.fov = fov || 30
    this.near = near || 10
    this.far = far || 100
    this.heading = 0
    this.pitch = 0
    this.roll = 0
    this.aspectRatio = aspectRatio
    this.frustum = null
    this.geometry = null
    this.lightCamera = null
    this.cafrustumOutline = null
    this.createLightCamera()
    this.add()
  }

  // 创建视锥体和轮廓线
  add() {
    this.clear()
    this.addFrustum()
    this.addOutline()
    // this.createLightCamera()
    // this.drawFrustumOutline()
  }

  // 清除视锥体和轮廓线
  clear() {
    this.clearFrustum()
    this.clearOutline()
    // this.clearcafrustumOutline()
    this.createFrustum = ''
    // this.lightCamera = null
  }
  clearFrustum() {
    if (this.frustumPrimitive) {
      this.Viewer.scene.primitives.remove(this.frustumPrimitive)
      this.frustumPrimitive = null
    }
  }
  clearOutline() {
    if (this.outlinePrimitive) {
      this.Viewer.scene.primitives.remove(this.outlinePrimitive)
      this.outlinePrimitive = null
    }
  }
  clearcafrustumOutline() {
    if (this.cafrustumOutline) {
      this.Viewer.scene.primitives.remove(this.cafrustumOutline)
      this.cafrustumOutline = null
    }
  }
  createLightCamera() {
    let lightCamera1 = new this.Cesium.Camera(this.Viewer.scene)
    // console.log(lightCamera1)
    lightCamera1.position = this.position
    lightCamera1.frustum.near = 250
    lightCamera1.frustum.far = this.far

    lightCamera1.frustum.aspectRatio = this.aspectRatio
    lightCamera1.frustum.fov = this.Cesium.Math.toRadians(this.fov)
    lightCamera1.setView({
      destination: this.position,
      orientation: {
        heading: this.heading,
        pitch: this.pitch,
        roll: this.roll
      }
    })
    this.lightCamera = lightCamera1
  }
  drawFrustumOutline() {
    const scratchRight = new this.Cesium.Cartesian3()
    const scratchRotation = new this.Cesium.Matrix3()
    const scratchOrientation = new this.Cesium.Quaternion()
    const position = this.lightCamera.positionWC
    const direction = this.lightCamera.directionWC
    const up = this.lightCamera.upWC
    let right = this.lightCamera.rightWC
    right = this.Cesium.Cartesian3.negate(right, scratchRight)
    let rotation = scratchRotation
    this.Cesium.Matrix3.setColumn(rotation, 0, right, rotation)
    this.Cesium.Matrix3.setColumn(rotation, 1, up, rotation)
    this.Cesium.Matrix3.setColumn(rotation, 2, direction, rotation)
    let orientation = this.Cesium.Quaternion.fromRotationMatrix(
      rotation,
      scratchOrientation
    )

    let instance = new this.Cesium.GeometryInstance({
      geometry: new this.Cesium.FrustumOutlineGeometry({
        frustum: this.lightCamera.frustum,
        origin: position,
        orientation: orientation,
        vertexFormat: this.Cesium.VertexFormat.POSITION_ONLY
      }),
      attributes: {
        color: this.Cesium.ColorGeometryInstanceAttribute.fromColor(
          this.Cesium.Color.YELLOWGREEN //new this.Cesium.Color(0.0, 1.0, 0.0, 1.0)
        )
      }
    })

    this.cafrustumOutline = this.Viewer.scene.primitives.add(
      new this.Cesium.Primitive({
        geometryInstances: [instance],
        appearance: new this.Cesium.PerInstanceColorAppearance({
          closed: true,
          flat: true
        }),
        asynchronous: false
      })
    )
  }
  // 创建视锥体
  addFrustum() {
    let frustum = new this.Cesium.PerspectiveFrustum({
      // 查看的视场角，绕Z轴旋转，以弧度方式输入
      // fov: Cesium.Math.PI_OVER_THREE,
      fov: this.Cesium.Math.toRadians(this.fov),
      // 视锥体的宽度/高度
      aspectRatio: this.aspectRatio,
      // 近面距视点的距离
      near: this.near,
      // 远面距视点的距离
      far: this.far
    })
    this.frustum = frustum
    let geometry = new this.Cesium.FrustumGeometry({
      frustum: frustum,
      origin: this.position,
      orientation: this.orientation,
      vertexFormat: this.Cesium.VertexFormat.POSITION_ONLY
    })
    this.geometry = geometry
    let instance = new this.Cesium.GeometryInstance({
      geometry: geometry,
      attributes: {
        color: this.Cesium.ColorGeometryInstanceAttribute.fromColor(
          // new this.Cesium.Color(1, 1, 1, 0.1)
          new this.Cesium.Color(
            this.outlineColor[0] / 255,
            this.outlineColor[1] / 255,
            this.outlineColor[2] / 255,
            0.1
          )
        )
      }
    })
    let primitive = new this.Cesium.Primitive({
      geometryInstances: instance,
      appearance: new this.Cesium.PerInstanceColorAppearance({
        closed: true,
        flat: true
      }),
      // appearance: new Cesium.EllipsoidSurfaceAppearance({
      //   material: new Cesium.Material({
      //     fabric: {
      //       type: this.frustumName,
      //       type2: this.frustumName,
      //       uniforms: {
      //         update: true,
      //         color: new Cesium.Color(0.1804, 0.9725, 0.0745, 0.5), // 颜色
      //         radians: 0, // 旋转
      //         width: 0.01, // 线条宽度
      //         repeat: new Cesium.Cartesian2(4.0, 4.0),
      //         image: 'static/image/typhoon4.png',
      //         time2: 0,
      //         mixColor: new Cesium.Color(0.0, 0.5, 0.501, 1.0), //new Cesium.Color(0.0, 1.0, 0.0, 1.0),
      //         mixRatio: 0.0,
      //         flowSpeed: 2.0,
      //         duration: 3000.0,
      //         lineColor: lineColor,
      //         scanColor: scanColor,
      //         scanColor2: scanColor2
      //         //   iTime: 0,
      //       },
      //       source: `
      //                 #define S(a,b,t) smoothstep(a,b,t)

      //                 float Rand(float i)
      //                 {
      //                     return fract(sin(i * 23325.) * 35543.);
      //                 }

      //                 float Random21(vec2 p)
      //                 {
      //                     p = fract(p*vec2(242.46,234.960));
      //                     p += dot(p,p + 23.64);
      //                     return fract(p.x*p.y);
      //                 }

      //                 vec2 Random22(vec2 p)
      //                 {
      //                     float n = Random21(p);
      //                     return vec2(n, Random21(p + n));
      //                 }

      //                 float DistLine(vec2 p, vec2 a, vec2 b){
      //                     vec2 pa = p - a;
      //                     vec2 ba = b - a;
      //                     float t = clamp(dot(pa,ba) / dot(ba,ba), 0.,1.);
      //                     return length(pa- ba*t);
      //                 }

      //                 float Line(vec2 p, vec2 a, vec2 b)
      //                 {
      //                     float d = DistLine(p,a,b);
      //                     float m = S(.03,.01,d);
      //                     m *= S(0.9,0.2,length(a-b));
      //                     return m;
      //                 }

      //                 vec2 GetPosition(vec2 id, vec2 offset){
      //                     float iTime = czm_frameNumber/60.0;
      //                     vec2 seed = id + offset;
      //                     vec2 n = Random22(seed) * (iTime*0.5 + 10.);
      //                    return offset + sin(n) * .4;
      //                 }

      //                 float DrawField(vec2 uv, float scale)
      //                 {
      //                     uv *= scale;
      //                     vec2 gv = fract(uv)- .5;
      //                     vec2 id = floor(uv);

      //                     float m = 0.;

      //                     vec2 p[9];
      //                     int i = 0;
      //                     for(float y = -1.; y <= 1.; y++)
      //                     {
      //                         for(float x = -1.; x <= 1.; x++)
      //                         {
      //                           // switch (i) {
      //                           //   case 0:
      //                           //       p[0] = GetPosition(id, vec2(x,y));
      //                           //       break;
      //                           //   case 1:
      //                           //       p[1] = GetPosition(id, vec2(x,y));
      //                           //       break;
      //                           //   }
      //                             if(i ==0)
      //                             {
      //                               p[0] = GetPosition(id, vec2(x,y));
      //                             }
      //                             if(i ==1)
      //                             {
      //                               p[1] = GetPosition(id, vec2(x,y));
      //                             }
      //                             if(i ==2)
      //                             {
      //                               p[2] = GetPosition(id, vec2(x,y));
      //                             }
      //                             if(i ==3)
      //                             {
      //                               p[3] = GetPosition(id, vec2(x,y));
      //                             }
      //                             if(i ==4)
      //                             {
      //                               p[4] = GetPosition(id, vec2(x,y));
      //                             }
      //                             if(i ==5)
      //                             {
      //                               p[5] = GetPosition(id, vec2(x,y));
      //                             }
      //                             if(i ==6)
      //                             {
      //                               p[6] = GetPosition(id, vec2(x,y));
      //                             }
      //                             if(i ==7)
      //                             {
      //                               p[7] = GetPosition(id, vec2(x,y));
      //                             }
      //                             if(i ==8)
      //                             {
      //                               p[8] = GetPosition(id, vec2(x,y));
      //                             }
      //                             // p[index] = GetPosition(id, vec2(x,y));
      //                             i++;
      //                         }
      //                     }

      //                     for(int i=0; i<9; i++)
      //                     {
      //                         m += Line(gv,p[4],p[i]);

      //                     }

      //                      m += Line(gv,p[1],p[3]);
      //                      m += Line(gv,p[1],p[5]);
      //                      m += Line(gv,p[5],p[7]);
      //                      m += Line(gv,p[7],p[3]);

      //                      return m;
      //                     //  return 1.0;
      //                 }

      //                 float Grain(vec2 uv)
      //                 {
      //                     return (fract(sin(dot(uv, vec2(12.9898,78.233)*2.0)) * 43758.5453));
      //                 }

      //                 czm_material czm_getMaterial(czm_materialInput materialInput)
      //                   {
      //                       czm_material material = czm_getDefaultMaterial(materialInput);
      //                       vec2 st = materialInput.st;
      //                       vec2 fragCoord = st*2.0-vec2(1.0);

      //                       float iTime = czm_frameNumber/30.0;
      //                       if(st.x<0.5){
      //                           iTime = -czm_frameNumber/30.0;
      //                       }
      //                       vec2 iResolution = normalize(czm_viewport.zw);

      //                       float t = iTime;
      //                       vec2 uv = st;//st*2.0-vec2(1.0); //(2. * fragCoord - iResolution.xy)/iResolution.y;
      //                       vec2 mouse = vec2(0.0);//iMouse.xy/iResolution.xy - 0.5;

      //                       vec2 fieldUV = uv + vec2(t* 0.01,t* 0.01);
      //                       float field = DrawField(fieldUV,20.);
      //                       float fieldMask = clamp(S(3.5,0.,length(uv *vec2(1.,2.) + vec2(0.0,-0.5))),0.,1.);
      //                       field *= fieldMask;

      //                       // vec3 backgroundColor = mix(vec3(0.6588, 0.9137, 1.),vec3(0.043,0.1689,0.3294),(uv.y*0.4 + 1.));
      //                       // vec3 color = backgroundColor + vec3(0.6588, 0.9137, 1.) * field;
      //                       vec3 backgroundColor = mix(vec3(0.0588, 0.0137, 0.),vec3(0.043,0.0689,0.0294),(uv.y*0.4 + 1.));
      //                       vec3 color = backgroundColor + lineColor.rgb * field; //backgroundColor + vec3(1.0, 0.0, 1.0) * field; //粒子色 黄
      //                       // vec3 color = backgroundColor + vec3(1.0, 0.0, 0.0) * field; //粒子色 红
      //                       // vec3 color = backgroundColor + vec3(0.0, 1.0, 1.0) * field; //粒子色 青

      //                       vec3 mountain = mix(vec3(0.),color,S(-0.82,-0.8,uv.y))- Grain(uv)*0.05;
      //                       vec4 fragColor = vec4(color- Grain(uv)*0.05 ,1.0);

      //                       // 扫描条带
      //                       float vfun = pow(abs(uv.x-(iTime-floor(iTime))),0.05);// x方向
      //                       // float vfun = pow(abs(1.0-(uv.y)+sin(iTime*2.0)*0.8),0.1);// x方向
      //                       // uv += vec2(iTime*0.1,0.);

      //                       vec3 col = mix( scanColor.rgb, mixColor.rgb,
      //                       vfun );
      //                       col = mix( scanColor2.rgb, col, vfun );

      //                       col = vec3(col);
      //                       vec4 fragColor2 = vec4(col,1.0);

      //                       material.diffuse =fragColor.rbg;//mix(fragColor.rbg,fragColor2.rgb,0.5);
      //                     //   float a2 = pow(fragColor.r*0.005, 3.0);
      //                     //   material.alpha = sin(a2);
      //                       float a = smoothstep(0.0, 1.0, pow(fragColor.b,0.5)); // 背景粒子感
      //                       material.alpha = a+0.3;
      //                       return material;
      //                   }`
      //     }
      //   })
      // }),
      asynchronous: false
    })
    this.frustumPrimitive = this.Viewer.scene.primitives.add(primitive)
  }
  // 创建轮廓线
  addOutline() {
    let frustum = new this.Cesium.PerspectiveFrustum({
      // 查看的视场角度，绕Z轴旋转，以弧度方式输入
      // The angle of the field of view (FOV), in radians.
      // This angle will be used as the horizontal FOV if the width is greater than the height, otherwise it will be the vertical FOV.
      fov: this.Cesium.Math.toRadians(this.fov),
      // 视锥体的宽度/高度
      aspectRatio: this.aspectRatio,
      // 近面距视点的距离
      near: this.near,
      // 远面距视点的距离
      far: this.far
    })
    let geometry = new this.Cesium.FrustumOutlineGeometry({
      frustum: frustum,
      origin: this.position,
      orientation: this.orientation,
      vertexFormat: this.Cesium.VertexFormat.POSITION_ONLY
    })
    let instance = new this.Cesium.GeometryInstance({
      geometry: geometry,
      attributes: {
        color: this.Cesium.ColorGeometryInstanceAttribute.fromColor(
          // new this.Cesium.Color(1, 1, 1, 1)
          new this.Cesium.Color(
            this.outlineColor[0] / 255,
            this.outlineColor[1] / 255,
            this.outlineColor[2] / 255,
            1
          )
        )
      }
    })
    let primitive = new this.Cesium.Primitive({
      geometryInstances: instance,
      appearance: new this.Cesium.PerInstanceColorAppearance({
        closed: true,
        flat: true
      }),
      asynchronous: false
    })
    this.outlinePrimitive = this.Viewer.scene.primitives.add(primitive)
  }

  update(position, orientation, heading, pitch, roll) {
    this.position = position
    this.orientation = orientation
    this.heading = heading
    this.pitch = pitch
    this.roll = roll
    this.lightCamera.setView({
      destination: this.position,
      orientation: {
        heading: this.heading,
        pitch: this.pitch,
        roll: this.roll
      }
    })
    this.add()
  }
}

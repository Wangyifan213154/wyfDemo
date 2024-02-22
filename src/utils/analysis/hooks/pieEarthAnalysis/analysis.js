export default function () {
  //地表距离测量
  const measureGroundDistance = (val) => {
    clearPost()
    const viewer = window.pieViewer
    if (val) {
      let engineTerrainProvider = new Earth.EngineTerrainProvider({
        // url: 'http://172.15.8.6:4041/terrain/{z}/{x}/{y}.terrain?v=1.1.0'
        // url: 'http://114.245.34.20:7026/PIE-EarthGISDEMDataProc/20220729160317台湾地形/'
        // url: 'https://pie-engine-test.s3.cn-northwest-1.amazonaws.com.cn/earthdata/mapdata/sichuandem/_alllayers/{z}/{y}/{x}.terrain',
        url: taiwanTerrainUrl,
        tms: true
      })
      window.pieViewer.terrainProvider = engineTerrainProvider
      viewer.camera.flyTo({
        destination: Earth.Cartesian3.fromDegrees(121.3592, 24.2418, 150000.0)
      })
      viewer.scene.globe.setGlobeTool(Earth.GlobeToolType.MeasureLength)
      const measureTool = viewer.scene.globe.getGlobeTool()
      measureTool.getResultEvent().addEventListener(function (length) {
        // viewer.scene.globe.setGlobeTool(Earth.GlobeToolType.Pan)
        // measureTool = null
      })
    } else {
      viewer.scene.globe.setGlobeTool(Earth.GlobeToolType.Pan)
    }

    // const handler = new Earth.ScreenSpaceEventHandler(viewer.scene.canvas);
  }
  //地表角度测量
  const measureAngle = (val) => {
    clearPost()
    const viewer = window.pieViewer
    if (val) {
      let engineTerrainProvider = new Earth.EngineTerrainProvider({
        // url: 'http://172.15.8.6:4041/terrain/{z}/{x}/{y}.terrain?v=1.1.0'
        // url: 'http://114.245.34.20:7026/PIE-EarthGISDEMDataProc/20220729160317台湾地形/'
        // url: 'https://pie-engine-test.s3.cn-northwest-1.amazonaws.com.cn/earthdata/mapdata/sichuandem/_alllayers/{z}/{y}/{x}.terrain',
        url: taiwanTerrainUrl,
        tms: true
      })
      window.pieViewer.terrainProvider = engineTerrainProvider
      viewer.camera.flyTo({
        destination: Earth.Cartesian3.fromDegrees(121.3592, 24.2418, 150000.0)
      })
      document.oncontextmenu = function () {
        return false
      }
      viewer.scene.globe.setGlobeTool(Earth.GlobeToolType.MeasureAngle)
      const measureAngleTool = viewer.scene.globe.getGlobeTool()
      let a = measureAngleTool
        .getResultEvent()
        .addEventListener(function (angle) {
          // viewer.scene.globe.setGlobeTool(Earth.GlobeToolType.Pan)
          // a = null
        })
    } else {
      viewer.scene.globe.setGlobeTool(Earth.GlobeToolType.Pan)
    }
  }
  //方位角测量
  const measureAzimuthAngle = (val) => {
    clearPost()
    const viewer = window.pieViewer
    if (val) {
      let engineTerrainProvider = new Earth.EngineTerrainProvider({
        // url: 'http://172.15.8.6:4041/terrain/{z}/{x}/{y}.terrain?v=1.1.0'
        // url: 'http://114.245.34.20:7026/PIE-EarthGISDEMDataProc/20220729160317台湾地形/'
        // url: 'https://pie-engine-test.s3.cn-northwest-1.amazonaws.com.cn/earthdata/mapdata/sichuandem/_alllayers/{z}/{y}/{x}.terrain',
        url: taiwanTerrainUrl,
        tms: true
      })
      window.pieViewer.terrainProvider = engineTerrainProvider
      viewer.camera.flyTo({
        destination: Earth.Cartesian3.fromDegrees(121.3592, 24.2418, 150000.0)
      })
      viewer.scene.globe.setGlobeTool(Earth.GlobeToolType.MeasureAzimuthAngle)
      const measureAzimuthAngleTool = viewer.scene.globe.getGlobeTool()
      measureAzimuthAngleTool
        .getResultEvent()
        .addEventListener(function (azimuth) {
          // viewer.scene.globe.setGlobeTool(Earth.GlobeToolType.Pan)
          // measureAzimuthAngleTool = null
        })
    } else {
      viewer.scene.globe.setGlobeTool(Earth.GlobeToolType.Pan)
    }
  }
  //测量地表面积
  const measureGroundArea = (val) => {
    clearPost()
    const viewer = window.pieViewer
    if (val) {
      let engineTerrainProvider = new Earth.EngineTerrainProvider({
        // url: 'http://172.15.8.6:4041/terrain/{z}/{x}/{y}.terrain?v=1.1.0'
        // url: 'http://114.245.34.20:7026/PIE-EarthGISDEMDataProc/20220729160317台湾地形/'
        // url: 'https://pie-engine-test.s3.cn-northwest-1.amazonaws.com.cn/earthdata/mapdata/sichuandem/_alllayers/{z}/{y}/{x}.terrain',
        url: taiwanTerrainUrl,
        tms: true
      })
      window.pieViewer.terrainProvider = engineTerrainProvider
      viewer.camera.flyTo({
        destination: Earth.Cartesian3.fromDegrees(121.3592, 24.2418, 150000.0)
      })
      viewer.scene.globe.setGlobeTool(Earth.GlobeToolType.MeasureArea)
      const measureAreaTool = viewer.scene.globe.getGlobeTool()
      measureAreaTool.getResultEvent().addEventListener(function (area) {
        // viewer.scene.globe.setGlobeTool(Earth.GlobeToolType.Pan)
        // measureAreaTool = null
      })
    } else {
      viewer.scene.globe.setGlobeTool(Earth.GlobeToolType.Pan)
    }
  }
  //挖填方分析
  const ExcavationTool = (val) => {
    clearPost()
    const viewer = window.pieViewer
    if (val) {
      let engineTerrainProvider = new Earth.EngineTerrainProvider({
        // url: 'http://172.15.8.6:4041/terrain/{z}/{x}/{y}.terrain?v=1.1.0'
        // url: 'http://114.245.34.20:7026/PIE-EarthGISDEMDataProc/20220729160317台湾地形/'
        // url: 'https://pie-engine-test.s3.cn-northwest-1.amazonaws.com.cn/earthdata/mapdata/sichuandem/_alllayers/{z}/{y}/{x}.terrain',
        url: taiwanTerrainUrl,
        tms: true
      })
      window.pieViewer.terrainProvider = engineTerrainProvider
      viewer.camera.flyTo({
        destination: Earth.Cartesian3.fromDegrees(121.3592, 24.2418, 150000.0)
      })
      viewer.scene.globe.setGlobeTool(Earth.GlobeToolType.AnalyseExcavation)
      const analyseExcavationTool = viewer.scene.globe.getGlobeTool()
      analyseExcavationTool.getResultEvent().addEventListener(function () {
        var area = analyseExcavationTool.getSurfaceArea() //获取表面积
        var bumpVolume = analyseExcavationTool.getExcavationBumpVolume() //获取体积
        var maximumHeight = analyseExcavationTool.getTerrainMaximumHeight() //获取最大高度
        var minimumHeight = analyseExcavationTool.getTerrainMinimumHeight() //获取最小高度
        alert(
          '表面积:' +
          area +
          '平方米; \n' +
          '体积:' +
          bumpVolume +
          '立方米; \n' +
          '最大高度:' +
          maximumHeight +
          '米; \n' +
          '最小高度:' +
          minimumHeight +
          '米; '
        )
      })
    } else {
      viewer.scene.globe.setGlobeTool(Earth.GlobeToolType.Pan)
    }
  }
  //测量坡度坡向
  const slopeAspect = (val) => {
    clearPost()
    const viewer = window.pieViewer
    if (val) {
      let engineTerrainProvider = new Earth.EngineTerrainProvider({
        // url: 'http://172.15.8.6:4041/terrain/{z}/{x}/{y}.terrain?v=1.1.0'
        // url: 'http://114.245.34.20:7026/PIE-EarthGISDEMDataProc/20220729160317台湾地形/'
        // url: 'https://pie-engine-test.s3.cn-northwest-1.amazonaws.com.cn/earthdata/mapdata/sichuandem/_alllayers/{z}/{y}/{x}.terrain',
        url: taiwanTerrainUrl,
        tms: true
      })
      window.pieViewer.terrainProvider = engineTerrainProvider
      viewer.camera.flyTo({
        destination: Earth.Cartesian3.fromDegrees(121.3592, 24.2418, 150000.0)
      })
      viewer.scene.globe.setGlobeTool(Earth.GlobeToolType.SlopeAspect)
      const slopeAspectTool = viewer.scene.globe.getGlobeTool()
      /** 监听坡度坡向分析工具使用，并通过回调函数返回测量值 **/
      slopeAspectTool.getResultEvent().addEventListener(function (area) { })
    } else {
      viewer.scene.globe.setGlobeTool(Earth.GlobeToolType.Pan)
    }
  }
  //淹没分析
  const visibleFlood = (val) => {
    clearPost()
    const viewer = window.pieViewer
    if (val) {
      let engineTerrainProvider = new Earth.EngineTerrainProvider({
        // url: 'http://172.15.8.6:4041/terrain/{z}/{x}/{y}.terrain?v=1.1.0'
        // url: 'http://114.245.34.20:7026/PIE-EarthGISDEMDataProc/20220729160317台湾地形/'
        // url: 'https://pie-engine-test.s3.cn-northwest-1.amazonaws.com.cn/earthdata/mapdata/sichuandem/_alllayers/{z}/{y}/{x}.terrain',
        url: taiwanTerrainUrl,
        tms: true
      })
      window.pieViewer.terrainProvider = engineTerrainProvider
      viewer.camera.flyTo({
        destination: Earth.Cartesian3.fromDegrees(121.3592, 24.2418, 150000.0)
      })
      viewer.scene.globe.setGlobeTool(Earth.GlobeToolType.AnalyseVisibleFlood)
      const visibleFloodTool = viewer.scene.globe.getGlobeTool()
      visibleFloodTool.getResultEvent().addEventListener(function () {
        var height = visibleFloodTool.getHeight() // 获取淹没高度
        var area = visibleFloodTool.getArea() // 获取淹没面积
        var volume = visibleFloodTool.getVolume() // 获取淹没体积
        var maximumHeight = visibleFloodTool.getMaximumHeight() // 获取淹没的最大高度
        var minimumHeight = visibleFloodTool.getMinimumHeight() // 获取淹没的最小高度
        alert(
          '淹没高度:' +
          height +
          '米; ' +
          '淹没面积:' +
          area +
          '平方米; ' +
          '淹没体积:' +
          volume +
          '立方米;' +
          '最大高度:' +
          maximumHeight +
          '米; ' +
          '最小高度:' +
          minimumHeight +
          '米; '
        )
        // visibleFloodTool = null
      })
    } else {
      viewer.scene.globe.setGlobeTool(Earth.GlobeToolType.Pan)
    }
  }
  //光照分析
  const Analyse3DSunshine = (val) => {
    clearPost()
    const viewer = window.pieViewer
    if (val) {
      viewer.scene.globe.setGlobeTool(Earth.GlobeToolType.Analyse3DSunshine)
      let handler = new Earth.ScreenSpaceEventHandler(viewer.scene.canvas)
      handler.setInputAction(function (movement) {
        handler = null
        // viewer.scene.globe.setGlobeTool(Earth.GlobeToolType.Pan);
      }, Earth.ScreenSpaceEventType.RIGHT_CLICK)
    } else {
      viewer.scene.globe.setGlobeTool(Earth.GlobeToolType.Pan)
    }
  }
  //雷达分析
  const AnalysisRadar = (val) => {
    clearPost()
    const viewer = window.pieViewer
    if (val) {
      let handler = new Earth.ScreenSpaceEventHandler(viewer.scene.canvas)
      viewer.scene.globe.setGlobeTool(Earth.GlobeToolType.AnalysisRadar)
      handler.setInputAction(function (movement) {
        handler = null
      }, Earth.ScreenSpaceEventType.RIGHT_CLICK)
    } else {
      viewer.scene.globe.setGlobeTool(Earth.GlobeToolType.Pan)
    }
  }
  //天际线分析
  const Analyse3DSkyline = (val) => {
    clearPost()
    const viewer = window.pieViewer
    if (val) {
      viewer.scene.globe.setGlobeTool(Earth.GlobeToolType.Analyse3DSkyline) // 设置天际线分析工具
      var analyseSkylineTool = viewer.scene.globe.getGlobeTool() // 获取当前天际线分析工具
      analyseSkylineTool.setRegionVisible(true) // 配置天际线绘制中视面是否可见，参数类型为Boolean
      analyseSkylineTool.setCameraVisible(true) // 配置天际线绘制中相机是否可见，参数类型为Boolean
      analyseSkylineTool.draw() // 开始绘制天际线
      let handler = new Earth.ScreenSpaceEventHandler(viewer.scene.canvas)
      handler.setInputAction(function (movement) {
        // viewer.scene.globe.setGlobeTool(Earth.GlobeToolType.Pan)
        handler = null
      }, Earth.ScreenSpaceEventType.RIGHT_CLICK)
    } else {
      viewer.scene.globe.setGlobeTool(Earth.GlobeToolType.Pan)
    }
  }
  //地形点线通视
  const AnalyseVisibleLine = (val) => {
    clearPost()
    const viewer = window.pieViewer
    if (val) {
      let engineTerrainProvider = new Earth.EngineTerrainProvider({
        // url: 'http://172.15.8.6:4041/terrain/{z}/{x}/{y}.terrain?v=1.1.0'
        // url: 'http://114.245.34.20:7026/PIE-EarthGISDEMDataProc/20220729160317台湾地形/'
        // url: 'https://pie-engine-test.s3.cn-northwest-1.amazonaws.com.cn/earthdata/mapdata/sichuandem/_alllayers/{z}/{y}/{x}.terrain',
        url: taiwanTerrainUrl,
        tms: true
      })
      viewer.camera.flyTo({
        destination: Earth.Cartesian3.fromDegrees(121.3592, 24.2418, 150000.0)
      })
      window.pieViewer.terrainProvider = engineTerrainProvider
      viewer.scene.globe.setGlobeTool(Earth.GlobeToolType.AnalyseVisibleLine)
      let handler = new Earth.ScreenSpaceEventHandler(viewer.scene.canvas)
      handler.setInputAction(function (movement) {
        // viewer.scene.globe.setGlobeTool(Earth.GlobeToolType.Pan)
        handler = null
      }, Earth.ScreenSpaceEventType.RIGHT_CLICK)
    } else {
      viewer.scene.globe.setGlobeTool(Earth.GlobeToolType.Pan)
    }
  }
  //地形点面通视
  const AnalyseVisibleRegion = (val) => {
    clearPost()
    const viewer = window.pieViewer
    if (val) {
      let engineTerrainProvider = new Earth.EngineTerrainProvider({
        // url: 'http://172.15.8.6:4041/terrain/{z}/{x}/{y}.terrain?v=1.1.0'
        // url: 'http://114.245.34.20:7026/PIE-EarthGISDEMDataProc/20220729160317台湾地形/'
        // url: 'https://pie-engine-test.s3.cn-northwest-1.amazonaws.com.cn/earthdata/mapdata/sichuandem/_alllayers/{z}/{y}/{x}.terrain',
        url: taiwanTerrainUrl,
        tms: true
      })
      viewer.camera.flyTo({
        destination: Earth.Cartesian3.fromDegrees(121.3592, 24.2418, 150000.0)
      })
      window.pieViewer.terrainProvider = engineTerrainProvider
      viewer.scene.globe.setGlobeTool(Earth.GlobeToolType.AnalyseVisibleRegion)
      let handler = new Earth.ScreenSpaceEventHandler(viewer.scene.canvas)
      handler.setInputAction(function (movement) {
        // viewer.scene.globe.setGlobeTool(Earth.GlobeToolType.Pan)
        handler = null
      }, Earth.ScreenSpaceEventType.RIGHT_CLICK)
    } else {
      viewer.scene.globe.setGlobeTool(Earth.GlobeToolType.Pan)
    }
  }
  //天气仿分析
  let particleSystemEn = null
  const particleSystem = (val) => {
    clearPost()
    const viewer = window.pieViewer
    if (val) {
      const img = require('@/assets/image/particle/rain4.png')
      particleSystemEn = new Earth.Entity({
        name: 'particleSystem',
        position: Earth.Cartesian3.fromDegrees(100, 30, 10),
        weatherSystem: {
          image: img,
          size: 500,
          // size: 50,
          transparent: true,
          sizeAttenuation: true,
          speed: 50,
          particleNumber: 1000000,
          radius: 250000
        }
      })

      viewer.entities.add(particleSystemEn)
      // viewer.camera.lookAt(Earth.Cartesian3.fromDegrees(100, 30, 10000)
      // 	, new Earth.HeadingPitchRange(Earth.Math.toRadians(0), Earth.Math.toRadians(90), 0));
      viewer.camera.flyTo({
        destination: Earth.Cartesian3.fromDegrees(100, 30, 2000),
        orientation: {
          heading: Earth.Math.toRadians(60),
          pitch: Earth.Math.toRadians(0),
          roll: 0.0
        },
        duration: 2,
        complete: () => {
          viewer.camera.flyTo({
            destination: Earth.Cartesian3.fromDegrees(100, 30, 2000),
            orientation: {
              heading: Earth.Math.toRadians(60),
              pitch: Earth.Math.toRadians(90),
              roll: 0.0
            },
            duration: 2,
            complete: () => { }
          })
        }
      })
    } else {
      // particleSystemEn.show=false
      viewer.entities.remove(particleSystemEn)
      particleSystemEn = null
    }
  }
  //模型点线通视
  const analyse3DVisibleLine = (val) => {
    clearPost()
    const viewer = window.pieViewer
    if (val) {
      let layer = viewer.layer3Ds.add(
        new Earth.OSGB3DLayer({
          url: osgbUrl
        })
      )
      layer.height = 100

      viewer.camera.flyTo({
        destination: Earth.Cartesian3.fromDegrees(121.5386, 25.0423, 1000),
        orientation: {
          heading: Earth.Math.toRadians(0),
          pitch: Earth.Math.toRadians(60),
          roll: 0.0
        },
        duration: 1,
        complete: () => {
          viewer.scene.globe.setGlobeTool(
            Earth.GlobeToolType.Analyse3DVisibleLine
          )
        }
      })
      let handler = new Earth.ScreenSpaceEventHandler(viewer.scene.canvas)
      handler.setInputAction(function (movement) {
        // viewer.scene.globe.setGlobeTool(Earth.GlobeToolType.Pan)
        handler = null
      }, Earth.ScreenSpaceEventType.RIGHT_CLICK)
    } else {
      viewer.scene.globe.setGlobeTool(Earth.GlobeToolType.Pan)
    }
  }
  //模型点面通视
  const analyse3DVisibleRegion = (val) => {
    clearPost()
    const viewer = window.pieViewer
    if (val) {
      let layer = viewer.layer3Ds.add(
        new Earth.OSGB3DLayer({
          url: osgbUrl
        })
      )
      layer.height = 100
      viewer.camera.flyTo({
        destination: Earth.Cartesian3.fromDegrees(121.5386, 25.0423, 1000),
        orientation: {
          heading: Earth.Math.toRadians(0),
          pitch: Earth.Math.toRadians(60),
          roll: 0.0
        },
        duration: 1,
        complete: () => {
          viewer.scene.globe.setGlobeTool(
            Earth.GlobeToolType.Analyse3DVisibleRegion
          )
        }
      })
      let handler = new Earth.ScreenSpaceEventHandler(viewer.scene.canvas)
      handler.setInputAction(function (movement) {
        // viewer.scene.globe.setGlobeTool(Earth.GlobeToolType.Pan)
        handler = null
      }, Earth.ScreenSpaceEventType.RIGHT_CLICK)
    } else {
      viewer.scene.globe.setGlobeTool(Earth.GlobeToolType.Pan)
    }
  }

  const measureOSGBLengthTool = (val) => {
    clearPost()
    const viewer = window.pieViewer
    if (val) {
      viewer.scene.globe.setGlobeTool(Earth.GlobeToolType.Measure3DLength)
      const measureOSGBLengthTool = viewer.scene.globe.getGlobeTool()
      measureOSGBLengthTool
        .getResultEvent()
        .addEventListener(function (length) {
          alert('空间距离:' + length + '米;')
        })
      let handler = new Earth.ScreenSpaceEventHandler(viewer.scene.canvas)
      handler.setInputAction(function (movement) {
        // viewer.scene.globe.setGlobeTool(Earth.GlobeToolType.Pan)
        handler = null
      }, Earth.ScreenSpaceEventType.RIGHT_CLICK)
    } else {
      viewer.scene.globe.setGlobeTool(Earth.GlobeToolType.Pan)
    }
  }
  //测量空间高度
  const measureOSGBHeight = (val) => {
    clearPost()
    const viewer = window.pieViewer
    if (val) {
      let engineTerrainProvider = new Earth.EngineTerrainProvider({
        // url: 'http://172.15.8.6:4041/terrain/{z}/{x}/{y}.terrain?v=1.1.0'
        // url: 'http://114.245.34.20:7026/PIE-EarthGISDEMDataProc/20220729160317台湾地形/'
        // url: 'https://pie-engine-test.s3.cn-northwest-1.amazonaws.com.cn/earthdata/mapdata/sichuandem/_alllayers/{z}/{y}/{x}.terrain',
        url: taiwanTerrainUrl,
        tms: true
      })
      viewer.camera.flyTo({
        destination: Earth.Cartesian3.fromDegrees(121.3592, 24.2418, 150000.0)
      })
      window.pieViewer.terrainProvider = engineTerrainProvider
      viewer.scene.globe.setGlobeTool(Earth.GlobeToolType.Measure3DHeight)
      const measureOSGBHeight = viewer.scene.globe.getGlobeTool()
      measureOSGBHeight.getResultEvent().addEventListener(function (height) {
        alert('空间高度:' + height + '米;')
      })
      let handler = new Earth.ScreenSpaceEventHandler(viewer.scene.canvas)
      handler.setInputAction(function (movement) {
        // viewer.scene.globe.setGlobeTool(Earth.GlobeToolType.Pan)
        handler = null
      }, Earth.ScreenSpaceEventType.RIGHT_CLICK)
    } else {
      viewer.scene.globe.setGlobeTool(Earth.GlobeToolType.Pan)
    }
  }
  //测量空间面积
  const measureOSGBAreaTool = (val) => {
    clearPost()
    const viewer = window.pieViewer
    if (val) {
      viewer.scene.globe.setGlobeTool(Earth.GlobeToolType.Measure3DArea)
      const measureOSGBAreaTool = viewer.scene.globe.getGlobeTool()
      measureOSGBAreaTool.getResultEvent().addEventListener(function (area) {
        alert('空间面积:' + area + '平方米;')
      })
      let handler = new Earth.ScreenSpaceEventHandler(viewer.scene.canvas)
      handler.setInputAction(function (movement) {
        // viewer.scene.globe.setGlobeTool(Earth.GlobeToolType.Pan)
        handler = null
      }, Earth.ScreenSpaceEventType.RIGHT_CLICK)
    } else {
      viewer.scene.globe.setGlobeTool(Earth.GlobeToolType.Pan)
    }
  }
  //测量空间角度
  const measureOSGBAngle = (val) => {
    clearPost()
    const viewer = window.pieViewer
    if (val) {
      viewer.scene.globe.setGlobeTool(Earth.GlobeToolType.Measure3DArea)
      viewer.scene.globe.setGlobeTool(Earth.GlobeToolType.Measure3DAngle)
      const measureOSGBAngle = viewer.scene.globe.getGlobeTool()
      measureOSGBAngle.getResultEvent().addEventListener(function (angle) {
        alert('空间角度:' + angle + '度')
      })
      let handler = new Earth.ScreenSpaceEventHandler(viewer.scene.canvas)
      handler.setInputAction(function (movement) {
        // viewer.scene.globe.setGlobeTool(Earth.GlobeToolType.Pan)
        handler = null
      }, Earth.ScreenSpaceEventType.RIGHT_CLICK)
    } else {
      viewer.scene.globe.setGlobeTool(Earth.GlobeToolType.Pan)
    }
  }
  const geoJsonDataSource = () => {
    const viewer = window.pieViewer
    viewer.camera.flyTo({
      // 118.34573072478551 32.25604843382856 131.6186629187405
      destination: new Earth.Cartesian3(
        -3271857.6109550497,
        5574854.290683389,
        2829528.4988796073
      ),
      orientation: {
        heading: 6.283185307179585, //偏航角
        pitch: -1.5696807415095337, //-0.08401170275668313, //水平俯仰角
        roll: 0.0
      },
      complete: () => {
        // emitter.emit('voice')
      }
    })

    const line = viewer.dataSources
      .add(
        Earth.GeoJsonDataSource.load('static/geojson/taiwanCityPolygon.json', {
          stroke: Earth.Color.PINK,
          strokeWidth: 2
        })
      )
      .then((data) => {
        console.log(data)
      })
  }

  const groundExtract = () => {
    let scanLight01post = createScanLightPostPorcess()
    let loadpost = createLoadPostPorcess()
    let findSARTarget = createFindTargetPostPorcess()
    window.ppsCollection.add(scanLight01post)
    setTimeout(() => {
      window.ppsCollection.remove(scanLight01post)
      window.ppsCollection.add(loadpost)
      setTimeout(() => {
        window.ppsCollection.remove(loadpost)
        window.ppsCollection.add(findSARTarget)
        setTimeout(() => {
          window.ppsCollection.remove(findSARTarget)
        }, 2000)
      }, 2000)
    }, 4000)
  }
  const createScanLightPostPorcess = () => {
    let scanLight01Post = new window.XEarth.PostProcessStage({
      name: 'scanLight01',
      fragmentShader: scanLightGLSL
    })
    return scanLight01Post
  }
  const createLoadPostPorcess = () => {
    let loadPost = new window.XEarth.PostProcessStage({
      name: 'load',
      fragmentShader: loadGLSL
    })
    return loadPost
  }
  const createFindTargetPostPorcess = () => {
    let findTarget = new window.XEarth.PostProcessStage({
      name: 'findTarget',
      fragmentShader: findtargetGLSL
    })
    return findTarget
  }
  //剖面
  const profileAnalyse = (val) => {
    clearPost()
    const viewer = window.pieViewer
    if (val) {
      viewer.scene.globe.setGlobeTool(Earth.GlobeToolType.Profile)
      let engineTerrainProvider = new Earth.EngineTerrainProvider({
        // url: 'http://172.15.8.6:4041/terrain/{z}/{x}/{y}.terrain?v=1.1.0'
        // url: 'http://114.245.34.20:7026/PIE-EarthGISDEMDataProc/20220729160317台湾地形/'
        // url: 'https://pie-engine-test.s3.cn-northwest-1.amazonaws.com.cn/earthdata/mapdata/sichuandem/_alllayers/{z}/{y}/{x}.terrain'
        url: taiwanTerrainUrl,
        tms: true
      })
      // viewer.camera.flyTo({
      //   destination: Earth.Cartesian3.fromDegrees(121.3592, 24.2418, 150000.0)
      // })
      window.pieViewer.terrainProvider = engineTerrainProvider
      const profileTool = viewer.scene.globe.getGlobeTool()
      profileTool.getResultEvent().addEventListener(function () {
        const altitudeData = profileTool.getAltitudeData()
        alert('第一个对象的海拔高度 ' + altitudeData[0].z)
      })
    } else {
      viewer.scene.globe.setGlobeTool(Earth.GlobeToolType.Pan)
    }
  }
  //雷电
  const thunder = (val) => {
    clearPost()
    const viewer = window.pieViewer
    if (val) {
      viewer.postProcessStages.add(Earth.PostProcessStage.Thunder, {})
      // viewer.camera.flyTo({
      //   destination: Earth.Cartesian3.fromDegrees(121.3592, 24.2418, 15000)
      // })
    } else {
      viewer.postProcessStages.remove(Earth.PostProcessStage.Thunder)
    }
  }
  //雾
  const fog = (val) => {
    clearPost()
    const viewer = window.pieViewer
    if (val) {
      viewer.postProcessStages.add(Earth.PostProcessStage.Fog, {
        fogFactor: 0.8
      })
    } else {
      viewer.postProcessStages.remove(Earth.PostProcessStage.Fog)
    }
  }
  //沙尘暴
  const SandStorm = (val) => {
    clearPost()
    const viewer = window.pieViewer
    if (val) {
      viewer.postProcessStages.add(Earth.PostProcessStage.SandStorm, {
        sandFactor: 1.0
      })
    } else {
      viewer.postProcessStages.remove(Earth.PostProcessStage.SandStorm)
    }
  }
  //清除天气效果
  const clearPost = () => {
    const viewer = window.pieViewer
    if (particleSystemEn != null) {
      viewer.entities.remove(particleSystemEn)
      particleSystemEn = null
    }
    viewer.scene.globe.setGlobeTool(Earth.GlobeToolType.Pan)
    viewer.postProcessStages.remove(Earth.PostProcessStage.Thunder)
    viewer.postProcessStages.remove(Earth.PostProcessStage.Fog)
    viewer.postProcessStages.remove(Earth.PostProcessStage.SandStorm)
    viewer.postProcessStages.remove(Earth.PostProcessStage.Rain)
    viewer.postProcessStages.remove(Earth.PostProcessStage.Snow)
  }
  //雨
  const rain = (val) => {
    clearPost()
    const viewer = window.pieViewer
    if (val) {
      viewer.postProcessStages.add(Earth.PostProcessStage.Rain, {
        threshold: 0.9,
        strength: 1.5,
        radius: 0.1
      })
    } else {
      viewer.postProcessStages.remove(Earth.PostProcessStage.Rain)
    }
  }
  //雪
  const snow = (val) => {
    clearPost()
    const viewer = window.pieViewer
    if (val) {
      viewer.postProcessStages.add(Earth.PostProcessStage.Snow, {})
    } else {
      viewer.postProcessStages.remove(Earth.PostProcessStage.Snow)
    }
  }
  //粒子系统效果
  let liziSystemEn = null
  const lizi = (val) => {
    clearPost()
    const viewer = window.pieViewer
    if (val && liziSystemEn == null) {
      liziSystemEn = new Earth.Entity({
        name: 'liziSystem',
        position: Earth.Cartesian3.fromDegrees(100, 30, 10),
        particleSystem: {
          image: 'Resource/SymbolLib/System/01.png',

          endColor: Earth.Color.WHITE.withAlpha(0.7),
          startColor: Earth.Color.WHITE.withAlpha(1.0),

          startScale: 10,
          endScale: 40,

          minimumParticleLife: 5,
          maximumParticleLife: 15,

          minimumSpeed: 11,
          maximumSpeed: 12,

          imageSize: new Earth.Cartesian2(150, 150),
          sizeInMeters: true,
          emissionRate: 50,

          // lifetime: 20000.0,
          emitterDir: new Earth.Cartesian3(Math.PI / 2, 0, 0),
          emitter: new Earth.ConeEmitter((10 * Math.PI) / 180),
          updateCallback: function (
            particle,
            dt,
            modelMatrix,
            emitterDirMatrix
          ) {
            const position = new Earth.Cartesian3()
            Earth.Matrix4.getTranslation(modelMatrix, position)
            var gravityVector = Earth.Cartesian3.normalize(
              position,
              new Earth.Cartesian3()
            )
            //转化到局部坐标
            const inverseModelMatrix = Earth.Matrix4.inverse(
              modelMatrix,
              new Earth.Matrix4()
            )
            var localVec = Earth.Matrix4.multiplyByPointAsVector(
              inverseModelMatrix,
              gravityVector,
              new Earth.Cartesian3()
            )
            var emitVec = Earth.Matrix4.multiplyByPointAsVector(
              emitterDirMatrix,
              localVec,
              new Earth.Cartesian3()
            )
            Earth.Cartesian3.multiplyByScalar(emitVec, 9.8 * dt, emitVec)
            particle.velocity = Earth.Cartesian3.add(
              particle.velocity,
              emitVec,
              particle.velocity
            )
          }
        }
      })
      viewer.entities.add(liziSystemEn)
    } else {
      viewer.entities.remove(liziSystemEn)
      liziSystemEn = null
    }
  }
  //火焰效果
  let fireEn = null
  const fire = (val) => {
    clearPost()
    const viewer = window.pieViewer
    if (val && fireEn == null) {
      fireEn = new Earth.Entity({
        name: 'particleSystem',
        position: Earth.Cartesian3.fromDegrees(
          116.3731147321088,
          39.86682740443612,
          10
        ),
        particleSystem: {
          image: 'Resource/SymbolLib/System/01.png',
          endColor: Earth.Color.WHITE.withAlpha(0.7),
          startColor: Earth.Color.WHITE.withAlpha(1.0),
          startScale: 40,
          endScale: 10,
          minimumParticleLife: 1,
          maximumParticleLife: 2,
          minimumSpeed: 1,
          maximumSpeed: 3,
          imageSize: new Earth.Cartesian2(150, 150),
          sizeInMeters: true,
          emissionRate: 50,
          // lifetime: 20000.0,
          emitterDir: new Earth.Cartesian3(0, 0, Math.PI / 2),
          emitter: new Earth.ConeEmitter((20 * Math.PI) / 180),
          updateCallback: function (
            particle,
            dt,
            modelMatrix,
            emitterDirMatrix
          ) {
            const position = new Earth.Cartesian3()
            Earth.Matrix4.getTranslation(modelMatrix, position)
            var gravityVector = Earth.Cartesian3.normalize(
              position,
              new Earth.Cartesian3()
            )
            //转化到局部坐标
            const inverseModelMatrix = Earth.Matrix4.inverse(
              modelMatrix,
              new Earth.Matrix4()
            )
            var localVec = Earth.Matrix4.multiplyByPointAsVector(
              inverseModelMatrix,
              gravityVector,
              new Earth.Cartesian3()
            )
            var emitVec = Earth.Matrix4.multiplyByPointAsVector(
              emitterDirMatrix,
              localVec,
              new Earth.Cartesian3()
            )
            Earth.Cartesian3.multiplyByScalar(emitVec, 9.8 * dt, emitVec)
            particle.velocity = Earth.Cartesian3.add(
              particle.velocity,
              emitVec,
              particle.velocity
            )
          }
        }
      })

      viewer.entities.add(fireEn)
    } else {
      viewer.entities.remove(fireEn)
      fireEn = null
    }
  }
  //鼠标绘制面
  const mousePolyon = (val) => { }
  return {
    measureGroundDistance,
    measureGroundArea,
    ExcavationTool,
    slopeAspect,
    visibleFlood,
    Analyse3DSunshine,
    AnalysisRadar,
    Analyse3DSkyline,
    AnalyseVisibleLine,
    particleSystem,
    AnalyseVisibleRegion,
    measureAngle,
    analyse3DVisibleLine,
    analyse3DVisibleRegion,
    measureOSGBLengthTool,
    measureOSGBHeight,
    measureOSGBAreaTool,
    measureOSGBAngle,
    groundExtract,
    measureAzimuthAngle,
    geoJsonDataSource,
    profileAnalyse,
    thunder,
    fog,
    SandStorm,
    rain,
    snow,
    lizi
  }
}

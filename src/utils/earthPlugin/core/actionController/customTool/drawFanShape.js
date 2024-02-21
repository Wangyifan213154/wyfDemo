class DrawFanShape {
  constructor(viewer, sourceName, config) {
    this._viewer = viewer
    let dataSourceList = viewer.dataSources.getByName(sourceName)
    if (!dataSourceList || dataSourceList.length === 0) {
      this._dataSource = new window.XEarth.CustomDataSource(sourceName)
      viewer.dataSources.add(this._dataSource) // 为扇形数据建立一个自定义数据源
    } else {
      this._dataSource = dataSourceList[0]
    }
    this._config = config || {
      color: window.XEarth.Color.RED,
      labelFont: '14px sans-serif',
      labelFillColor: window.XEarth.Color.BLACK,
      labelOutlineWidth: 1,
      labelOutlineColor: window.XEarth.Color.GOLD
    }
  }
  /**
   * @description 画扇形（从正北开始顺时针旋转）
   * @param {String} id 扇形ID
   * @param {Object} position 中心点位置
   * @param {Object} heading 航向
   * @param {Object} color 扇形颜色
   * @param {Number} radius 扇形半径
   * @param {Number} angle 角度大小
   * @param {String} type 类别-用于区分是否是同一个目标的扇形
   */
  drawSector(params) {
    // 通过圆心（经纬度）、航偏角度d1、d2（d1<d2）、半径
    // d1、d2 可以通过此方法获取：假设当前目标航向角度A，d1 = A - 自定义扇形角度/2；d2 = A + 自定义扇形角度/2；
    let { id, position, heading, angle, color, type, radius, label } = params
    let A = window.XEarth.Math.toDegrees(heading.getValue()) // 弧度转角度
    let d1 = A - angle / 2 // 扇形第一个边的角度
    let d2 = A + angle / 2 // 扇形第二个边的角度
    let pos = this.cartesian2Degrees(position.getValue())
    let { lon, lat, height } = pos

    let box = this._dataSource.entities.add({
      id: id,
      polygon: {
        show: true,
        hierarchy: this.generateHierarchy(lon, lat, height, d1, d2, radius),
        material: color
          ? color.withAlpha(0.5)
          : this._config.color.withAlpha(0.5),
        outline: true,
        outlineWidth: 1,
        outlineColor: color ? color : this._config.color,
        zIndex: Math.floor(1000 / radius)
      },
      position: this.getLabelPos(lon, lat, height, A, radius), // Label显示需要位置
      label: {
        show: true,
        text: label,
        font: this._config.labelFont,
        fillColor: this._config.labelFillColor,
        outlineWidth: this._config.labelOutlineWidth,
        outlineColor: this._config.labelOutlineColor,
        style: window.XEarth.LabelStyle.FILL_AND_OUTLINE,
        verticalOrigin: window.XEarth.VerticalOrigin.BOTTOM,
        pixelOffset: new window.XEarth.Cartesian2(0, 10),
        disableDepthTestDistance: 5e8,
        distanceDisplayCondition: new window.XEarth.DistanceDisplayCondition(
          0.0,
          6e6
        ),
        horizontalOrigin: window.XEarth.HorizontalOrigin.CENTER
      },
      type: type,
      customFields: {
        // 缓存一些字段方便查找
        position: position,
        heading: heading,
        color: color,
        angle: angle,
        radius: radius
      }
    })
    return box
  }
  /**
   * 生成label的position
   */
  getLabelPos(lon, lat, height, A, radius) {
    let point = this.getPointByProjection(
      lon,
      lat,
      height,
      (90 - A) * (Math.PI / 180),
      radius * 1000
    )
    let cartesian = window.XEarth.Cartesian3.fromDegrees(
      Number(point[0]),
      Number(point[1]),
      height
    )
    return cartesian
  }
  /**
   * 生成polygon线性环
   */
  generateHierarchy(lon, lat, height, d1, d2, radius) {
    let that = this
    let list = [Number(lon), Number(lat), Number(height)]
    //获取 航偏角d1 至 航偏角d2 弧段的点位信息
    for (let i = d1; i < d2; i += 1) {
      let point = that.getPointByProjection(
        lon,
        lat,
        height,
        (90 - i) * (Math.PI / 180),
        radius
      )
      list.push(Number(point[0]))
      list.push(Number(point[1]))
      list.push(height)
    }
    list.push(Number(lon))
    list.push(Number(lat))
    list.push(Number(height))
    return window.XEarth.Cartesian3.fromDegreesArrayHeights(list)
  }
  /**
   * @description 根据位置，方位，距离求经纬度
   * @param {int} lon 中心点经度
   * @param {*} lat 中心点纬度
   * @param {*} height 中心点高度
   * @param {*} direction 方向
   * @param {*} radius 半径
   */
  getPointByProjection(lon, lat, height, direction, radius) {
    let that = this
    // 观察点
    let cartesian = window.XEarth.Cartesian3.fromDegrees(lon, lat, height)
    // 世界坐标转为投影坐标
    let webMercatorProjection = new window.XEarth.WebMercatorProjection(
      that._viewer.scene.globe.ellipsoid
    )
    let viewPointWebMercator = webMercatorProjection.project(
      window.XEarth.Cartographic.fromCartesian(cartesian)
    )
    // 计算目标点
    let toPoint = new window.XEarth.Cartesian3(
      viewPointWebMercator.x + radius * Math.cos(direction),
      viewPointWebMercator.y + radius * Math.sin(direction),
      height
    )
    // 投影坐标转为世界坐标
    let cartographic = webMercatorProjection.unproject(toPoint)
    let point = [
      window.XEarth.Math.toDegrees(cartographic.longitude),
      window.XEarth.Math.toDegrees(cartographic.latitude)
    ]
    return point
  }
  /**
   * @description 更新扇形
   * @param {String} id 扇形ID
   * @param {Object} position 中心点位置
   * @param {Object} color 扇形颜色
   * @param {Number} radius 扇形半径
   * @param {Number} angle 扇形角度大小
   */
  updateSector(params) {
    let { id, color, radius, angle } = params
    let entity = this.getEntityById(id)
    if (entity) {
      if (color) {
        entity.polygon.material = color.withAlpha(0.5)
        entity.polygon.outlineColor = color
        entity.customFields.color = color
      }
      if (radius) {
        let customFields = this.getCustomFields(id)
        let pos = this.cartesian2Degrees(customFields.position.getValue())
        let lon = pos.lon
        let lat = pos.lat
        let height = pos.height
        let A = window.XEarth.Math.toDegrees(customFields.heading.getValue()) // 弧度转角度
        let d1 = A - customFields.angle / 2
        let d2 = A + customFields.angle / 2
        entity.polygon.hierarchy = this.generateHierarchy(
          lon,
          lat,
          height,
          d1,
          d2,
          radius
        )
        entity.customFields.radius = radius
        entity.position = this.getLabelPos(lon, lat, height, A, radius)
      }
      if (angle) {
        let customFields = this.getCustomFields(id)
        let pos = this.cartesian2Degrees(customFields.position.getValue())
        let lon = pos.lon
        let lat = pos.lat
        let height = pos.height
        let A = window.XEarth.Math.toDegrees(customFields.heading.getValue()) // 弧度转角度
        let d1 = A - angle / 2
        let d2 = A + angle / 2
        entity.polygon.hierarchy = this.generateHierarchy(
          lon,
          lat,
          height,
          d1,
          d2,
          customFields.radius
        )
        entity.customFields.angle = angle
      }
    }
  }
  // 外部接口 - 动态更新扇形位置（随目标运动）【不改变颜色、半径、角度大小】
  dynamicUpdate(id) {
    const change = (entity) => {
      let pos = this.cartesian2Degrees(entity.customFields.position.getValue())
      let A = window.XEarth.Math.toDegrees(
        entity.customFields.heading.getValue()
      ) // 弧度转角度
      if (pos && A) {
        let lon = pos.lon
        let lat = pos.lat
        let height = pos.height
        let d1 = A - entity.customFields.angle / 2
        let d2 = A + entity.customFields.angle / 2
        entity.polygon.hierarchy = this.generateHierarchy(
          lon,
          lat,
          height,
          d1,
          d2,
          entity.customFields.radius
        )
        entity.position = this.getLabelPos(
          lon,
          lat,
          height,
          A,
          entity.customFields.radius
        )
      } else {
        this._dataSource.entities.remove(entity)
      }
    }
    if (id) {
      let entity = this.getEntityById(id)
      change(entity)
    } else {
      let entities = this.getAllEntities()
      entities.forEach((entity) => {
        change(entity)
      })
    }
  }
  createDynamicPan(params) {
    const that = this
    // 通过圆心（经纬度）、航偏角度d1、d2（d1<d2）、半径
    // d1、d2 可以通过此方法获取：假设当前目标航向角度A，d1 = A - 自定义扇形角度/2；d2 = A + 自定义扇形角度/2；
    let { id, entity, angle, color, radius } = params
    // let A = window.XEarth.Math.toDegrees(heading.getValue()) // 弧度转角度
    let changeH = 0
    function changeHeight() {
      return changeH
    }

    function changeHierarchy() {
      let center = entity.position.getValue(
        window.EarthViewer.clock.currentTime
      )
      let pos = that.cartesian2Degrees(center)
      let ori = entity.orientation.getValue(
        window.EarthViewer.clock.currentTime
      )
      if (!pos || !ori) return
      let mtx3 = window.XEarth.Matrix3.fromQuaternion(ori)
      let mtx4 = window.XEarth.Matrix4.fromRotationTranslation(mtx3, center)
      let hpr = window.XEarth.Transforms.fixedFrameToHeadingPitchRoll(mtx4)
      let headingTemp = hpr.heading
      let A = window.XEarth.Math.toDegrees(headingTemp) + 90 // 弧度转角度
      let d1 = A - angle / 2 // 扇形第一个边的角度
      let d2 = A + angle / 2 // 扇形第二个边的角度
      let { lon, lat, height } = pos
      changeH = height
      let hierarchy = that.generateHierarchy(lon, lat, height, d1, d2, radius)
      return new window.XEarth.PolygonHierarchy(hierarchy)
    }

    window.EarthViewer.entities.add({
      id: id,
      polygon: {
        show: true,
        hierarchy: new window.XEarth.CallbackProperty(
          changeHierarchy,
          false
        ),
        material: color
          ? color.withAlpha(0.3)
          : this._config.color.withAlpha(0.3),
        outline: true,
        height: new window.XEarth.CallbackProperty(changeHeight, false),
        outlineWidth: 2,
        outlineColor: color ? color : this._config.color,
        zIndex: 99
      }
    })
  }
  getEntityById(id) {
    return this._dataSource.entities.getById(id)
  }
  getEntitiesByType(type) {
    return this._dataSource.entities.values.filter(
      (entity) => entity.type === type
    )
  }
  getAllEntities() {
    return this._dataSource.entities.values
  }
  getLength() {
    if (this._dataSource.entities.values) {
      return this._dataSource.entities.values.length
    } else {
      return 0
    }
  }
  getCustomFields(id) {
    let entity = this.getEntityById(id)
    if (entity) {
      return entity.customFields
    } else {
      return {}
    }
  }
  clearById(id) {
    this._dataSource.entities.removeById(id)
  }
  clearByType(type) {
    let entities = this.getEntitiesByType(type)
    entities.forEach((entity) => {
      this._dataSource.entities.remove(entity)
    })
  }
  clearAll() {
    this._dataSource.entities.removeAll()
  }
  // 笛卡尔坐标转经纬度
  cartesian2Degrees(cartesian) {
    if (cartesian) {
      let cartographic =
        this._viewer.scene.globe.ellipsoid.cartesianToCartographic(cartesian)
      let pos = {
        lon: window.XEarth.Math.toDegrees(cartographic.longitude), // 经纬度
        lat: window.XEarth.Math.toDegrees(cartographic.latitude),
        height: cartographic.height
      }
      return pos
    } else {
      return cartesian
    }
  }
}
export default DrawFanShape

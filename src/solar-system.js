/**
 * 太阳系场景构建与运行逻辑
 * 增强版：纹理贴图、太阳辉光粒子、地球云层、明亮星空
 */
import * as THREE from 'three'
import { PLANET_DATA, SUN_RADIUS, SUN_COLOR } from './planets.js'
import {
  createEarthTexture,
  createEarthNormalMap,
  createCloudTexture,
  createSunGlowTexture,
  createJupiterTexture,
  createSaturnTexture,
  createSaturnRingTexture,
  createMarsTexture,
  createMercuryTexture,
  createVenusTexture,
  createUranusTexture,
  createNeptuneTexture,
  createMoonTexture,
} from './textures.js'

export class SolarSystem {
  constructor(scene) {
    this.scene = scene
    this.planets = []
    this.sun = null
    this.sunLight = null
    this.sunGlow = null
    this.sunCorona = null
    this.elapsedDays = 0
    this._createSun()
    this._createPlanets()
    this._createStarfield()
  }

  // ════════════════════════════════════════
  //  太阳
  // ════════════════════════════════════════

  _createSun() {
    // 主球体
    const geo = new THREE.SphereGeometry(SUN_RADIUS, 64, 64)
    const mat = new THREE.MeshBasicMaterial({ color: SUN_COLOR })
    this.sun = new THREE.Mesh(geo, mat)
    this.scene.add(this.sun)

    // 内层辉光球
    const glowGeo = new THREE.SphereGeometry(SUN_RADIUS * 1.2, 32, 32)
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0xffcc66,
      transparent: true,
      opacity: 0.2,
      side: THREE.BackSide,
    })
    const glowMesh = new THREE.Mesh(glowGeo, glowMat)
    this.sun.add(glowMesh)
    this.sunGlowMesh = glowMesh

    // 外层辉光 Sprite (始终面向相机)
    const spriteTex = createSunGlowTexture()
    const spriteMat = new THREE.SpriteMaterial({
      map: spriteTex,
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
    })
    this.sunGlow = new THREE.Sprite(spriteMat)
    this.sunGlow.scale.set(SUN_RADIUS * 8, SUN_RADIUS * 8, 1)
    this.sun.add(this.sunGlow)

    // 日冕粒子
    this._createCorona()

    // 光源
    this.sunLight = new THREE.PointLight(0xffffff, 3.0, 500, 0.4)
    this.sunLight.position.set(0, 0, 0)
    this.scene.add(this.sunLight)

    // 暖色补光
    const warmLight = new THREE.DirectionalLight(0xffcc66, 0.3)
    warmLight.position.set(0, 10, 0)
    this.scene.add(warmLight)

    // 微弱环境光
    const ambient = new THREE.AmbientLight(0x334466, 0.25)
    this.scene.add(ambient)
  }

  _createCorona() {
    const count = 2000
    const positions = new Float32Array(count * 3)
    const sizes = new Float32Array(count)
    const colors = new Float32Array(count * 3)

    for (let i = 0; i < count; i++) {
      const r = SUN_RADIUS * (1.0 + Math.random() * 2.5)
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      positions[i * 3 + 2] = r * Math.cos(phi)
      sizes[i] = 0.1 + Math.random() * 0.6

      const brightness = 0.6 + Math.random() * 0.4
      colors[i * 3] = 1.0
      colors[i * 3 + 1] = 0.7 + brightness * 0.3
      colors[i * 3 + 2] = 0.3 + brightness * 0.2
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1))
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))

    const mat = new THREE.PointsMaterial({
      size: 0.15,
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    })

    this.sunCorona = new THREE.Points(geo, mat)
    this.sun.add(this.sunCorona)
    this.coronaBasePositions = positions.slice()
  }

  // ════════════════════════════════════════
  //  行星
  // ════════════════════════════════════════

  _createPlanets() {
    PLANET_DATA.forEach(data => {
      const orbitGroup = new THREE.Group()
      this.scene.add(orbitGroup)

      const geo = new THREE.SphereGeometry(data.radius, 48, 48)
      const mat = new THREE.MeshStandardMaterial({
        color: data.color,
        roughness: data.roughness ?? 0.6,
        metalness: data.metalness ?? 0.1,
      })

      const mesh = new THREE.Mesh(geo, mat)

      // 轴倾角
      mesh.rotation.z = THREE.MathUtils.degToRad(data.tilt)

      // 纹理
      this._applyTexture(data, mesh, mat)

      mesh.position.x = data.orbitRadius
      orbitGroup.add(mesh)

      // 地球大气层
      if (data.hasAtmosphere) {
        this._createAtmosphere(mesh, data)
      }

      // 地球云层
      if (data.hasClouds) {
        this._createClouds(mesh, data)
      }

      // 土星环
      if (data.hasRing) {
        this._createRing(mesh, data)
      }

      // 卫星（月球绕地球）
      let moonPivot = null, moonMesh = null
      if (data.moon) {
        const result = this._createMoon(orbitGroup, data)
        moonPivot = result.pivot
        moonMesh = result.mesh
      }

      // 轨道线
      this._createOrbitLine(data)

      this.planets.push({
        data,
        mesh,
        orbitGroup,
        angle: Math.random() * Math.PI * 2,
        cloudMesh: data.hasClouds ? mesh.children.find(c => c.userData.isCloud) : null,
        moonPivot,
        moonMesh,
        moonAngle: 0,
      })
    })
  }

  _applyTexture(data, mesh, mat) {
    const texMap = {
      Earth: createEarthTexture(),
      Mercury: createMercuryTexture(),
      Venus: createVenusTexture(),
      Mars: createMarsTexture(),
      Jupiter: createJupiterTexture(),
      Saturn: createSaturnTexture(),
      Uranus: createUranusTexture(),
      Neptune: createNeptuneTexture(),
    }

    const tex = texMap[data.nameEn]
    if (tex) {
      mat.map = tex
      mat.color.setHex(0xffffff) // 纹理自身颜色

      // 法线贴图（仅地球有）
      if (data.nameEn === 'Earth') {
        mat.normalMap = createEarthNormalMap()
        mat.normalScale = new THREE.Vector2(0.3, 0.3)
      }

      mat.needsUpdate = true
    }
  }

  _createAtmosphere(mesh, data) {
    const atmoGeo = new THREE.SphereGeometry(data.radius * 1.08, 48, 48)
    const atmoMat = new THREE.MeshBasicMaterial({
      color: 0x6ba3e8,
      transparent: true,
      opacity: 0.15,
      side: THREE.BackSide,
    })
    const atmo = new THREE.Mesh(atmoGeo, atmoMat)
    mesh.add(atmo)

    // 第二种大气层 — 更外层的柔和辉光
    const outerGeo = new THREE.SphereGeometry(data.radius * 1.2, 32, 32)
    const outerMat = new THREE.MeshBasicMaterial({
      color: 0x88bbff,
      transparent: true,
      opacity: 0.06,
      side: THREE.BackSide,
    })
    const outer = new THREE.Mesh(outerGeo, outerMat)
    mesh.add(outer)
  }

  _createClouds(mesh, data) {
    const cloudGeo = new THREE.SphereGeometry(data.radius * 1.015, 48, 48)
    const cloudMat = new THREE.MeshBasicMaterial({
      map: createCloudTexture(),
      transparent: true,
      opacity: 0.35,
      depthWrite: false,
    })
    const clouds = new THREE.Mesh(cloudGeo, cloudMat)
    clouds.userData.isCloud = true
    mesh.add(clouds)
  }

  _createRing(mesh, data) {
    const ringTex = createSaturnRingTexture()
    const ringGeo = new THREE.RingGeometry(
      data.radius * data.ringInner,
      data.radius * data.ringOuter,
      128
    )
    const ringMat = new THREE.MeshBasicMaterial({
      map: ringTex,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.75,
    })
    const ring = new THREE.Mesh(ringGeo, ringMat)
    ring.rotation.x = Math.PI / 2.4
    mesh.add(ring)

    // 内侧半透明环
    const innerGeo = new THREE.RingGeometry(
      data.radius * (data.ringInner - 0.1),
      data.radius * 1.6,
      64
    )
    const innerMat = new THREE.MeshBasicMaterial({
      color: 0xc8a868,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.2,
    })
    const innerRing = new THREE.Mesh(innerGeo, innerMat)
    innerRing.rotation.x = Math.PI / 2.4
    mesh.add(innerRing)
  }

  _createOrbitLine(data) {
    const curve = new THREE.EllipseCurve(0, 0, data.orbitRadius, data.orbitRadius, 0, 2 * Math.PI, false, 0)
    const points = curve.getPoints(128)
    const lineGeo = new THREE.BufferGeometry().setFromPoints(
      points.map(p => new THREE.Vector3(p.x, 0, p.y))
    )
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x4488aa,
      transparent: true,
      opacity: 0.3,
    })
    const orbitLine = new THREE.Line(lineGeo, lineMat)
    this.scene.add(orbitLine)
  }

  // ════════════════════════════════════════
  //  月球
  // ════════════════════════════════════════

  _createMoon(orbitGroup, data) {
    const moonData = data.moon

    // 月球轨道枢轴 — 位于地球相同位置
    const pivot = new THREE.Group()
    pivot.position.x = data.orbitRadius
    orbitGroup.add(pivot)

    // 月球球体
    const geo = new THREE.SphereGeometry(moonData.radius, 32, 32)
    const mat = new THREE.MeshStandardMaterial({
      roughness: 0.85,
      metalness: 0.05,
    })
    const mesh = new THREE.Mesh(geo, mat)
    mesh.rotation.z = THREE.MathUtils.degToRad(moonData.tilt)
    mesh.position.x = moonData.orbitRadius

    // 月球纹理
    mat.map = createMoonTexture()
    mat.color.setHex(0xffffff)
    mat.needsUpdate = true

    pivot.add(mesh)

    // 月球轨道线（绕地球的小圆环）
    const curve = new THREE.EllipseCurve(
      0, 0, moonData.orbitRadius, moonData.orbitRadius, 0, 2 * Math.PI, false, 0,
    )
    const pts = curve.getPoints(64)
    const lineGeo = new THREE.BufferGeometry().setFromPoints(
      pts.map(p => new THREE.Vector3(p.x, 0, p.y)),
    )
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x88aacc,
      transparent: true,
      opacity: 0.2,
    })
    const orbitLine = new THREE.Line(lineGeo, lineMat)
    pivot.add(orbitLine)

    return { pivot, mesh }
  }

  // ════════════════════════════════════════
  //  星空
  // ════════════════════════════════════════

  _createStarfield() {
    const count = 6000
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    const sizes = new Float32Array(count)

    for (let i = 0; i < count; i++) {
      const r = 300 + Math.random() * 800
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      positions[i * 3 + 2] = r * Math.cos(phi)

      sizes[i] = 0.3 + Math.random() * 1.2

      // 恒星颜色 — 混合白色、淡蓝、淡黄、微红
      const starType = Math.random()
      let rCol, gCol, bCol
      if (starType < 0.5) {
        // 白/淡黄
        const bri = 0.7 + Math.random() * 0.3
        rCol = bri; gCol = bri * 0.95; bCol = bri * 0.85
      } else if (starType < 0.75) {
        // 淡蓝
        const bri = 0.6 + Math.random() * 0.4
        rCol = bri * 0.7; gCol = bri * 0.8; bCol = bri
      } else if (starType < 0.9) {
        // 暖黄/橙
        const bri = 0.7 + Math.random() * 0.3
        rCol = bri; gCol = bri * 0.8; bCol = bri * 0.5
      } else {
        // 红矮星
        const bri = 0.5 + Math.random() * 0.3
        rCol = bri; gCol = bri * 0.5; bCol = bri * 0.3
      }

      colors[i * 3] = rCol
      colors[i * 3 + 1] = gCol
      colors[i * 3 + 2] = bCol
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1))

    const mat = new THREE.PointsMaterial({
      size: 0.5,
      vertexColors: true,
      transparent: true,
      opacity: 0.95,
      sizeAttenuation: true,
    })

    const stars = new THREE.Points(geo, mat)
    this.scene.add(stars)
  }

  // ════════════════════════════════════════
  //  更新循环
  // ════════════════════════════════════════

  update(deltaSeconds, speed) {
    const daysPerSecond = 6 * speed
    const deltaDays = deltaSeconds * daysPerSecond
    this.elapsedDays += deltaDays

    // 太阳脉动
    this._updateSun(deltaSeconds)

    // 行星运动
    this.planets.forEach(p => {
      const { data, orbitGroup, mesh } = p

      // 公转
      p.angle += (deltaDays / data.orbitPeriod) * Math.PI * 2
      orbitGroup.rotation.y = p.angle

      // 自转
      if (data.rotationPeriod !== 0) {
        const rotSpeed = (deltaDays / Math.abs(data.rotationPeriod)) * Math.PI * 2
        mesh.rotation.y += data.rotationPeriod > 0 ? rotSpeed : -rotSpeed

        // 云层独立慢速旋转
        if (p.cloudMesh) {
          p.cloudMesh.rotation.y += rotSpeed * 0.6
        }
      }

      // 月球公转（绕地球）
      if (p.moonPivot && data.moon) {
        p.moonAngle += (deltaDays / data.moon.orbitPeriod) * Math.PI * 2
        p.moonPivot.rotation.y = p.moonAngle

        // 潮汐锁定 — 月球自转周期等于公转周期
        if (p.moonMesh) {
          p.moonMesh.rotation.y += (deltaDays / data.moon.orbitPeriod) * Math.PI * 2
        }
      }
    })
  }

  _updateSun(deltaSeconds) {
    // 脉动辉光透明度
    if (this.sunGlowMesh) {
      const pulse = 0.15 + 0.08 * Math.sin(this.elapsedDays * 0.5)
      this.sunGlowMesh.material.opacity = pulse
    }

    // 日冕粒子动画
    if (this.sunCorona) {
      const pos = this.sunCorona.geometry.attributes.position
      const array = pos.array
      const base = this.coronaBasePositions
      const time = this.elapsedDays * 0.3

      for (let i = 0; i < array.length; i += 3) {
        const idx = i / 3
        // 轻微径向脉动
        const pulseFac = 1 + 0.08 * Math.sin(time + idx * 0.1)
        array[i] = base[i] * pulseFac
        array[i + 1] = base[i + 1] * pulseFac
        array[i + 2] = base[i + 2] * pulseFac
      }
      pos.needsUpdate = true
    }
  }

  getPlanetMesh(nameEn) {
    const found = this.planets.find(p => p.data.nameEn === nameEn)
    return found ? found.mesh : null
  }
}

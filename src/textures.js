/**
 * 程序化纹理生成器
 * 使用 Canvas 2D 为所有行星生成纹理，无需外部图片
 */
import * as THREE from 'three'

// ─── 坐标工具 ───

function ll2x(lng, w) { return (lng + 180) / 360 * w }
function ll2y(lat, h) { return (90 - lat) / 180 * h }

/** 在经纬度位置画椭圆斑块 */
function blob(ctx, lat, lng, wDeg, hDeg, color, rot, W, H) {
  const cx = ll2x(lng, W)
  const cy = ll2y(lat, H)
  const rx = wDeg / 360 * W / 2
  const ry = hDeg / 180 * H / 2
  ctx.save()
  ctx.translate(cx, cy)
  ctx.rotate(rot || 0)
  ctx.beginPath()
  ctx.ellipse(0, 0, Math.max(rx, 1), Math.max(ry, 1), 0, 0, Math.PI * 2)
  ctx.fillStyle = color
  ctx.fill()
  ctx.restore()
}

/** 种子随机 (mulberry32) */
function mulberry32(a) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0
    let t = Math.imul(a ^ a >>> 15, 1 | a)
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t
    return ((t ^ t >>> 14) >>> 0) / 4294967296
  }
}

// ─── 通用噪声辅助 ───

function addNoise(ctx, W, H, intensity, alpha, seed = 42) {
  const rng = mulberry32(seed)
  const img = ctx.getImageData(0, 0, W, H)
  for (let i = 0; i < img.data.length; i += 4) {
    const n = (rng() - 0.5) * intensity * 255
    img.data[i]     = Math.min(255, Math.max(0, img.data[i] + n))
    img.data[i + 1] = Math.min(255, Math.max(0, img.data[i + 1] + n))
    img.data[i + 2] = Math.min(255, Math.max(0, img.data[i + 2] + n))
  }
  ctx.putImageData(img, 0, 0)
}

// ══════════════════════════════════════════════════════
//  地球纹理
// ══════════════════════════════════════════════════════

export function createEarthTexture() {
  const W = 2048, H = 1024
  const c = document.createElement('canvas')
  c.width = W; c.height = H
  const ctx = c.getContext('2d')

  // ── 海洋渐变 ──
  for (let y = 0; y < H; y++) {
    const lat = 90 - y / H * 180
    const f = Math.abs(lat) / 90
    const r = 8 + 25 * f
    const g = 40 + 80 * (1 - f * 0.6)
    const b = 90 + 120 * (1 - f * 0.5)
    ctx.fillStyle = `rgb(${r|0},${g|0},${b|0})`
    ctx.fillRect(0, y, W, 1)
  }

  // ── 陆地颜色 ──
  function landColor(lat) {
    const a = Math.abs(lat)
    if (a > 72) return '#e0e8f0'
    if (a > 60) return '#7a9a6a'
    if (a > 45) return '#5a8a4a'
    if (a > 30) return '#6a9a52'
    if (a > 15) return '#7aaa5a'
    return '#5a8a3a'
  }

  // ── 大陆定义 [lat, lng, wDeg, hDeg, rot] ──
  const landmasses = [
    // 北美洲
    [55, -110, 30, 16, 0],     [48, -100, 22, 12, 0],
    [62, -140, 12, 6, -0.3],   [28, -82, 4, 6, 0.5],
    [20, -98, 6, 12, 0.2],     [58, -130, 8, 4, -0.2],
    [52, -68, 4, 6, 0],        [45, -74, 3, 8, 0.3],
    // 格陵兰
    [74, -42, 8, 12, 0.1],
    // 南美洲
    [-15, -60, 14, 40, 0.05],  [-8, -50, 9, 10, 0.3],
    [-32, -58, 5, 8, -0.2],    [-50, -70, 4, 8, 0],
    // 欧洲
    [50, 10, 12, 12, 0],       [62, 16, 4, 8, 0.3],
    [55, -3, 3, 5, 0],         [40, -4, 4, 5, 0],
    [46, 8, 3, 4, 0.2],        [42, 12, 3, 5, 0],
    // 非洲
    [5, 22, 18, 58, 0],        [-20, 48, 3, 8, 0.2],
    [10, 42, 4, 8, 0],         [-30, 28, 3, 6, 0],
    // 亚洲
    [50, 90, 45, 35, 0],       [20, 78, 9, 12, 0],
    [10, 105, 12, 12, 0],      [38, 138, 3, 10, 0.2],
    [28, 42, 6, 12, 0],        [55, 130, 8, 10, 0],
    [65, 100, 12, 8, 0],       [45, 130, 5, 8, 0.2],
    [30, 48, 4, 6, 0.3],        [40, 68, 4, 6, 0],
    // 澳大利亚
    [-25, 134, 12, 14, 0.2],
    // 南极洲
    [-82, 0, 80, 10, 0],
  ]

  landmasses.forEach(([lat, lng, w, h, r]) => {
    blob(ctx, lat, lng, w, h, landColor(lat), r, W, H)
  })

  // ── 沙漠带 (撒哈拉, 阿拉伯) ──
  blob(ctx, 25, 35, 18, 10, 0, '#c8b080', W, H)
  blob(ctx, 22, 45, 10, 8, 0, '#d4c090', W, H)
  blob(ctx, 20, 22, 15, 8, 0, '#d0b888', W, H)
  blob(ctx, -25, 120, 6, 6, 0.2, '#c8a868', W, H)

  // ── 极地冰盖 ──
  for (let y = 0; y < H * 0.04; y++) {
    const t = y / (H * 0.04)
    ctx.fillStyle = `rgba(220,230,245,${1 - t * 0.5})`
    ctx.fillRect(0, y, W, 1)
    ctx.fillStyle = `rgba(220,230,245,${1 - t * 0.5})`
    ctx.fillRect(0, H - 1 - y, W, 1)
  }

  // ── 海岸线加深 ──
  addNoise(ctx, W, H, 0.03, 0.5, 99)

  const tex = new THREE.CanvasTexture(c)
  tex.wrapS = THREE.RepeatWrapping
  tex.wrapT = THREE.ClampToEdgeWrapping
  tex.anisotropy = 4
  return tex
}

// ─── 地球法线贴图 ───

export function createEarthNormalMap() {
  const W = 1024, H = 512
  const c = document.createElement('canvas')
  c.width = W; c.height = H
  const ctx = c.getContext('2d')

  // 中立法线 (128,128,255)
  ctx.fillStyle = '#8080ff'
  ctx.fillRect(0, 0, W, H)

  // 在陆地位置增加法线扰动
  const features = [
    [45, -100, 25, 12], [-15, -60, 14, 40], [5, 22, 18, 58],
    [50, 90, 45, 35], [-25, 134, 12, 14], [50, 10, 12, 12],
  ]
  features.forEach(([lat, lng, w, h]) => {
    const cx = ll2x(lng, W), cy = ll2y(lat, H)
    const rx = w / 360 * W / 2, ry = h / 180 * H / 2
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(rx, ry))
    grad.addColorStop(0, '#a0a0ff')
    grad.addColorStop(0.6, '#9090ff')
    grad.addColorStop(1, '#8080ff')
    ctx.fillStyle = grad
    ctx.beginPath()
    ctx.ellipse(cx, cy, Math.max(rx, 1), Math.max(ry, 1), 0, 0, Math.PI * 2)
    ctx.fill()
  })

  const tex = new THREE.CanvasTexture(c)
  tex.wrapS = THREE.RepeatWrapping
  tex.wrapT = THREE.ClampToEdgeWrapping
  return tex
}

// ─── 地球云层纹理 ───

export function createCloudTexture() {
  const W = 1024, H = 512
  const c = document.createElement('canvas')
  c.width = W; c.height = H
  const ctx = c.getContext('2d')

  ctx.fillStyle = 'rgba(0,0,0,0)'
  ctx.fillRect(0, 0, W, H)

  const rng = mulberry32(42)
  // 随机云团
  for (let i = 0; i < 200; i++) {
    const x = rng() * W, y = rng() * H
    const rx = 10 + rng() * 80
    const ry = 5 + rng() * 30
    const opacity = 0.08 + rng() * 0.25
    const grad = ctx.createRadialGradient(x, y, 0, x, y, Math.max(rx, ry))
    grad.addColorStop(0, `rgba(255,255,255,${opacity})`)
    grad.addColorStop(0.5, `rgba(255,255,255,${opacity * 0.6})`)
    grad.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = grad
    ctx.beginPath()
    ctx.ellipse(x, y, rx, ry, rng() * Math.PI, 0, Math.PI * 2)
    ctx.fill()
  }

  // 带状云系
  for (let i = 0; i < 30; i++) {
    const y = rng() * H
    const h = 5 + rng() * 25
    const opacity = 0.05 + rng() * 0.12
    ctx.fillStyle = `rgba(255,255,255,${opacity})`
    ctx.fillRect(0, y, W, h)
  }

  const tex = new THREE.CanvasTexture(c)
  tex.wrapS = THREE.RepeatWrapping
  tex.wrapT = THREE.ClampToEdgeWrapping
  return tex
}

// ══════════════════════════════════════════════════════
//  太阳辉光粒子纹理
// ══════════════════════════════════════════════════════

export function createSunGlowTexture() {
  const size = 256
  const c = document.createElement('canvas')
  c.width = size; c.height = size
  const ctx = c.getContext('2d')

  const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  grad.addColorStop(0, 'rgba(255,220,150,1)')
  grad.addColorStop(0.1, 'rgba(255,200,100,0.8)')
  grad.addColorStop(0.3, 'rgba(255,180,80,0.4)')
  grad.addColorStop(0.5, 'rgba(255,160,60,0.15)')
  grad.addColorStop(1, 'rgba(255,120,40,0)')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, size, size)

  const tex = new THREE.CanvasTexture(c)
  return tex
}

// ══════════════════════════════════════════════════════
//  木星纹理 — 云带
// ══════════════════════════════════════════════════════

export function createJupiterTexture() {
  const W = 1024, H = 512
  const c = document.createElement('canvas')
  c.width = W; c.height = H
  const ctx = c.getContext('2d')
  const rng = mulberry32(1)

  // 基础底色
  ctx.fillStyle = '#d4a86a'
  ctx.fillRect(0, 0, W, H)

  // 水平云带
  const bands = [
    { y: 0.0, h: 0.06, color: '#c89858' },
    { y: 0.06, h: 0.04, color: '#e8d4a8' },
    { y: 0.10, h: 0.05, color: '#b88850' },
    { y: 0.15, h: 0.03, color: '#d4b880' },
    { y: 0.18, h: 0.06, color: '#c8a060' },
    { y: 0.24, h: 0.04, color: '#e8d0a0' },
    { y: 0.28, h: 0.07, color: '#b08048' },
    // 大红斑区域
    { y: 0.32, h: 0.08, color: '#c88058' },
    { y: 0.38, h: 0.05, color: '#d4b880' },
    { y: 0.43, h: 0.04, color: '#b88850' },
    { y: 0.47, h: 0.06, color: '#d4a868' },
    { y: 0.53, h: 0.04, color: '#e0c890' },
    { y: 0.57, h: 0.07, color: '#b88048' },
    { y: 0.64, h: 0.04, color: '#d0b078' },
    { y: 0.68, h: 0.06, color: '#c09858' },
    { y: 0.74, h: 0.04, color: '#e0c898' },
    { y: 0.78, h: 0.05, color: '#b88850' },
    { y: 0.83, h: 0.04, color: '#d4b880' },
    { y: 0.87, h: 0.06, color: '#c8a060' },
    { y: 0.93, h: 0.04, color: '#e0c890' },
    { y: 0.97, h: 0.03, color: '#b08048' },
  ]

  bands.forEach(b => {
    const y0 = b.y * H, h0 = b.h * H
    // 基础色块
    ctx.fillStyle = b.color
    ctx.fillRect(0, y0, W, h0)
    // 带内噪声渐变
    const yOff = rng() * h0 * 0.3
    for (let x = 0; x < W; x += 4) {
      const bright = (rng() - 0.5) * 20
      ctx.fillStyle = `rgba(${bright > 0 ? 255 : 0},${bright > 0 ? 255 : 0},${bright > 0 ? 255 : 0},${Math.abs(bright) / 255})`
      ctx.fillRect(x, y0 + (rng() * h0 * 0.8 + yOff) | 0, 3, 1)
    }
  })

  // 大红斑
  const spotY = 0.35 * H, spotX = 0.55 * W
  const grad = ctx.createRadialGradient(spotX, spotY, 0, spotX, spotY, 25)
  grad.addColorStop(0, '#d06040')
  grad.addColorStop(0.4, '#c05038')
  grad.addColorStop(0.7, '#b04830')
  grad.addColorStop(1, '#c8a060')
  ctx.fillStyle = grad
  ctx.beginPath()
  ctx.ellipse(spotX, spotY, 25, 15, 0.1, 0, Math.PI * 2)
  ctx.fill()

  const tex = new THREE.CanvasTexture(c)
  tex.wrapS = THREE.RepeatWrapping
  tex.wrapT = THREE.ClampToEdgeWrapping
  return tex
}

// ══════════════════════════════════════════════════════
//  土星纹理 — 暖色云带
// ══════════════════════════════════════════════════════

export function createSaturnTexture() {
  const W = 1024, H = 512
  const c = document.createElement('canvas')
  c.width = W; c.height = H
  const ctx = c.getContext('2d')

  ctx.fillStyle = '#d4c090'
  ctx.fillRect(0, 0, W, H)

  const bands = [
    { y: 0.0, h: 0.05, color: '#c8b888' },
    { y: 0.05, h: 0.04, color: '#e0d4b0' },
    { y: 0.09, h: 0.06, color: '#c0a878' },
    { y: 0.15, h: 0.04, color: '#d8c8a0' },
    { y: 0.19, h: 0.07, color: '#c8b080' },
    { y: 0.26, h: 0.05, color: '#dec8a0' },
    { y: 0.31, h: 0.08, color: '#b8a070' },
    { y: 0.39, h: 0.05, color: '#d8c8a0' },
    { y: 0.44, h: 0.07, color: '#c8b080' },
    { y: 0.51, h: 0.05, color: '#e0d4b0' },
    { y: 0.56, h: 0.06, color: '#c0a878' },
    { y: 0.62, h: 0.04, color: '#d8c8a0' },
    { y: 0.66, h: 0.08, color: '#c8b080' },
    { y: 0.74, h: 0.05, color: '#dec8a0' },
    { y: 0.79, h: 0.06, color: '#b8a070' },
    { y: 0.85, h: 0.05, color: '#d8c8a0' },
    { y: 0.90, h: 0.05, color: '#c0a878' },
    { y: 0.95, h: 0.05, color: '#e0d4b0' },
  ]

  bands.forEach(b => {
    const y0 = b.y * H, h0 = b.h * H
    ctx.fillStyle = b.color
    ctx.fillRect(0, y0, W, h0)
  })

  // 轻微干扰
  addNoise(ctx, W, H, 0.02, 0.3, 77)

  const tex = new THREE.CanvasTexture(c)
  tex.wrapS = THREE.RepeatWrapping
  tex.wrapT = THREE.ClampToEdgeWrapping
  return tex
}

// ══════════════════════════════════════════════════════
//  土星环纹理
// ══════════════════════════════════════════════════════

export function createSaturnRingTexture() {
  const W = 1024, H = 64
  const c = document.createElement('canvas')
  c.width = W; c.height = H
  const ctx = c.getContext('2d')

  // 带状结构
  for (let x = 0; x < W; x++) {
    const t = x / W
    let gray = 160 + 60 * Math.sin(t * 30) * Math.sin(t * 17)
    gray += 40 * Math.sin(t * 60)
    gray = Math.min(220, Math.max(100, gray))
    // 颜色：暖金色到冷银的渐变
    const r = gray + 10
    const g = gray + 5
    const b = gray - 20 + 40 * Math.sin(t * 12)
    ctx.fillStyle = `rgb(${r|0},${g|0},${b|0})`
    ctx.fillRect(x, 0, 1, H)
  }

  // 卡西尼缝
  ctx.fillStyle = 'rgba(0,0,0,0.4)'
  ctx.fillRect(W * 0.58, 0, W * 0.02, H)

  const tex = new THREE.CanvasTexture(c)
  tex.wrapS = THREE.RepeatWrapping
  tex.wrapT = THREE.ClampToEdgeWrapping
  return tex
}

// ══════════════════════════════════════════════════════
//  火星纹理
// ══════════════════════════════════════════════════════

export function createMarsTexture() {
  const W = 1024, H = 512
  const c = document.createElement('canvas')
  c.width = W; c.height = H
  const ctx = c.getContext('2d')
  const rng = mulberry32(13)

  // 底色
  ctx.fillStyle = '#c06030'
  ctx.fillRect(0, 0, W, H)

  // 暗色高地 (南半球)
  for (let i = 0; i < 80; i++) {
    const x = rng() * W, y = H * 0.5 + rng() * H * 0.45
    const rx = 10 + rng() * 60, ry = 5 + rng() * 30
    const dark = Math.floor(40 + rng() * 60)
    ctx.fillStyle = `rgba(${dark},${dark * 0.6},${dark * 0.4},0.5)`
    ctx.beginPath()
    ctx.ellipse(x, y, rx, ry, rng() * 0.5, 0, Math.PI * 2)
    ctx.fill()
  }

  // 亮色区域 (北半球)
  for (let i = 0; i < 40; i++) {
    const x = rng() * W, y = rng() * H * 0.4
    const rx = 10 + rng() * 40, ry = 5 + rng() * 20
    ctx.fillStyle = `rgba(220,160,100,0.3)`
    ctx.beginPath()
    ctx.ellipse(x, y, rx, ry, rng() * 0.3, 0, Math.PI * 2)
    ctx.fill()
  }

  // 极冠 (白色)
  for (let y = 0; y < H * 0.03; y++) {
    const t = y / (H * 0.03)
    ctx.fillStyle = `rgba(220,215,210,${1 - t})`
    ctx.fillRect(0, y, W, 1)
    ctx.fillStyle = `rgba(220,215,210,${1 - t})`
    ctx.fillRect(0, H - 1 - y, W, 1)
  }

  // 陨石坑
  for (let i = 0; i < 30; i++) {
    const x = rng() * W, y = rng() * H
    const r = 2 + rng() * 8
    ctx.fillStyle = `rgba(80,50,30,${0.3 + rng() * 0.4})`
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = `rgba(180,120,80,${0.2 + rng() * 0.3})`
    ctx.beginPath()
    ctx.arc(x - r * 0.3, y - r * 0.3, r * 0.9, 0, Math.PI * 2)
    ctx.fill()
  }

  addNoise(ctx, W, H, 0.04, 0.5, 13)

  const tex = new THREE.CanvasTexture(c)
  tex.wrapS = THREE.RepeatWrapping
  tex.wrapT = THREE.ClampToEdgeWrapping
  return tex
}

// ══════════════════════════════════════════════════════
//  水星纹理
// ══════════════════════════════════════════════════════

export function createMercuryTexture() {
  const W = 1024, H = 512
  const c = document.createElement('canvas')
  c.width = W; c.height = H
  const ctx = c.getContext('2d')
  const rng = mulberry32(7)

  ctx.fillStyle = '#a0a0a0'
  ctx.fillRect(0, 0, W, H)

  // 陨石坑
  for (let i = 0; i < 150; i++) {
    const x = rng() * W, y = rng() * H
    const r = 2 + rng() * 20
    const dark = Math.floor(60 + rng() * 60)
    ctx.fillStyle = `rgba(${dark},${dark},${dark},0.5)`
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fill()
    // 环形山边缘高光
    ctx.fillStyle = `rgba(200,200,200,${0.1 + rng() * 0.2})`
    ctx.beginPath()
    ctx.arc(x - r * 0.2, y - r * 0.2, r * 1.1, 0, Math.PI * 2)
    ctx.fill()
  }

  // 大型盆地 (卡洛里盆地)
  ctx.fillStyle = 'rgba(80,80,85,0.3)'
  ctx.beginPath()
  ctx.ellipse(W * 0.7, H * 0.4, 40, 30, 0.2, 0, Math.PI * 2)
  ctx.fill()

  addNoise(ctx, W, H, 0.06, 0.5, 7)

  const tex = new THREE.CanvasTexture(c)
  tex.wrapS = THREE.RepeatWrapping
  tex.wrapT = THREE.ClampToEdgeWrapping
  return tex
}

// ══════════════════════════════════════════════════════
//  金星纹理
// ══════════════════════════════════════════════════════

export function createVenusTexture() {
  const W = 1024, H = 512
  const c = document.createElement('canvas')
  c.width = W; c.height = H
  const ctx = c.getContext('2d')
  const rng = mulberry32(23)

  // 底色 — 淡黄色
  ctx.fillStyle = '#d4b888'
  ctx.fillRect(0, 0, W, H)

  // 旋转云层纹理
  for (let i = 0; i < 200; i++) {
    const x = rng() * W, y = rng() * H
    const rx = 20 + rng() * 80
    const ry = 5 + rng() * 15
    const bright = 20 + rng() * 40
    const dir = rng() > 0.5 ? 1 : -1
    ctx.fillStyle = `rgba(${180 + bright},${160 + bright * 0.7},${120 + bright * 0.3},${0.05 + rng() * 0.15})`
    ctx.beginPath()
    ctx.ellipse(x + dir * ry * 0.5, y, rx, ry, 0.1 * dir, 0, Math.PI * 2)
    ctx.fill()
  }

  // 暗色漩涡特征
  for (let i = 0; i < 15; i++) {
    const x = rng() * W, y = rng() * H
    const rx = 15 + rng() * 40, ry = 5 + rng() * 15
    ctx.fillStyle = `rgba(160,130,80,${0.08 + rng() * 0.1})`
    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(rng() * 0.5)
    ctx.beginPath()
    ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }

  const tex = new THREE.CanvasTexture(c)
  tex.wrapS = THREE.RepeatWrapping
  tex.wrapT = THREE.ClampToEdgeWrapping
  return tex
}

// ══════════════════════════════════════════════════════
// ══════════════════════════════════════════════════════
//  月球纹理 — 灰色多坑表面
// ══════════════════════════════════════════════════════

export function createMoonTexture() {
  const W = 1024, H = 512
  const c = document.createElement('canvas')
  c.width = W; c.height = H
  const ctx = c.getContext('2d')
  const rng = mulberry32(31)

  // 灰色基底
  ctx.fillStyle = '#b0b0b0'
  ctx.fillRect(0, 0, W, H)

  // 较亮/较暗区域（月海 + 高地）
  for (let i = 0; i < 80; i++) {
    const x = rng() * W, y = rng() * H
    const rx = 10 + rng() * 50, ry = 5 + rng() * 35
    const bright = Math.floor(80 + rng() * 80)
    ctx.fillStyle = `rgba(${bright},${bright},${bright},${0.15 + rng() * 0.35})`
    ctx.beginPath()
    ctx.ellipse(x, y, rx, ry, rng() * 0.5, 0, Math.PI * 2)
    ctx.fill()
  }

  // 大型月海（暗色区域）
  const maria = [
    [0.48, 0.45, 35, 30],  // 雨海
    [0.52, 0.52, 25, 22],  // 云海
    [0.55, 0.48, 20, 18],  // 静海
    [0.44, 0.48, 18, 20],  // 风暴洋（部分）
    [0.50, 0.42, 15, 14],  // 澄海
    [0.56, 0.56, 15, 12],  // 丰富海
    [0.46, 0.56, 12, 10],  // 湿海
  ]
  maria.forEach(([x, y, rx, ry]) => {
    const cx = x * W, cy = y * H
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(rx, ry))
    grad.addColorStop(0, 'rgba(60,60,65,0.5)')
    grad.addColorStop(0.6, 'rgba(80,80,88,0.35)')
    grad.addColorStop(1, 'rgba(176,176,176,0)')
    ctx.fillStyle = grad
    ctx.beginPath()
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2)
    ctx.fill()
  })

  // 大量陨石坑
  for (let i = 0; i < 200; i++) {
    const x = rng() * W, y = rng() * H
    const r = 1 + rng() * 12
    const dark = Math.floor(70 + rng() * 60)
    ctx.fillStyle = `rgba(${dark},${dark},${dark},0.5)`
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fill()
    // 环形山边缘高光
    ctx.fillStyle = `rgba(220,220,220,${0.1 + rng() * 0.2})`
    ctx.beginPath()
    ctx.arc(x - r * 0.2, y - r * 0.2, r * 1.05, 0, Math.PI * 2)
    ctx.fill()
  }

  // 第谷环形山（辐射纹）
  const tychoX = 0.82 * W, tychoY = 0.78 * H
  ctx.fillStyle = 'rgba(180,180,180,0.4)'
  ctx.beginPath()
  ctx.arc(tychoX, tychoY, 5, 0, Math.PI * 2)
  ctx.fill()
  for (let i = 0; i < 12; i++) {
    const angle = rng() * Math.PI * 2
    const len = 20 + rng() * 50
    ctx.strokeStyle = `rgba(200,200,200,${0.08 + rng() * 0.12})`
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(tychoX, tychoY)
    ctx.lineTo(tychoX + Math.cos(angle) * len, tychoY + Math.sin(angle) * len)
    ctx.stroke()
  }

  addNoise(ctx, W, H, 0.03, 0.5, 31)

  const tex = new THREE.CanvasTexture(c)
  tex.wrapS = THREE.RepeatWrapping
  tex.wrapT = THREE.ClampToEdgeWrapping
  return tex
}

// ══════════════════════════════════════════════════════
//  天王星纹理
// ══════════════════════════════════════════════════════

export function createUranusTexture() {
  const W = 1024, H = 512
  const c = document.createElement('canvas')
  c.width = W; c.height = H
  const ctx = c.getContext('2d')

  ctx.fillStyle = '#8fc4e8'
  ctx.fillRect(0, 0, W, H)

  // 微弱水平带
  for (let y = 0; y < H; y++) {
    const t = y / H
    const variation = 15 * Math.sin(t * 18) + 8 * Math.sin(t * 35)
    ctx.fillStyle = `rgb(${143 + variation|0},${196 + variation * 0.5|0},${232 + variation * 0.3|0})`
    ctx.fillRect(0, y, W, 1)
  }

  const tex = new THREE.CanvasTexture(c)
  tex.wrapS = THREE.RepeatWrapping
  tex.wrapT = THREE.ClampToEdgeWrapping
  return tex
}

// ══════════════════════════════════════════════════════
//  海王星纹理
// ══════════════════════════════════════════════════════

export function createNeptuneTexture() {
  const W = 1024, H = 512
  const c = document.createElement('canvas')
  c.width = W; c.height = H
  const ctx = c.getContext('2d')

  ctx.fillStyle = '#335588'
  ctx.fillRect(0, 0, W, H)

  for (let y = 0; y < H; y++) {
    const t = y / H
    const variation = 20 * Math.sin(t * 12) + 10 * Math.sin(t * 28)
    ctx.fillStyle = `rgb(${51 + variation|0},${85 + variation * 0.7|0},${136 + variation|0})`
    ctx.fillRect(0, y, W, 1)
  }

  // 大暗斑
  const dSpotX = 0.6 * W, dSpotY = 0.4 * H
  const grad = ctx.createRadialGradient(dSpotX, dSpotY, 0, dSpotX, dSpotY, 30)
  grad.addColorStop(0, 'rgba(20,30,60,0.6)')
  grad.addColorStop(0.5, 'rgba(30,50,80,0.4)')
  grad.addColorStop(1, 'rgba(51,85,136,0)')
  ctx.fillStyle = grad
  ctx.beginPath()
  ctx.ellipse(dSpotX, dSpotY, 30, 18, 0.2, 0, Math.PI * 2)
  ctx.fill()

  // 亮斑
  const bSpotX = 0.3 * W, bSpotY = 0.65 * H
  const grad2 = ctx.createRadialGradient(bSpotX, bSpotY, 0, bSpotX, bSpotY, 20)
  grad2.addColorStop(0, 'rgba(180,210,240,0.4)')
  grad2.addColorStop(1, 'rgba(51,85,136,0)')
  ctx.fillStyle = grad2
  ctx.beginPath()
  ctx.ellipse(bSpotX, bSpotY, 20, 12, -0.1, 0, Math.PI * 2)
  ctx.fill()

  const tex = new THREE.CanvasTexture(c)
  tex.wrapS = THREE.RepeatWrapping
  tex.wrapT = THREE.ClampToEdgeWrapping
  return tex
}

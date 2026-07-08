/**
 * 3D 逼真手掌模型 —— 从下方托举太阳系
 * 4096×4096 高清纹理：生命线、智慧线、感情线 + 指纹 + 皮肤细节
 * 3 段式手指关节 + 指甲
 */
import * as THREE from 'three'

// ══════════════════════════════════════════════════════
//  工具函数
// ══════════════════════════════════════════════════════

/** 种子随机 (mulberry32) */
function mulberry32(a) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0
    let t = Math.imul(a ^ a >>> 15, 1 | a)
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t
    return ((t ^ t >>> 14) >>> 0) / 4294967296
  }
}

/** 将高斯噪声写入 ImageData */
function addGrain(imgData, intensity, rng) {
  const d = imgData.data
  for (let i = 0; i < d.length; i += 4) {
    const n = (rng() - 0.5) * intensity
    d[i] = Math.min(255, Math.max(0, d[i] + n))
    d[i + 1] = Math.min(255, Math.max(0, d[i + 1] + n))
    d[i + 2] = Math.min(255, Math.max(0, d[i + 2] + n))
  }
}

// ══════════════════════════════════════════════════════
//  手掌纹理（4096×4096 超高清）
// ══════════════════════════════════════════════════════

export function createPalmTexture() {
  const W = 4096, H = 4096
  const c = document.createElement('canvas')
  c.width = W; c.height = H
  const ctx = c.getContext('2d')
  const rng = mulberry32(2026)

  // ================================================
  //  1. 肤色基底
  // ================================================

  // 掌心辐射渐变（中心亮，边缘暗）
  const baseGrad = ctx.createRadialGradient(W * 0.48, H * 0.42, 0, W * 0.48, H * 0.42, W * 0.85)
  baseGrad.addColorStop(0, '#f8d6c4')
  baseGrad.addColorStop(0.15, '#f5cfba')
  baseGrad.addColorStop(0.35, '#efc4ae')
  baseGrad.addColorStop(0.55, '#e5b8a0')
  baseGrad.addColorStop(0.75, '#d8a88e')
  baseGrad.addColorStop(0.90, '#c8947a')
  baseGrad.addColorStop(1, '#b88068')
  ctx.fillStyle = baseGrad
  ctx.fillRect(0, 0, W, H)

  // ================================================
  //  2. 皮肤血管+红润区域
  // ================================================

  // 大鱼际（拇指球）红润
  const thenar = ctx.createRadialGradient(W * 0.20, H * 0.52, 0, W * 0.20, H * 0.52, W * 0.32)
  thenar.addColorStop(0, 'rgba(225,155,130,0.40)')
  thenar.addColorStop(0.3, 'rgba(210,145,120,0.22)')
  thenar.addColorStop(0.6, 'rgba(200,140,115,0.08)')
  thenar.addColorStop(1, 'rgba(200,140,115,0)')
  ctx.fillStyle = thenar
  ctx.beginPath()
  ctx.ellipse(W * 0.20, H * 0.52, W * 0.32, H * 0.35, -0.3, 0, Math.PI * 2)
  ctx.fill()

  // 小鱼际（小指根）
  const hypoT = ctx.createRadialGradient(W * 0.82, H * 0.60, 0, W * 0.82, H * 0.60, W * 0.22)
  hypoT.addColorStop(0, 'rgba(210,150,128,0.30)')
  hypoT.addColorStop(0.5, 'rgba(200,145,125,0.12)')
  hypoT.addColorStop(1, 'rgba(200,145,125,0)')
  ctx.fillStyle = hypoT
  ctx.beginPath()
  ctx.ellipse(W * 0.82, H * 0.60, W * 0.22, H * 0.26, 0.2, 0, Math.PI * 2)
  ctx.fill()

  // 掌心凹陷略暗
  const hollow = ctx.createRadialGradient(W * 0.48, H * 0.50, 0, W * 0.48, H * 0.50, W * 0.20)
  hollow.addColorStop(0, 'rgba(150,100,80,0.14)')
  hollow.addColorStop(1, 'rgba(150,100,80,0)')
  ctx.fillStyle = hollow
  ctx.beginPath()
  ctx.ellipse(W * 0.48, H * 0.50, W * 0.20, H * 0.14, 0, 0, Math.PI * 2)
  ctx.fill()

  // 指根关节处微黄/硬皮
  const jointColor = 'rgba(185,155,130,0.20)'
  const joints = [[0.48, 0.12], [0.58, 0.10], [0.68, 0.11], [0.78, 0.15]]
  joints.forEach(([jx, jy]) => {
    ctx.fillStyle = jointColor
    ctx.beginPath()
    ctx.ellipse(jx * W, jy * H, W * 0.06, H * 0.02, 0, 0, Math.PI * 2)
    ctx.fill()
  })

  // ================================================
  //  3. 绘制掌纹
  // ================================================

  /** 画一条掌纹线（带渐变模糊） */
  function drawLine(points, color, width, blur, pattern) {
    ctx.save()
    ctx.shadowColor = color
    ctx.shadowBlur = blur
    ctx.strokeStyle = color
    ctx.lineWidth = width
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.beginPath()
    points(ctx)
    ctx.stroke()

    // 第二遍：边缘羽化（更淡的半透明线，略宽）
    ctx.shadowBlur = blur * 1.5
    ctx.globalAlpha = 0.4
    ctx.lineWidth = width * 1.4
    ctx.beginPath()
    points(ctx)
    ctx.stroke()
    ctx.restore()
  }

  const INK = '#8a4e3a'         // 主线深红棕
  const INK2 = '#995540'        // 副线
  const INK3 = '#a8604a'        // 细纹

  // ── 生命线 ──
  drawLine(
    ctx => {
      ctx.moveTo(W * 0.28, H * 0.14)
      ctx.bezierCurveTo(W * 0.06, H * 0.26, W * 0.04, H * 0.55, W * 0.14, H * 0.70)
      ctx.bezierCurveTo(W * 0.22, H * 0.84, W * 0.36, H * 0.92, W * 0.48, H * 0.94)
    },
    INK, 6, 5,
  )
  // 生命线并行
  drawLine(
    ctx => {
      ctx.moveTo(W * 0.33, H * 0.18)
      ctx.bezierCurveTo(W * 0.15, H * 0.29, W * 0.12, H * 0.50, W * 0.20, H * 0.64)
      ctx.bezierCurveTo(W * 0.26, H * 0.74, W * 0.36, H * 0.82, W * 0.44, H * 0.85)
    },
    INK3, 2, 2,
  )
  // 生命线分支
  drawLine(
    ctx => {
      ctx.moveTo(W * 0.17, H * 0.38)
      ctx.quadraticCurveTo(W * 0.26, H * 0.42, W * 0.35, H * 0.44)
    },
    INK2, 3, 2,
  )
  drawLine(
    ctx => {
      ctx.moveTo(W * 0.11, H * 0.60)
      ctx.bezierCurveTo(W * 0.18, H * 0.66, W * 0.28, H * 0.70, W * 0.40, H * 0.72)
    },
    INK2, 3, 2,
  )
  drawLine(
    ctx => {
      ctx.moveTo(W * 0.05, H * 0.70)
      ctx.bezierCurveTo(W * 0.10, H * 0.72, W * 0.18, H * 0.74, W * 0.24, H * 0.76)
    },
    INK3, 1.5, 1,
  )

  // ── 智慧线 ──
  drawLine(
    ctx => {
      ctx.moveTo(W * 0.24, H * 0.37)
      ctx.bezierCurveTo(W * 0.36, H * 0.28, W * 0.54, H * 0.26, W * 0.70, H * 0.32)
      ctx.bezierCurveTo(W * 0.80, H * 0.36, W * 0.88, H * 0.44, W * 0.92, H * 0.54)
    },
    INK, 5, 4,
  )
  // 分支
  drawLine(
    ctx => {
      ctx.moveTo(W * 0.48, H * 0.30)
      ctx.quadraticCurveTo(W * 0.54, H * 0.24, W * 0.58, H * 0.20)
    },
    INK2, 2.5, 2,
  )
  drawLine(
    ctx => {
      ctx.moveTo(W * 0.74, H * 0.36)
      ctx.quadraticCurveTo(W * 0.78, H * 0.46, W * 0.80, H * 0.50)
    },
    INK3, 2, 1,
  )
  drawLine(
    ctx => {
      ctx.moveTo(W * 0.44, H * 0.34)
      ctx.quadraticCurveTo(W * 0.42, H * 0.42, W * 0.44, H * 0.50)
    },
    INK3, 1.5, 1,
  )

  // ── 感情线 ──
  drawLine(
    ctx => {
      ctx.moveTo(W * 0.15, H * 0.20)
      ctx.bezierCurveTo(W * 0.32, H * 0.10, W * 0.54, H * 0.12, W * 0.72, H * 0.16)
      ctx.bezierCurveTo(W * 0.84, H * 0.20, W * 0.91, H * 0.27, W * 0.95, H * 0.37)
    },
    INK, 5, 4,
  )
  drawLine(
    ctx => {
      ctx.moveTo(W * 0.48, H * 0.14)
      ctx.quadraticCurveTo(W * 0.56, H * 0.08, W * 0.64, H * 0.06)
    },
    INK2, 2.5, 2,
  )
  drawLine(
    ctx => {
      ctx.moveTo(W * 0.74, H * 0.18)
      ctx.quadraticCurveTo(W * 0.82, H * 0.14, W * 0.88, H * 0.16)
    },
    INK3, 2, 1,
  )

  // ── 事业线 ──
  drawLine(
    ctx => {
      ctx.moveTo(W * 0.57, H * 0.88)
      ctx.bezierCurveTo(W * 0.52, H * 0.74, W * 0.50, H * 0.56, W * 0.54, H * 0.44)
      ctx.bezierCurveTo(W * 0.57, H * 0.36, W * 0.61, H * 0.30, W * 0.63, H * 0.24)
    },
    INK2, 4, 3,
  )

  // ── 太阳线 ──
  drawLine(
    ctx => {
      ctx.moveTo(W * 0.69, H * 0.76)
      ctx.bezierCurveTo(W * 0.70, H * 0.60, W * 0.73, H * 0.46, W * 0.75, H * 0.34)
      ctx.bezierCurveTo(W * 0.76, H * 0.28, W * 0.76, H * 0.24, W * 0.77, H * 0.20)
    },
    INK3, 3, 2,
  )

  // ── 婚姻线 ──
  drawLine(
    ctx => {
      ctx.moveTo(W * 0.83, H * 0.12)
      ctx.lineTo(W * 0.90, H * 0.10)
    },
    INK2, 2.5, 2,
  )
  drawLine(
    ctx => {
      ctx.moveTo(W * 0.84, H * 0.16)
      ctx.lineTo(W * 0.89, H * 0.14)
    },
    INK3, 1.5, 1,
  )

  // ── 指根横纹 ──
  const roots = [[0.44, 0.08, 0.52, 0.06], [0.52, 0.06, 0.62, 0.06], [0.62, 0.07, 0.72, 0.09], [0.72, 0.09, 0.80, 0.13]]
  roots.forEach(([x1, y1, x2, y2]) => {
    drawLine(
      ctx => { ctx.moveTo(x1 * W, y1 * H); ctx.lineTo(x2 * W, y2 * H) },
      INK2, 3, 2,
    )
  })

  // ================================================
  //  4. 指纹（指尖漩涡/箕形纹）
  // ================================================

  function drawFingerprint(cx, cy, scale, angle) {
    ctx.save()
    ctx.translate(cx, cy)
    ctx.rotate(angle)
    ctx.scale(scale, scale)

    const density = 0.088
    const layers = 22

    // 核心点——漩涡中心
    const coreX = (rng() - 0.5) * 8
    const coreY = (rng() - 0.5) * 8

    for (let l = 1; l <= layers; l++) {
      const rx = 8 + l * 10 + (rng() - 0.5) * 3
      const ry = 6 + l * 8 + (rng() - 0.5) * 2

      ctx.strokeStyle = `rgba(120,70,55,${0.08 + 0.04 * (1 - l / layers)})`
      ctx.lineWidth = 1.2 + 0.3 * (1 - l / layers)

      ctx.beginPath()
      ctx.ellipse(coreX, coreY, rx, ry, 0.05 * l, 0, Math.PI * 2)
      ctx.stroke()

      // 纹线中断/分叉（真实指纹特征）
      if (l > 3 && rng() > 0.7) {
        const brk = rng() * Math.PI * 2
        ctx.beginPath()
        ctx.ellipse(coreX + (rng() - 0.5) * 5, coreY + (rng() - 0.5) * 5,
          rx * 0.6, ry * 0.5, 0.05 * l, brk, brk + 0.5)
        ctx.stroke()
      }
    }

    // 外围U形纹线
    for (let i = 1; i <= 8; i++) {
      ctx.strokeStyle = `rgba(125,75,58,${0.05 + 0.02 * (1 - i / 8)})`
      ctx.lineWidth = 0.8
      ctx.beginPath()
      ctx.ellipse(coreX + i * 3, coreY, 80 + i * 12, 50 + i * 8, 0, 0, Math.PI * 0.8)
      ctx.stroke()
    }

    ctx.restore()
  }

  // 指尖位置（手掌纹理的顶部区域）
  const fpScale = 1.0
  drawFingerprint(W * 0.30, H * 0.035, 2.2, -0.1)  // 拇指
  drawFingerprint(W * 0.46, H * 0.012, 2.0, 0.0)   // 食指
  drawFingerprint(W * 0.57, H * 0.002, 2.0, 0.02)  // 中指
  drawFingerprint(W * 0.67, H * 0.012, 1.8, 0.05)  // 无名指
  drawFingerprint(W * 0.77, H * 0.035, 1.6, 0.1)   // 小指

  // 指腹纹路（手指下半段的纵向平行纹）
  function drawFingerLines(cx, cy, w, h, angle, count) {
    ctx.save()
    ctx.translate(cx, cy)
    ctx.rotate(angle)
    for (let i = 0; i < count; i++) {
      const x = -w / 2 + (i + 0.5) * w / count
      const yOff = (rng() - 0.5) * 6
      ctx.strokeStyle = `rgba(130,75,58,${0.05 + rng() * 0.04})`
      ctx.lineWidth = 0.8 + rng() * 0.5
      ctx.beginPath()
      ctx.moveTo(x, -h / 2)
      ctx.lineTo(x + (rng() - 0.5) * 4, h / 2)
      ctx.stroke()
    }
    ctx.restore()
  }

  drawFingerLines(W * 0.32, H * 0.08, 45, 30, -0.05, 30)
  drawFingerLines(W * 0.47, H * 0.05, 35, 28, 0.02, 26)
  drawFingerLines(W * 0.58, H * 0.04, 30, 25, 0.03, 24)
  drawFingerLines(W * 0.68, H * 0.05, 32, 26, 0.04, 24)
  drawFingerLines(W * 0.78, H * 0.07, 28, 22, 0.06, 20)

  // ================================================
  //  5. 细小掌纹网格（真实掌纹的交叉细纹）
  // ================================================

  for (let i = 0; i < 600; i++) {
    const x = rng() * W
    const y = rng() * H
    const cx = Math.abs(x - W * 0.48)
    const cy = Math.abs(y - H * 0.50)
    if (cx > W * 0.38 || cy > H * 0.38) continue
    const len = 5 + rng() * 25
    const angle = rng() * Math.PI
    ctx.strokeStyle = `rgba(135,75,55,${0.02 + rng() * 0.07})`
    ctx.lineWidth = 0.3 + rng() * 0.8
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineTo(x + Math.cos(angle) * len, y + Math.sin(angle) * len)
    ctx.stroke()
  }

  // ================================================
  //  6. 皮肤毛孔纹理
  // ================================================

  for (let i = 0; i < 2000; i++) {
    const x = rng() * W
    const y = rng() * H
    const r = 0.5 + rng() * 2
    ctx.fillStyle = `rgba(125,68,48,${0.02 + rng() * 0.04})`
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fill()
  }

  // ================================================
  //  7. 掌根阴影和指尖红晕
  // ================================================

  // 掌根自然过渡到手腕
  const wGrad = ctx.createLinearGradient(0, H * 0.86, 0, H)
  wGrad.addColorStop(0, 'rgba(120,78,64,0)')
  wGrad.addColorStop(0.3, 'rgba(120,78,64,0.10)')
  wGrad.addColorStop(1, 'rgba(120,78,64,0.25)')
  ctx.fillStyle = wGrad
  ctx.fillRect(0, H * 0.86, W, H * 0.14)

  // 指尖微红
  const tipReds = [[0.30, 0.025, 0.10], [0.46, 0.008, 0.10], [0.57, 0.002, 0.10], [0.67, 0.008, 0.09], [0.77, 0.025, 0.08]]
  tipReds.forEach(([tx, ty, tr]) => {
    const tg = ctx.createRadialGradient(tx * W, ty * H, 0, tx * W, ty * H, tr * W)
    tg.addColorStop(0, 'rgba(215,165,145,0.22)')
    tg.addColorStop(1, 'rgba(215,165,145,0)')
    ctx.fillStyle = tg
    ctx.beginPath()
    ctx.ellipse(tx * W, ty * H, tr * W, tr * H * 0.65, 0, 0, Math.PI * 2)
    ctx.fill()
  })

  // ================================================
  //  8. 最终噪点/皮肤质感
  // ================================================

  const imgData = ctx.getImageData(0, 0, W, H)
  addGrain(imgData, 3, rng)
  ctx.putImageData(imgData, 0, 0)

  // 轻微锐化掌纹对比度
  const tex = new THREE.CanvasTexture(c)
  tex.wrapS = THREE.ClampToEdgeWrapping
  tex.wrapT = THREE.ClampToEdgeWrapping
  tex.anisotropy = 16
  return tex
}

// ══════════════════════════════════════════════════════
//  3D 手指构建
// ══════════════════════════════════════════════════════

/** 手指的一段（带关节突起） */
function makePhalanx(baseRadius, tipRadius, length, pos, quat, isTip = false) {
  const geo = new THREE.CylinderGeometry(tipRadius, baseRadius, length, 10, 4)
  const mat = new THREE.MeshStandardMaterial({
    color: 0xeabc9e,
    roughness: 0.50,
    metalness: 0.0,
  })
  const mesh = new THREE.Mesh(geo, mat)
  mesh.position.copy(pos)
  mesh.quaternion.copy(quat)

  // 关节球（指节）
  if (!isTip) {
    const jointGeo = new THREE.SphereGeometry(baseRadius * 1.1, 8, 6)
    const jointMat = new THREE.MeshStandardMaterial({
      color: 0xdcb09a,
      roughness: 0.55,
      metalness: 0.0,
    })
    const joint = new THREE.Mesh(jointGeo, jointMat)
    joint.position.set(0, -length / 2, 0)
    mesh.add(joint)
  }

  return mesh
}

/** 创建一根完整手指（3段指节 + 指尖 + 指甲） */
function createFinger(config, palmY) {
  const group = new THREE.Group()
  let cx = config.baseX
  let cy = palmY
  let cz = config.baseZ

  const xSign = config.baseX === 0 ? 0 : Math.sign(config.baseX)

  // 手指从指根到指尖的总方向矢量
  function getDir(cumAngle) {
    const inward = config.curl * cumAngle * 0.50
    return {
      x: -Math.sin(inward) * xSign,
      z: -Math.sin(cumAngle) * 0.22,
      y: Math.cos(cumAngle),
    }
  }

  let cumAngle = 0

  config.segments.forEach((seg, i) => {
    cumAngle += seg.angle
    const dir = getDir(cumAngle)
    const len = seg.len
    const isLast = i === config.segments.length - 1

    const midX = cx + dir.x * len * 0.5
    const midY = cy + dir.y * len * 0.5
    const midZ = cz + dir.z * len * 0.5

    const d = new THREE.Vector3(dir.x, dir.y, dir.z).normalize()
    const up = new THREE.Vector3(0, 1, 0)
    const quat = new THREE.Quaternion().setFromUnitVectors(up, d)

    group.add(makePhalanx(seg.r, seg.tipR, len, new THREE.Vector3(midX, midY, midZ), quat, isLast))

    cx += dir.x * len * 0.92
    cy += dir.y * len * 0.92
    cz += dir.z * len * 0.92
  })

  // 指尖半球
  const lastSeg = config.segments[config.segments.length - 1]
  cumAngle += 0.05
  const dir = getDir(cumAngle)
  const tipR = lastSeg.tipR * 0.85
  const tipGeo = new THREE.SphereGeometry(tipR, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2)
  const tipMat = new THREE.MeshStandardMaterial({
    color: 0xd6a892,
    roughness: 0.38,
    metalness: 0.0,
  })
  const tip = new THREE.Mesh(tipGeo, tipMat)
  tip.position.set(cx + dir.x * 0.6, cy + dir.y * 0.6, cz + dir.z * 0.6)
  const tipDir = new THREE.Vector3(dir.x, dir.y, dir.z).normalize()
  const tipUp = new THREE.Vector3(0, 1, 0)
  tip.quaternion.setFromUnitVectors(tipUp, tipDir)
  group.add(tip)

  // 指甲（用扁平椭球体）
  if (config.hasNail) {
    const nailGeo = new THREE.SphereGeometry(tipR * 0.8, 6, 6, 0, Math.PI * 0.8, 0, Math.PI * 0.35)
    const nailMat = new THREE.MeshStandardMaterial({
      color: 0xf0d8c8,
      roughness: 0.15,
      metalness: 0.05,
      transparent: true,
      opacity: 0.85,
      side: THREE.DoubleSide,
    })
    const nail = new THREE.Mesh(nailGeo, nailMat)

    // 指甲在指尖上方
    const nailOffX = dir.x * 0.2
    const nailOffY = dir.y * 0.2 + tipR * 0.3
    const nailOffZ = dir.z * 0.2
    nail.position.set(cx + nailOffX, cy + nailOffY, cz + nailOffZ)
    nail.scale.set(1, 0.25, 0.70)
    nail.quaternion.setFromUnitVectors(tipUp, tipDir)
    group.add(nail)
  }

  return group
}

// ══════════════════════════════════════════════════════
//  手掌几何体（大尺寸、碗状曲面）
// ══════════════════════════════════════════════════════

function createPalmMesh(texture, palmY) {
  const shape = new THREE.Shape()

  // 尺寸：手掌宽 ~170，高 ~120（加上手腕 ~180），让整个太阳系（±68）落在掌心
  const hw = 85   // 半宽
  const hh = 60   // 半高
  const wh = 30   // 手腕长度
  const T = hh * 1.02
  const B = -(hh + wh)

  // 轮廓（顺时针）
  shape.moveTo(0, T)
  // 右上
  shape.quadraticCurveTo(hw * 0.22, hh * 0.97, hw * 0.38, hh * 0.88)
  shape.quadraticCurveTo(hw * 0.55, hh * 0.78, hw * 0.70, hh * 0.62)
  shape.quadraticCurveTo(hw * 0.88, hh * 0.42, hw * 0.96, hh * 0.20)
  shape.quadraticCurveTo(hw * 1.04, hh * 0.00, hw * 0.95, -hh * 0.20)
  shape.quadraticCurveTo(hw * 0.82, -hh * 0.45, hw * 0.60, -hh * 0.60)
  shape.quadraticCurveTo(hw * 0.38, -hh * 0.75, hw * 0.18, -hh * 0.86)
  // 手腕右
  shape.lineTo(hw * 0.12, -hh * 1.40)
  shape.quadraticCurveTo(hw * 0.08, -hh * 1.65, hw * 0.04, -hh * 1.75)
  // 手腕底
  shape.quadraticCurveTo(0, -hh * 1.80, -hw * 0.04, -hh * 1.75)
  // 手腕左
  shape.quadraticCurveTo(-hw * 0.08, -hh * 1.65, -hw * 0.12, -hh * 1.40)
  shape.lineTo(-hw * 0.18, -hh * 0.86)
  // 左掌边
  shape.quadraticCurveTo(-hw * 0.38, -hh * 0.75, -hw * 0.60, -hh * 0.60)
  shape.quadraticCurveTo(-hw * 0.82, -hh * 0.45, -hw * 0.95, -hh * 0.20)
  shape.quadraticCurveTo(-hw * 1.04, hh * 0.00, -hw * 0.96, hh * 0.20)
  shape.quadraticCurveTo(-hw * 0.88, hh * 0.42, -hw * 0.70, hh * 0.62)
  shape.quadraticCurveTo(-hw * 0.55, hh * 0.78, -hw * 0.38, hh * 0.88)
  shape.quadraticCurveTo(-hw * 0.22, hh * 0.97, 0, T)

  const segments = 80
  const geo = new THREE.ShapeGeometry(shape, segments)

  // 转换为3D碗状曲面
  const pos = geo.attributes.position
  const uv = geo.attributes.uv
  const newPos = new Float32Array(pos.count * 3)
  const newUv = new Float32Array(uv.count * 2)

  // 边界
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity
  for (let i = 0; i < pos.count; i++) {
    const sx = pos.getX(i), sy = pos.getY(i)
    if (sx < minX) minX = sx
    if (sx > maxX) maxX = sx
    if (sy < minY) minY = sy
    if (sy > maxY) maxY = sy
  }

  for (let i = 0; i < pos.count; i++) {
    const sx = pos.getX(i)
    const sy = pos.getY(i)

    // 碗状曲面：中心凹陷，指根区域最高，侧边次之，手腕平坦
    const syPos = Math.max(0, sy)
    const syNeg = Math.min(0, sy)

    // archX: 横向掌弓（侧边翘起），archY: 纵向（指根翘起 > 侧边 > 手腕）
    const archX = 0.0030 * sx * sx
    const archY = 0.0060 * syPos * syPos + 0.0008 * syNeg * syNeg
    // 中心凹陷（使掌心内凹成碗状）
    const bowl = -0.0008 * (sx * sx + syPos * syPos)

    const curvature = archX + archY + bowl

    newPos[i * 3] = sx
    newPos[i * 3 + 1] = palmY + curvature
    newPos[i * 3 + 2] = sy

    newUv[i * 2] = (sx - minX) / (maxX - minX)
    newUv[i * 2 + 1] = (sy - minY) / (maxY - minY)
  }

  const finalGeo = new THREE.BufferGeometry()
  finalGeo.setAttribute('position', new THREE.BufferAttribute(newPos, 3))
  finalGeo.setAttribute('uv', new THREE.BufferAttribute(newUv, 2))
  if (geo.index) {
    finalGeo.setIndex(new THREE.BufferAttribute(geo.index.array.slice(), 1))
  }
  finalGeo.computeVertexNormals()

  const mat = new THREE.MeshStandardMaterial({
    map: texture,
    bumpMap: texture,
    bumpScale: 0.5,
    roughness: 0.50,
    metalness: 0.0,
    side: THREE.DoubleSide,
  })

  return new THREE.Mesh(finalGeo, mat)
}

/** 计算手掌曲面在形状坐标(sx, sy)处的Y偏移 */
function palmYOffset(sx, sy) {
  const syPos = Math.max(0, sy)
  const syNeg = Math.min(0, sy)
  return 0.0030 * sx * sx + 0.0060 * syPos * syPos + 0.0008 * syNeg * syNeg - 0.0008 * (sx * sx + syPos * syPos)
}

// ══════════════════════════════════════════════════════
//  主入口
// ══════════════════════════════════════════════════════

export function createHand() {
  const group = new THREE.Group()

  // 手掌基准高度 - 让手从下方托举太阳系
  const palmY = -30

  const texture = createPalmTexture()

  // 手掌
  const palm = createPalmMesh(texture, palmY)
  group.add(palm)

  // 手指配置
  // 手指根部位于手掌边缘形状坐标处
  // curl: 弯曲系数，越大手指越向掌心收拢
  // segments: r=指根半径, tipR=指尖半径, len=长度, angle=关节弯曲角
  const fingerData = [
    { // 拇指 - 左侧，大幅弯曲向内包裹
      baseX: -70, baseZ: 44, curl: 1.6, hasNail: true,
      segments: [
        { r: 6.5, tipR: 5.0, len: 22, angle: 0.08 },
        { r: 5.0, tipR: 3.8, len: 18, angle: 0.35 },
        { r: 3.8, tipR: 2.8, len: 14, angle: 0.25 },
      ],
    },
    { // 食指 - 左上方，向掌心弯曲
      baseX: -34, baseZ: 60, curl: 0.7, hasNail: true,
      segments: [
        { r: 5.5, tipR: 4.2, len: 22, angle: 0.04 },
        { r: 4.2, tipR: 3.2, len: 18, angle: 0.28 },
        { r: 3.2, tipR: 2.4, len: 14, angle: 0.22 },
      ],
    },
    { // 中指 - 正上方，最长，微弯
      baseX: 0, baseZ: 62, curl: 0.3, hasNail: true,
      segments: [
        { r: 5.5, tipR: 4.2, len: 25, angle: 0.04 },
        { r: 4.2, tipR: 3.2, len: 20, angle: 0.22 },
        { r: 3.2, tipR: 2.4, len: 16, angle: 0.18 },
      ],
    },
    { // 无名指
      baseX: 34, baseZ: 60, curl: 0.7, hasNail: true,
      segments: [
        { r: 5.0, tipR: 3.8, len: 22, angle: 0.04 },
        { r: 3.8, tipR: 3.0, len: 18, angle: 0.28 },
        { r: 3.0, tipR: 2.2, len: 14, angle: 0.22 },
      ],
    },
    { // 小指 - 右侧，弯曲幅度较大
      baseX: 64, baseZ: 52, curl: 1.1, hasNail: true,
      segments: [
        { r: 4.2, tipR: 3.2, len: 18, angle: 0.06 },
        { r: 3.2, tipR: 2.4, len: 14, angle: 0.32 },
        { r: 2.4, tipR: 1.8, len: 11, angle: 0.25 },
      ],
    },
  ]

  // 创建手指时考虑手掌曲面高度
  fingerData.forEach(cfg => {
    const baseY = palmY + palmYOffset(cfg.baseX, cfg.baseZ)
    group.add(createFinger(cfg, baseY))
  })

  // 整手微调
  group.rotation.x = 0.06
  group.rotation.z = -0.02

  return group
}

/**
 * 3D 手掌模型 —— 从下方托举太阳系
 * 含程序化掌纹纹理（生命线、智慧线、感情线等）
 */
import * as THREE from 'three'

// ══════════════════════════════════════════════════════
//  手掌纹理生成（2048×2048，掌纹清晰可见）
// ══════════════════════════════════════════════════════

export function createPalmTexture() {
  const W = 2048, H = 2048
  const c = document.createElement('canvas')
  c.width = W
  c.height = H
  const ctx = c.getContext('2d')

  // ── 1. 基底肤色（掌心渐亮、边缘渐深） ──
  const grad = ctx.createRadialGradient(W * 0.5, H * 0.45, 0, W * 0.5, H * 0.45, W * 0.82)
  grad.addColorStop(0, '#f7d4c2')
  grad.addColorStop(0.28, '#efc5b0')
  grad.addColorStop(0.55, '#e2b49a')
  grad.addColorStop(0.80, '#d4a48a')
  grad.addColorStop(1, '#c89078')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, W, H)

  // ── 2. 大鱼际（拇指根部，偏红润） ──
  const thenar = ctx.createRadialGradient(W * 0.22, H * 0.55, 0, W * 0.22, H * 0.55, W * 0.28)
  thenar.addColorStop(0, 'rgba(225,160,135,0.38)')
  thenar.addColorStop(0.5, 'rgba(205,150,130,0.18)')
  thenar.addColorStop(1, 'rgba(200,145,125,0)')
  ctx.fillStyle = thenar
  ctx.beginPath()
  ctx.ellipse(W * 0.22, H * 0.55, W * 0.28, H * 0.32, -0.3, 0, Math.PI * 2)
  ctx.fill()

  // ── 3. 小鱼际（小指根部） ──
  const hypothenar = ctx.createRadialGradient(W * 0.82, H * 0.62, 0, W * 0.82, H * 0.62, W * 0.20)
  hypothenar.addColorStop(0, 'rgba(205,150,130,0.28)')
  hypothenar.addColorStop(0.5, 'rgba(195,145,125,0.12)')
  hypothenar.addColorStop(1, 'rgba(190,140,120,0)')
  ctx.fillStyle = hypothenar
  ctx.beginPath()
  ctx.ellipse(W * 0.82, H * 0.62, W * 0.20, H * 0.24, 0.2, 0, Math.PI * 2)
  ctx.fill()

  // ── 4. 掌心凹陷（明暗过渡） ──
  const hollow = ctx.createRadialGradient(W * 0.5, H * 0.52, 0, W * 0.5, H * 0.52, W * 0.20)
  hollow.addColorStop(0, 'rgba(155,105,85,0.14)')
  hollow.addColorStop(1, 'rgba(155,105,85,0)')
  ctx.fillStyle = hollow
  ctx.beginPath()
  ctx.ellipse(W * 0.5, H * 0.52, W * 0.20, H * 0.14, 0, 0, Math.PI * 2)
  ctx.fill()

  // ── 掌纹绘制辅助 ──
  function line(path, color, width, blur) {
    ctx.save()
    ctx.shadowColor = color
    ctx.shadowBlur = blur
    ctx.strokeStyle = color
    ctx.lineWidth = width
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.beginPath()
    path(ctx)
    ctx.stroke()
    ctx.restore()
  }

  const C1 = 'rgba(155,85,65,0.78)'  // 主线深色
  const C2 = 'rgba(155,85,65,0.50)'  // 副线
  const C3 = 'rgba(145,75,55,0.32)'  // 细纹

  // ── 5. 生命线（大鱼际弧线） ──
  line(
    ctx => {
      ctx.moveTo(W * 0.28, H * 0.16)
      ctx.bezierCurveTo(W * 0.08, H * 0.28, W * 0.06, H * 0.55, W * 0.15, H * 0.70)
      ctx.bezierCurveTo(W * 0.22, H * 0.83, W * 0.34, H * 0.90, W * 0.46, H * 0.93)
    },
    C1, 5.5, 4,
  )
  // 生命线并行护线
  line(
    ctx => {
      ctx.moveTo(W * 0.33, H * 0.20)
      ctx.bezierCurveTo(W * 0.17, H * 0.30, W * 0.14, H * 0.50, W * 0.21, H * 0.64)
      ctx.bezierCurveTo(W * 0.26, H * 0.73, W * 0.35, H * 0.80, W * 0.42, H * 0.83)
    },
    C3, 1.5, 1,
  )
  // 生命线分支
  line(
    ctx => {
      ctx.moveTo(W * 0.19, H * 0.38)
      ctx.quadraticCurveTo(W * 0.26, H * 0.42, W * 0.34, H * 0.44)
    },
    C2, 2.5, 1,
  )
  line(
    ctx => {
      ctx.moveTo(W * 0.12, H * 0.60)
      ctx.bezierCurveTo(W * 0.19, H * 0.65, W * 0.28, H * 0.69, W * 0.38, H * 0.70)
    },
    C2, 2.5, 1,
  )

  // ── 6. 智慧线（横贯掌心） ──
  line(
    ctx => {
      ctx.moveTo(W * 0.26, H * 0.38)
      ctx.bezierCurveTo(W * 0.38, H * 0.30, W * 0.54, H * 0.28, W * 0.68, H * 0.34)
      ctx.bezierCurveTo(W * 0.78, H * 0.38, W * 0.86, H * 0.46, W * 0.91, H * 0.55)
    },
    C1, 4.5, 3,
  )
  // 智慧线分支（向上）
  line(
    ctx => {
      ctx.moveTo(W * 0.48, H * 0.32)
      ctx.quadraticCurveTo(W * 0.53, H * 0.26, W * 0.57, H * 0.22)
    },
    C2, 2, 1,
  )
  // 智慧线分叉（向下）
  line(
    ctx => {
      ctx.moveTo(W * 0.72, H * 0.38)
      ctx.quadraticCurveTo(W * 0.75, H * 0.46, W * 0.78, H * 0.50)
    },
    C3, 1.5, 1,
  )

  // ── 7. 感情线（手掌上方） ──
  line(
    ctx => {
      ctx.moveTo(W * 0.18, H * 0.22)
      ctx.bezierCurveTo(W * 0.33, H * 0.12, W * 0.54, H * 0.14, W * 0.70, H * 0.18)
      ctx.bezierCurveTo(W * 0.82, H * 0.22, W * 0.89, H * 0.28, W * 0.94, H * 0.38)
    },
    C1, 4.5, 3,
  )
  // 感情线分支
  line(
    ctx => {
      ctx.moveTo(W * 0.50, H * 0.16)
      ctx.quadraticCurveTo(W * 0.56, H * 0.10, W * 0.64, H * 0.08)
    },
    C2, 2, 1,
  )
  line(
    ctx => {
      ctx.moveTo(W * 0.72, H * 0.20)
      ctx.quadraticCurveTo(W * 0.80, H * 0.16, W * 0.86, H * 0.18)
    },
    C3, 1.5, 1,
  )

  // ── 8. 事业线（纵贯掌心） ──
  line(
    ctx => {
      ctx.moveTo(W * 0.56, H * 0.87)
      ctx.bezierCurveTo(W * 0.52, H * 0.74, W * 0.51, H * 0.58, W * 0.54, H * 0.46)
      ctx.bezierCurveTo(W * 0.56, H * 0.38, W * 0.60, H * 0.32, W * 0.62, H * 0.26)
    },
    C2, 3.5, 2,
  )

  // ── 9. 太阳线（无名指下方纵线） ──
  line(
    ctx => {
      ctx.moveTo(W * 0.68, H * 0.74)
      ctx.bezierCurveTo(W * 0.69, H * 0.60, W * 0.72, H * 0.48, W * 0.74, H * 0.36)
      ctx.bezierCurveTo(W * 0.75, H * 0.30, W * 0.75, H * 0.26, W * 0.76, H * 0.22)
    },
    C3, 2.5, 2,
  )

  // ── 10. 婚姻线（小指下方短横纹） ──
  line(
    ctx => {
      ctx.moveTo(W * 0.82, H * 0.14)
      ctx.lineTo(W * 0.89, H * 0.12)
    },
    C2, 2, 1,
  )
  line(
    ctx => {
      ctx.moveTo(W * 0.83, H * 0.17)
      ctx.lineTo(W * 0.88, H * 0.15)
    },
    C3, 1.5, 1,
  )

  // ── 11. 指根横纹 ──
  const rootLines = [
    [0.42, 0.10, 0.52, 0.08],
    [0.52, 0.08, 0.62, 0.08],
    [0.62, 0.08, 0.72, 0.10],
    [0.72, 0.10, 0.80, 0.14],
  ]
  rootLines.forEach(([x1, y1, x2, y2]) => {
    line(
      ctx => {
        ctx.moveTo(x1 * W, y1 * H)
        ctx.lineTo(x2 * W, y2 * H)
      },
      C2, 2.5, 1,
    )
  })

  // ―― 12. 细小掌纹（增加真实感） ――
  for (let i = 0; i < 400; i++) {
    const x = Math.random() * W
    const y = Math.random() * H
    const cx = Math.abs(x - W * 0.5)
    const cy = Math.abs(y - H * 0.5)
    if (cx > W * 0.38 || cy > H * 0.38) continue
    const len = 6 + Math.random() * 30
    const angle = Math.random() * Math.PI
    ctx.strokeStyle = `rgba(140,78,58,${0.03 + Math.random() * 0.08})`
    ctx.lineWidth = 0.3 + Math.random() * 1.0
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineTo(x + Math.cos(angle) * len, y + Math.sin(angle) * len)
    ctx.stroke()
  }

  // ―― 13. 皮肤毛孔纹理 ――
  for (let i = 0; i < 1000; i++) {
    const x = Math.random() * W
    const y = Math.random() * H
    const r = 0.3 + Math.random() * 1.8
    ctx.fillStyle = `rgba(130,72,52,${0.02 + Math.random() * 0.05})`
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fill()
  }

  // ―― 14. 掌根阴影过渡 ――
  const wristShade = ctx.createLinearGradient(0, H * 0.88, 0, H)
  wristShade.addColorStop(0, 'rgba(130,85,70,0)')
  wristShade.addColorStop(1, 'rgba(130,85,70,0.22)')
  ctx.fillStyle = wristShade
  ctx.fillRect(0, H * 0.88, W, H * 0.12)

  // ―― 15. 指尖区域微红晕 ――
  const tipAreas = [
    [0.46, 0.03, 0.08],
    [0.57, 0.01, 0.08],
    [0.67, 0.03, 0.07],
    [0.77, 0.07, 0.06],
  ]
  tipAreas.forEach(([cx, cy, r]) => {
    const tg = ctx.createRadialGradient(cx * W, cy * H, 0, cx * W, cy * H, r * W)
    tg.addColorStop(0, 'rgba(215,165,145,0.18)')
    tg.addColorStop(1, 'rgba(215,165,145,0)')
    ctx.fillStyle = tg
    ctx.beginPath()
    ctx.ellipse(cx * W, cy * H, r * W, r * W * 0.7, 0, 0, Math.PI * 2)
    ctx.fill()
  })

  const tex = new THREE.CanvasTexture(c)
  tex.wrapS = THREE.ClampToEdgeWrapping
  tex.wrapT = THREE.ClampToEdgeWrapping
  tex.anisotropy = 8
  return tex
}

// ══════════════════════════════════════════════════════
//  3D 手部构建
// ══════════════════════════════════════════════════════

/** 创建单个手指段（胶囊体） */
function fingerSegment(radius, cylLength, pos, quat, colorOverride) {
  const geo = new THREE.CapsuleGeometry(radius, Math.max(cylLength, 0.01), 6, 12)
  const mat = new THREE.MeshStandardMaterial({
    color: colorOverride || 0xeabc9e,
    roughness: 0.50,
    metalness: 0.0,
  })
  const mesh = new THREE.Mesh(geo, mat)
  mesh.position.copy(pos)
  mesh.quaternion.copy(quat)
  return mesh
}

/** 创建一根完整手指（两段弯曲渐细 + 指尖球） */
function createFinger(config, palmY) {
  const group = new THREE.Group()
  let cx = config.baseX
  let cy = palmY
  let cz = config.baseZ

  // 累计角度（弧度）
  let cumAngle = 0

  config.segments.forEach((seg, i) => {
    cumAngle += seg.angle
    // 向掌心弯曲：左右手指向掌心收拢，中指向 Z 弯曲
    const xSign = config.baseX === 0 ? 0 : Math.sign(config.baseX)
    const inward = config.curl * cumAngle * 0.55
    const dirX = -Math.sin(inward) * xSign
    const dirZ = Math.sin(cumAngle) * 0.25
    const dirY = Math.cos(cumAngle)

    const len = seg.len
    const midX = cx + dirX * len * 0.5
    const midY = cy + dirY * len * 0.5
    const midZ = cz + dirZ * len * 0.5

    const dir = new THREE.Vector3(dirX, dirY, dirZ).normalize()
    const up = new THREE.Vector3(0, 1, 0)
    const quat = new THREE.Quaternion().setFromUnitVectors(up, dir)

    group.add(
      fingerSegment(
        seg.r,
        len - seg.r * 2,
        new THREE.Vector3(midX, midY, midZ),
        quat,
      ),
    )

    // 更新末端 = 下一段起点
    cx += dirX * len * 0.92
    cy += dirY * len * 0.92
    cz += dirZ * len * 0.92
  })

  // 指尖球
  const lastSeg = config.segments[config.segments.length - 1]
  const xSign = config.baseX === 0 ? 0 : Math.sign(config.baseX)
  const fInward = config.curl * cumAngle * 0.55
  const fX = -Math.sin(fInward) * xSign
  const fZ = Math.sin(cumAngle) * 0.25
  const fY = Math.cos(cumAngle) * 0.92
  const tipR = lastSeg.r * 0.7
  const tipGeo = new THREE.SphereGeometry(tipR, 8, 8)
  const tipMat = new THREE.MeshStandardMaterial({
    color: 0xd4a088,
    roughness: 0.4,
    metalness: 0,
  })
  const tip = new THREE.Mesh(tipGeo, tipMat)
  tip.position.set(cx + fX * 0.8, cy + fY * 0.8, cz + fZ * 0.8)
  group.add(tip)

  return group
}

/** 创建手掌几何体（单 Shape，含手腕延伸，抛物面凹陷） */
function createPalmMesh(texture, palmY) {
  const shape = new THREE.Shape()
  const hw = 24  // 半宽
  const hh = 17  // 半高（掌部）
  const wh = 10  // 手腕半长

  // 从食指根部右侧起，顺时针描整个手掌+手腕轮廓
  const T = hh * 1.02  // top
  const B = -(hh + wh) // bottom

  shape.moveTo(0, T) // 顶部中心
  // → 右上（食指→中指侧）
  shape.quadraticCurveTo(hw * 0.25, hh * 0.96, hw * 0.40, hh * 0.88)
  // → 右掌边
  shape.quadraticCurveTo(hw * 0.72, hh * 0.75, hw * 0.90, hh * 0.50)
  shape.quadraticCurveTo(hw * 1.02, hh * 0.18, hw * 0.92, -hh * 0.08)
  shape.quadraticCurveTo(hw * 0.75, -hh * 0.38, hw * 0.45, -hh * 0.62)
  shape.quadraticCurveTo(hw * 0.25, -hh * 0.78, hw * 0.14, -hh * 0.86)
  // → 手腕右侧
  shape.lineTo(hw * 0.10, -hh * 1.30)
  shape.quadraticCurveTo(hw * 0.08, -hh * 1.48, hw * 0.04, -hh * 1.55)
  // → 手腕底部
  shape.quadraticCurveTo(0, -hh * 1.60, -hw * 0.04, -hh * 1.55)
  // → 手腕左侧
  shape.quadraticCurveTo(-hw * 0.08, -hh * 1.48, -hw * 0.10, -hh * 1.30)
  shape.lineTo(-hw * 0.14, -hh * 0.86)
  // → 左掌边
  shape.quadraticCurveTo(-hw * 0.25, -hh * 0.78, -hw * 0.45, -hh * 0.62)
  shape.quadraticCurveTo(-hw * 0.75, -hh * 0.38, -hw * 0.92, -hh * 0.08)
  shape.quadraticCurveTo(-hw * 1.02, hh * 0.18, -hw * 0.90, hh * 0.50)
  shape.quadraticCurveTo(-hw * 0.72, hh * 0.75, -hw * 0.40, hh * 0.88)
  shape.quadraticCurveTo(-hw * 0.25, hh * 0.96, 0, T)

  // Shape → 几何体
  const segments = 64
  const geo = new THREE.ShapeGeometry(shape, segments)

  // 重新映射顶点：shape(x,y,0) → world(x, curvature, y)
  const pos = geo.attributes.position
  const uv = geo.attributes.uv
  const newPos = new Float32Array(pos.count * 3)
  const newUv = new Float32Array(uv.count * 2)

  // 计算原始2D顶点边界（排除子路径点）
  const allPoints = []
  for (let i = 0; i < pos.count; i++) {
    allPoints.push({ x: pos.getX(i), y: pos.getY(i) })
  }
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity
  allPoints.forEach(p => {
    if (p.x < minX) minX = p.x
    if (p.x > maxX) maxX = p.x
    if (p.y < minY) minY = p.y
    if (p.y > maxY) maxY = p.y
  })

  for (let i = 0; i < pos.count; i++) {
    const sx = pos.getX(i)
    const sy = pos.getY(i)

    // 曲面高度：X向侧边翘起（掌弓）+ Y向上方微翘（指根），手腕区域保持平坦
    const syPos = Math.max(0, sy)
    const curvature = 0.013 * sx * sx + 0.005 * syPos * syPos

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
    bumpScale: 0.7,
    roughness: 0.55,
    metalness: 0.0,
    side: THREE.DoubleSide,
  })

  return new THREE.Mesh(finalGeo, mat)
}

// ══════════════════════════════════════════════════════
//  主入口：创建完整手部组
// ══════════════════════════════════════════════════════

/** 计算手掌曲面在 (sx, sy) 处的 Y 偏移 */
function palmCurvature(sx, sy) {
  const syPos = Math.max(0, sy)
  return 0.013 * sx * sx + 0.005 * syPos * syPos
}

export function createHand() {
  const group = new THREE.Group()
  const palmY = -20 // 手掌基准高度（降低，让手更靠下）
  const texture = createPalmTexture()

  // ── 手掌 ──
  const palm = createPalmMesh(texture, palmY)
  group.add(palm)

  // ── 手指配置 ──
  // baseX/baseZ：手指根部在手掌顶部边缘的位置（形状坐标）
  // curl：弯曲系数（越大越向掌心弯）
  // segments: r=半径, len=长度, angle=相对上一段的偏转角（弧度）
  const fingerData = [
    {
      // 拇指（左侧横向包裹，弯曲幅度最大）
      baseX: -20,
      baseZ: 10,
      curl: 1.4,
      segments: [
        { r: 2.8, len: 7.5, angle: 0.12 },
        { r: 2.2, len: 6.5, angle: 0.52 },
      ],
    },
    {
      // 食指
      baseX: -9,
      baseZ: 16.5,
      curl: 0.6,
      segments: [
        { r: 2.2, len: 8.5, angle: 0.05 },
        { r: 1.8, len: 7.0, angle: 0.35 },
      ],
    },
    {
      // 中指（最高）
      baseX: 0,
      baseZ: 17.5,
      curl: 0.4,
      segments: [
        { r: 2.2, len: 9.5, angle: 0.05 },
        { r: 1.8, len: 7.5, angle: 0.30 },
      ],
    },
    {
      // 无名指
      baseX: 10,
      baseZ: 16.5,
      curl: 0.6,
      segments: [
        { r: 2.0, len: 8.0, angle: 0.05 },
        { r: 1.6, len: 7.0, angle: 0.35 },
      ],
    },
    {
      // 小指
      baseX: 19,
      baseZ: 13,
      curl: 1.0,
      segments: [
        { r: 1.8, len: 7.0, angle: 0.08 },
        { r: 1.4, len: 6.0, angle: 0.42 },
      ],
    },
  ]

  // 修正每个手指的起始 Y：考虑手掌曲面高度
  fingerData.forEach(cfg => {
    // 手指根部在形状坐标中，需要加上曲面高度
    const baseY = palmY + palmCurvature(cfg.baseX, cfg.baseZ)
    // 将基础 baseZ 略微抬高让手指与掌沿更贴合
    group.add(createFinger(cfg, baseY))
  })

  // 整手微调：让手掌略向上仰，更有「托举」感
  group.rotation.x = 0.08
  group.rotation.z = -0.02

  return group
}

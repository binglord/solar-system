import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { SolarSystem } from './solar-system.js'
import { ControlPanel } from './ui.js'

// ─── 场景初始化 ───
const scene = new THREE.Scene()
// 明亮深空蓝黑背景
scene.background = new THREE.Color(0x080c1a)
// 雾效 — 柔和远处过渡
scene.fog = new THREE.Fog(0x080c1a, 500, 1200)

const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 2000)
camera.position.set(28, 22, 48)

const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 1.5  // 提高曝光，画面更明亮
renderer.shadowMap.enabled = false  // 为提升性能不用阴影
document.getElementById('app').appendChild(renderer.domElement)

// ─── 轨道控制器 ───
const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true
controls.dampingFactor = 0.08
controls.minDistance = 4
controls.maxDistance = 350
controls.enablePan = true
controls.target.set(0, 0, 0)

// ─── 太阳系 ───
const solarSystem = new SolarSystem(scene)

// ─── 控制面板 ───
let speed = 1
let paused = false

const panel = new ControlPanel(
  (newSpeed) => { speed = newSpeed },
  (isPaused) => { paused = isPaused },
  (nameEn) => focusPlanet(nameEn),
)
panel.initPlanetButtons(
  solarSystem.planets.map(p => p.data),
  (nameEn) => focusPlanet(nameEn),
)

// ─── 行星聚焦 ───
function focusPlanet(nameEn) {
  const mesh = solarSystem.getPlanetMesh(nameEn)
  if (!mesh) return

  const worldPos = new THREE.Vector3()
  mesh.getWorldPosition(worldPos)

  const radius = mesh.geometry?.parameters?.radius || 1
  const distance = radius * 6 + 10

  const targetPos = new THREE.Vector3(
    worldPos.x + distance * 0.6,
    worldPos.y + distance * 0.5,
    worldPos.z + distance * 0.8,
  )

  animateCamera(targetPos, worldPos)
}

function animateCamera(targetPosition, lookAtTarget) {
  const startPos = camera.position.clone()
  const startTarget = controls.target.clone()
  const duration = 1200
  const startTime = performance.now()

  function step(now) {
    const t = Math.min((now - startTime) / duration, 1)
    const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2

    camera.position.lerpVectors(startPos, targetPosition, ease)
    controls.target.lerpVectors(startTarget, lookAtTarget, ease)

    if (t < 1) requestAnimationFrame(step)
  }
  requestAnimationFrame(step)
}

// ─── 响应窗口变化 ───
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
})

// ─── 动画循环 ───
const clock = new THREE.Clock()

function animate() {
  requestAnimationFrame(animate)

  const delta = clock.getDelta()
  controls.update()

  if (!paused) {
    solarSystem.update(delta, speed)
  }

  renderer.render(scene, camera)
}

animate()

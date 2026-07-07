/**
 * 太阳系行星数据
 * 轨道距离按艺术缩放，大小适当放大以保证可见性
 * 公转周期保持真实比例，自转周期调整为视觉舒适速度
 */
export const PLANET_DATA = [
  {
    name: '水星',
    nameEn: 'Mercury',
    color: 0xb5b5b5,
    radius: 0.38,
    orbitRadius: 8,
    orbitPeriod: 88,
    rotationPeriod: 20,       // 视觉速度：约 3.3s/圈
    tilt: 0.034,
    roughness: 0.8,
    metalness: 0.1,
  },
  {
    name: '金星',
    nameEn: 'Venus',
    color: 0xe8cda0,
    radius: 0.95,
    orbitRadius: 12,
    orbitPeriod: 225,
    rotationPeriod: -80,       // 逆向自转，约 13s/圈
    tilt: 177.4,
    roughness: 0.7,
    metalness: 0.05,
  },
  {
    name: '地球',
    nameEn: 'Earth',
    color: 0x4a90d9,
    radius: 1.0,
    orbitRadius: 16,
    orbitPeriod: 365,
    rotationPeriod: 30,        // 视觉速度：约 5s/圈，清晰可见自转
    tilt: 23.4,
    roughness: 0.5,
    metalness: 0.05,
    hasAtmosphere: true,
    hasClouds: true,
    // 月球数据 — 绕地球公转
    moon: {
      name: '月球',
      nameEn: 'Moon',
      radius: 0.27,            // 约地球的 1/4
      orbitRadius: 2.2,        // 距地球的视觉距离
      orbitPeriod: 27.3,       // 恒星月（真实值）
      rotationPeriod: 27.3,    // 潮汐锁定（真实值）
      tilt: 6.68,              // 轨道倾角
    },
  },
  {
    name: '火星',
    nameEn: 'Mars',
    color: 0xc1440e,
    radius: 0.53,
    orbitRadius: 22,
    orbitPeriod: 687,
    rotationPeriod: 25,        // 约 4.2s/圈
    tilt: 25.2,
    roughness: 0.8,
    metalness: 0.1,
  },
  {
    name: '木星',
    nameEn: 'Jupiter',
    color: 0xc88b3a,
    radius: 3.5,
    orbitRadius: 32,
    orbitPeriod: 4333,
    rotationPeriod: 6,         // 气态巨行星快速自转，约 1s/圈
    tilt: 3.1,
    roughness: 0.6,
    metalness: 0.0,
  },
  {
    name: '土星',
    nameEn: 'Saturn',
    color: 0xe8d191,
    radius: 2.9,
    orbitRadius: 44,
    orbitPeriod: 10759,
    rotationPeriod: 8,         // 约 1.3s/圈
    tilt: 26.7,
    roughness: 0.6,
    metalness: 0.0,
    hasRing: true,
    ringInner: 1.5,
    ringOuter: 2.8,
  },
  {
    name: '天王星',
    nameEn: 'Uranus',
    color: 0x9fc4e7,
    radius: 1.8,
    orbitRadius: 56,
    orbitPeriod: 30687,
    rotationPeriod: -18,        // 逆向自转，约 3s/圈
    tilt: 97.8,
    roughness: 0.5,
    metalness: 0.05,
  },
  {
    name: '海王星',
    nameEn: 'Neptune',
    color: 0x4166f5,
    radius: 1.7,
    orbitRadius: 68,
    orbitPeriod: 60190,
    rotationPeriod: 14,         // 约 2.3s/圈
    tilt: 28.3,
    roughness: 0.5,
    metalness: 0.05,
  },
]

export const SUN_RADIUS = 4
export const SUN_COLOR = 0xfff0a0

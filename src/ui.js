/**
 * 控制面板 UI
 */

export class ControlPanel {
  constructor(onSpeedChange, onTogglePause, onPlanetFocus) {
    this.speed = 1
    this.paused = false
    this.onSpeedChange = onSpeedChange
    this.onTogglePause = onTogglePause
    this.onPlanetFocus = onPlanetFocus
    this.panel = null
    this.planetList = []
    this._create()
  }

  _create() {
    const panel = document.createElement('div')
    panel.innerHTML = `
      <style>
        #control-panel {
          position: fixed;
          top: 16px;
          right: 16px;
          background: rgba(10, 15, 30, 0.88);
          border: 1px solid rgba(100, 160, 255, 0.3);
          border-radius: 12px;
          padding: 16px;
          color: #cde;
          font-family: -apple-system, 'PingFang SC', 'Microsoft YaHei', sans-serif;
          font-size: 13px;
          z-index: 100;
          min-width: 200px;
          backdrop-filter: blur(10px);
          user-select: none;
        }
        #control-panel h3 {
          margin: 0 0 12px 0;
          font-size: 15px;
          color: #fff;
          letter-spacing: 1px;
          text-align: center;
        }
        .ctrl-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 10px;
        }
        .ctrl-row label {
          color: #8ab4f8;
        }
        .ctrl-btn {
          background: rgba(60, 120, 220, 0.25);
          border: 1px solid rgba(100, 160, 255, 0.4);
          color: #cde;
          padding: 4px 12px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 13px;
          transition: all 0.2s;
        }
        .ctrl-btn:hover {
          background: rgba(60, 120, 220, 0.5);
          border-color: #8ab4f8;
        }
        .ctrl-btn.active {
          background: rgba(80, 160, 255, 0.45);
          border-color: #8ab4f8;
          color: #fff;
        }
        .speed-btns {
          display: flex;
          gap: 4px;
        }
        .planet-list {
          margin-top: 12px;
          border-top: 1px solid rgba(100, 160, 255, 0.2);
          padding-top: 10px;
        }
        .planet-list h4 {
          margin: 0 0 8px 0;
          font-size: 12px;
          color: #8ab4f8;
        }
        .planet-btn {
          display: block;
          width: 100%;
          text-align: left;
          background: none;
          border: none;
          color: #cde;
          padding: 4px 8px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
          transition: background 0.15s;
        }
        .planet-btn:hover {
          background: rgba(100, 160, 255, 0.2);
          color: #fff;
        }
        .planet-btn .dot {
          display: inline-block;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          margin-right: 6px;
          vertical-align: middle;
        }
      </style>
      <div id="control-panel">
        <h3>太阳系行星公转</h3>
        <div class="ctrl-row">
          <label>播放控制</label>
          <button class="ctrl-btn" id="pause-btn">暂停</button>
        </div>
        <div class="ctrl-row">
          <label>时间速度</label>
          <div class="speed-btns">
            <button class="ctrl-btn active" data-speed="1">1x</button>
            <button class="ctrl-btn" data-speed="10">10x</button>
            <button class="ctrl-btn" data-speed="50">50x</button>
            <button class="ctrl-btn" data-speed="100">100x</button>
          </div>
        </div>
        <div class="planet-list">
          <h4>快速定位</h4>
          <div id="planet-buttons"></div>
        </div>
      </div>
    `
    document.body.appendChild(panel)
    this.panel = panel.querySelector('#control-panel')

    // 暂停按钮
    const pauseBtn = this.panel.querySelector('#pause-btn')
    pauseBtn.addEventListener('click', () => {
      this.paused = !this.paused
      pauseBtn.textContent = this.paused ? '播放' : '暂停'
      this.onTogglePause(this.paused)
    })

    // 速度按钮
    this.panel.querySelectorAll('[data-speed]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.panel.querySelectorAll('[data-speed]').forEach(b => b.classList.remove('active'))
        btn.classList.add('active')
        this.speed = Number(btn.dataset.speed)
        this.onSpeedChange(this.speed)
      })
    })
  }

  /**
   * 生成行星快速定位按钮
   */
  initPlanetButtons(planets, onFocus) {
    const container = this.panel.querySelector('#planet-buttons')
    planets.forEach(p => {
      const btn = document.createElement('button')
      btn.className = 'planet-btn'
      const colorHex = '#' + p.color.toString(16).padStart(6, '0')
      btn.innerHTML = `<span class="dot" style="background:${colorHex}"></span>${p.name}`
      btn.addEventListener('click', () => onFocus(p.nameEn))
      container.appendChild(btn)
    })
  }

  getSpeed() { return this.speed }
  isPaused() { return this.paused }
}

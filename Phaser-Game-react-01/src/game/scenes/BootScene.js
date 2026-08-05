import Phaser from 'phaser'

// BootScene draws all the sprites we need at runtime using Phaser Graphics,
// then bakes them into textures. This keeps the demo dependency-free — there
// are no PNGs to load, so it runs anywhere immediately.
export default class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene')
  }

  create() {
    this.makeStar('star', 0xffd54a)
    this.makeBomb('bomb')
    this.makePlayer('player')
    this.makeDot('spark', 0xffe27a)
    this.makeDot('sparkBad', 0xff5a6e)

    this.scene.start('GameScene')
  }

  // A five-pointed star.
  makeStar(key, color) {
    const g = this.add.graphics()
    g.fillStyle(color, 1)
    const cx = 22
    const cy = 22
    const spikes = 5
    const outer = 20
    const inner = 9
    const points = []
    let rot = (Math.PI / 2) * 3
    const step = Math.PI / spikes
    for (let i = 0; i < spikes; i++) {
      points.push({ x: cx + Math.cos(rot) * outer, y: cy + Math.sin(rot) * outer })
      rot += step
      points.push({ x: cx + Math.cos(rot) * inner, y: cy + Math.sin(rot) * inner })
      rot += step
    }
    g.fillPoints(points, true)
    g.lineStyle(2, 0xffffff, 0.35)
    g.strokePoints(points, true)
    g.generateTexture(key, 44, 44)
    g.destroy()
  }

  // A round bomb with a little fuse.
  makeBomb(key) {
    const g = this.add.graphics()
    g.fillStyle(0x2b2b3a, 1)
    g.fillCircle(20, 24, 16)
    g.fillStyle(0x44445a, 1)
    g.fillCircle(15, 19, 5) // highlight
    g.lineStyle(3, 0xffa53a, 1)
    g.beginPath()
    g.moveTo(28, 12)
    g.lineTo(34, 4)
    g.strokePath()
    g.fillStyle(0xff5a2a, 1)
    g.fillCircle(35, 3, 3) // fuse spark
    g.generateTexture(key, 44, 44)
    g.destroy()
  }

  // The player's catching basket / paddle.
  makePlayer(key) {
    const g = this.add.graphics()
    const w = 96
    const h = 26
    g.fillStyle(0x7c5cff, 1)
    g.fillRoundedRect(0, 0, w, h, 12)
    g.fillStyle(0x9d84ff, 1)
    g.fillRoundedRect(6, 4, w - 12, 8, 6)
    g.generateTexture(key, w, h)
    g.destroy()
  }

  makeDot(key, color) {
    const g = this.add.graphics()
    g.fillStyle(color, 1)
    g.fillCircle(6, 6, 6)
    g.generateTexture(key, 12, 12)
    g.destroy()
  }
}

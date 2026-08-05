import Phaser from 'phaser'
import { EventBus } from '../EventBus'
import { GAME_WIDTH, GAME_HEIGHT } from '../config'

// Core gameplay: move the paddle left/right, catch falling stars for points,
// and dodge the bombs. Three misses/hits and it's game over. Difficulty ramps
// up over time by spawning faster and dropping items quicker.
export default class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene')
  }

  init() {
    this.score = 0
    this.lives = 3
    this.spawnDelay = 900
    this.fallSpeed = 180
    this.isOver = false
  }

  create() {
    this.drawBackground()

    // Player paddle.
    this.player = this.physics.add.sprite(GAME_WIDTH / 2, GAME_HEIGHT - 50, 'player')
    this.player.setCollideWorldBounds(true)
    this.player.body.setSize(96, 26)

    // Groups for falling objects.
    this.stars = this.physics.add.group()
    this.bombs = this.physics.add.group()

    this.physics.add.overlap(this.player, this.stars, this.collectStar, null, this)
    this.physics.add.overlap(this.player, this.bombs, this.hitBomb, null, this)

    // Input: keyboard + pointer/touch.
    this.cursors = this.input.keyboard.createCursorKeys()
    this.keys = this.input.keyboard.addKeys('A,D')
    this.input.on('pointermove', (p) => {
      if (!this.isOver) this.player.x = Phaser.Math.Clamp(p.worldX, 48, GAME_WIDTH - 48)
    })

    // Spawner — reschedules itself, speeding up as the game goes.
    this.spawnEvent = this.time.addEvent({
      delay: this.spawnDelay,
      loop: true,
      callback: this.spawnItem,
      callbackScope: this,
    })

    // Steady difficulty ramp.
    this.time.addEvent({
      delay: 5000,
      loop: true,
      callback: () => {
        this.spawnDelay = Math.max(320, this.spawnDelay - 70)
        this.fallSpeed = Math.min(420, this.fallSpeed + 24)
        this.spawnEvent.delay = this.spawnDelay
      },
    })

    this.emitState()

    // Let React reset us after a game over.
    EventBus.on('restart-game', this.restart, this)
    this.events.once('shutdown', () => EventBus.off('restart-game', this.restart, this))

    EventBus.emit('scene-ready', this)
  }

  drawBackground() {
    // Soft vertical gradient + scattered background stars.
    const g = this.add.graphics()
    g.fillGradientStyle(0x1a1c3a, 0x1a1c3a, 0x0f1020, 0x0f1020, 1)
    g.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT)

    // Deterministic scatter so it looks intentional.
    const rng = new Phaser.Math.RandomDataGenerator(['starcatcher'])
    for (let i = 0; i < 70; i++) {
      const x = rng.between(0, GAME_WIDTH)
      const y = rng.between(0, GAME_HEIGHT)
      const r = rng.realInRange(0.5, 1.8)
      g.fillStyle(0xffffff, rng.realInRange(0.1, 0.5))
      g.fillCircle(x, y, r)
    }
  }

  spawnItem() {
    if (this.isOver) return
    const x = Phaser.Math.Between(40, GAME_WIDTH - 40)
    // ~22% chance of a bomb.
    const isBomb = Phaser.Math.FloatBetween(0, 1) < 0.22
    const group = isBomb ? this.bombs : this.stars
    const key = isBomb ? 'bomb' : 'star'
    const item = group.create(x, -30, key)
    item.setVelocityY(this.fallSpeed + Phaser.Math.Between(-20, 40))
    item.setAngularVelocity(isBomb ? 0 : Phaser.Math.Between(-120, 120))
    item.setData('isBomb', isBomb)
  }

  collectStar(player, star) {
    this.burst(star.x, star.y, 'spark')
    star.destroy()
    this.score += 10
    this.emitState()
  }

  hitBomb(player, bomb) {
    this.burst(bomb.x, bomb.y, 'sparkBad')
    bomb.destroy()
    this.lives -= 1
    this.cameras.main.shake(180, 0.012)
    this.cameras.main.flash(120, 120, 20, 40)
    this.emitState()
    if (this.lives <= 0) this.gameOver()
  }

  burst(x, y, key) {
    const emitter = this.add.particles(x, y, key, {
      speed: { min: 60, max: 220 },
      angle: { min: 0, max: 360 },
      scale: { start: 1, end: 0 },
      lifespan: 500,
      quantity: 12,
      blendMode: 'ADD',
    })
    this.time.delayedCall(520, () => emitter.destroy())
  }

  update() {
    if (this.isOver) return

    const speed = 420
    const left = this.cursors.left.isDown || this.keys.A.isDown
    const right = this.cursors.right.isDown || this.keys.D.isDown
    if (left) this.player.setVelocityX(-speed)
    else if (right) this.player.setVelocityX(speed)
    else this.player.setVelocityX(0)

    // Recycle anything that falls off screen; a missed star costs nothing,
    // but keeps the world tidy.
    this.cleanup(this.stars)
    this.cleanup(this.bombs)
  }

  cleanup(group) {
    group.children.iterate((child) => {
      if (child && child.y > GAME_HEIGHT + 40) child.destroy()
      return true
    })
  }

  gameOver() {
    this.isOver = true
    this.player.setVelocityX(0)
    this.spawnEvent.paused = true
    this.stars.setVelocityY(0)
    this.bombs.setVelocityY(0)
    EventBus.emit('game-over', { score: this.score })
  }

  restart() {
    this.scene.restart()
  }

  emitState() {
    EventBus.emit('state-changed', { score: this.score, lives: this.lives })
  }
}

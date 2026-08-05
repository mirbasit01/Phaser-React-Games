import { useEffect, useRef } from 'react'
import Phaser from 'phaser'
import { createGameConfig } from './config'

// Mounts a Phaser game into a div and tears it down cleanly on unmount.
// Under React 18 StrictMode the effect runs twice in dev — the cleanup
// destroys the first instance so we never leak a canvas.
export default function PhaserGame() {
  const containerRef = useRef(null)
  const gameRef = useRef(null)

  useEffect(() => {
    if (gameRef.current) return
    const game = new Phaser.Game(createGameConfig(containerRef.current))
    gameRef.current = game

    return () => {
      game.destroy(true)
      gameRef.current = null
    }
  }, [])

  return <div ref={containerRef} className="phaser-container" />
}

import { useEffect, useState } from 'react'
import PhaserGame from './game/PhaserGame'
import { EventBus } from './game/EventBus'
import './App.css'

export default function App() {
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(3)
  const [gameOver, setGameOver] = useState(false)
  const [best, setBest] = useState(() => Number(localStorage.getItem('sc-best') || 0))

  useEffect(() => {
    const onState = ({ score, lives }) => {
      setScore(score)
      setLives(lives)
    }
    const onOver = ({ score }) => {
      setGameOver(true)
      setBest((prev) => {
        const next = Math.max(prev, score)
        localStorage.setItem('sc-best', String(next))
        return next
      })
    }

    EventBus.on('state-changed', onState)
    EventBus.on('game-over', onOver)
    return () => {
      EventBus.off('state-changed', onState)
      EventBus.off('game-over', onOver)
    }
  }, [])

  const restart = () => {
    setGameOver(false)
    setScore(0)
    setLives(3)
    EventBus.emit('restart-game')
  }

  return (
    <div className="app">
      <header className="topbar">
        <h1>⭐ Star Catcher</h1>
        <p className="subtitle">React + Phaser 2D demo</p>
      </header>

      <div className="hud">
        <div className="stat">
          <span className="label">Score</span>
          <span className="value">{score}</span>
        </div>
        <div className="stat">
          <span className="label">Lives</span>
          <span className="value">{'❤️'.repeat(Math.max(0, lives)) || '—'}</span>
        </div>
        <div className="stat">
          <span className="label">Best</span>
          <span className="value">{best}</span>
        </div>
      </div>

      <div className="stage">
        <PhaserGame />

        {gameOver && (
          <div className="overlay">
            <div className="card">
              <h2>Game Over</h2>
              <p>
                You scored <strong>{score}</strong>
              </p>
              <p className="best">Best: {best}</p>
              <button onClick={restart}>Play Again</button>
            </div>
          </div>
        )}
      </div>

      <footer className="help">
        Move with <kbd>←</kbd> <kbd>→</kbd> / <kbd>A</kbd> <kbd>D</kbd> or your mouse. Catch stars,
        dodge bombs 💣
      </footer>
    </div>
  )
}

import { useNavigate } from 'react-router-dom'
import './Homepage.css'
import ScrabbleLogo from './assets/Scrabble_2022.svg?react'
import OddOneOutLogo from './assets/OddOneOut.png'
import NertzLogo from './assets/Nertz/nertzApp.png'

interface Game {
  id: number
  name: string
  image?: string
  svg?: React.ComponentType<React.SVGProps<SVGSVGElement>>
  route?: string
}

const games: Game[] = [
  { id: 1, name: 'Odd One Out', image: OddOneOutLogo, route: '/odd-one-out' }
]

const scoreKeepers: Game[] = [
  { id: 2, name: 'Scrabble', svg: ScrabbleLogo, route: '/scrabble' },
  { id: 3, name: 'NERTZ', image: NertzLogo, route: '/nertz' }
]

function Homepage() {
  // useNavigate hook gives us a function to programmatically navigate
  const navigate = useNavigate()

  const handleGameClick = (game: Game) => {
    // Navigate to the game's route when clicked
    if (game.route) {
      navigate(game.route)
    }
  }

  const renderGameCard = (game: Game) => {
    const SvgComponent = game.svg
    return (
      <div
        key={game.id}
        className="game-card"
        onClick={() => handleGameClick(game)}
      >
        {SvgComponent ? (
          <SvgComponent className="Scrabble_2022" />
        ) : game.image ? (
          <img src={game.image} alt={game.name} className="game-image" />
        ) : (
          <h2>{game.name}</h2>
        )}
      </div>
    )
  }

  return (
    <div className="homepage">
      <section className="game-section">
        <h1>Games</h1>
        <div className="games-grid">
          {games.map(renderGameCard)}
        </div>
      </section>

      <section className="game-section">
        <h1>Score Keepers</h1>
        <div className="games-grid">
          {scoreKeepers.map(renderGameCard)}
        </div>
      </section>
    </div>
  )
}

export default Homepage
import { useNavigate } from 'react-router-dom'
import './Homepage.css'
import ScrabbleLogo from './assets/Scrabble_2022.svg?react'
import OddOneOutLogo from './assets/OddOneOut.png'

interface Game {
  id: number
  name: string
  image?: string
  svg?: React.ComponentType<React.SVGProps<SVGSVGElement>>
  route?: string // Add route path for each game
}

const tempGames: Game[] = [
  { id: 1, name: 'Scrabble', svg: ScrabbleLogo, route: '/scrabble' },
  { id: 2, name: 'Odd One Out', image: OddOneOutLogo, route: '/odd-one-out' },
  { id: 3, name: 'Ticket to Ride', image: '', route: '/ticket-to-ride' },
  { id: 4, name: 'Wingspan', image: '', route: '/wingspan' }
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

  return (
    <div className="homepage">
      <h1>Select Games</h1>
      <div className="games-grid">
        {tempGames.map(game => {
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
        })}
      </div>
    </div>
  )
}

export default Homepage
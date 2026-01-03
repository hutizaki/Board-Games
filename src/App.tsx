import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Homepage from './Homepage'
import ScrabbleBoard from './components/OddOneOut/Scrabble/ScrabbleBoard'
import OddOneOut from './OddOneOut'
import NERTZ from './components/OddOneOut/NERTZ/NERTZ'

function App() {
  const basename = import.meta.env.MODE === 'production' ? '/Board-Games' : '';
  
  return (
    <BrowserRouter basename={basename}>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/scrabble" element={<ScrabbleBoard />} />
        <Route path="/odd-one-out" element={<OddOneOut />} />
        <Route path="/nertz" element={<NERTZ />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

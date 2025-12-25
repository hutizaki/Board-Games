import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Homepage from './Homepage'
import ScrabbleBoard from './ScrabbleBoard'
import OddOneOut from './OddOneOut'

function App() {
  const basename = import.meta.env.MODE === 'production' ? '/Board-Games' : '';
  
  return (
    <BrowserRouter basename={basename}>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/scrabble" element={<ScrabbleBoard />} />
        <Route path="/odd-one-out" element={<OddOneOut />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

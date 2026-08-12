import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import Homepage from './Homepage'

/* Each game is its own chunk. They share almost no code and nobody plays two at
   once, so bundling them together made opening any one of them pay for all of
   them — NERTZ alone pulls in a large set of images. The homepage stays eager
   because it is the entry point. */
const ScrabbleBoard = lazy(() => import('./components/OddOneOut/Scrabble/ScrabbleBoard'))
const OddOneOut = lazy(() => import('./OddOneOut'))
const NERTZ = lazy(() => import('./components/OddOneOut/NERTZ/NERTZ'))
const Taboo = lazy(() => import('./components/Taboo/Taboo'))

function App() {
  const basename = import.meta.env.MODE === 'production' ? '/Board-Games' : '';

  return (
    <BrowserRouter basename={basename}>
      {/* No spinner: a chunk lands in a frame or two on a warm connection, and
          a flash of loading text reads worse than a beat of nothing. */}
      <Suspense fallback={null}>
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/scrabble" element={<ScrabbleBoard />} />
          <Route path="/odd-one-out" element={<OddOneOut />} />
          <Route path="/nertz" element={<NERTZ />} />
          <Route path="/taboo" element={<Taboo />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App

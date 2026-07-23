import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Games from './pages/Games';
import About from './pages/About';
import Leaderboard from './pages/Leaderboard';
import NumberGuess from './games/NumberGuess';
import ReactionTimer from './games/ReactionTimer';
import TicTacToe from './games/TicTacToe';

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/games" element={<Games />} />
          <Route path="/about" element={<About />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          
          {/* Game Routes */}
          <Route path="/games/number-guess" element={<NumberGuess />} />
          <Route path="/games/reaction-timer" element={<ReactionTimer />} />
          <Route path="/games/tic-tac-toe" element={<TicTacToe />} />
        </Routes>
      </Layout>
    </Router>
  );
}

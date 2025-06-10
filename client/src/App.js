import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

function Home() {
  return <h2>Bienvenue sur FarmShop !</h2>;
}

function NotFound() {
  return <h2>404 - Page non trouvée</h2>;
}

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

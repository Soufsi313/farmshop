import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Footer from './components/Footer';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminPanel from './pages/AdminPanel';
import Profile from './pages/Profile';
import EmailValidation from './pages/EmailValidation';
import AchatProducts from './pages/AchatProducts';
import AchatProductDetail from './pages/AchatProductDetail';
import Wishlist from './pages/Wishlist';

function NotFound() {
  return <h2>404 - Page non trouvée</h2>;
}

function App() {
  return (
    <Router>
      <Navbar />
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/email-validation" element={<EmailValidation />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/achat-products" element={<AchatProducts />} />
          <Route path="/produits/achat" element={<AchatProducts />} />
          <Route path="/produits/achat/:id" element={<AchatProductDetail />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;

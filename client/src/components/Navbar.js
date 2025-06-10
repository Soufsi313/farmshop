import React, { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaHome, FaBoxOpen, FaBlog, FaHeart, FaEnvelope, FaShoppingCart, FaUser } from 'react-icons/fa';

function Navbar() {
  // Simule l'état de connexion utilisateur (à remplacer par un vrai contexte ou Redux plus tard)
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Vérifie le localStorage pour un token ou un user (à remplacer par une vraie logique JWT)
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light shadow-sm" style={{ borderBottom: '2px solid #e6f4e6', background: '#fff' }}>
      <div className="container">
        <Link className="navbar-brand fw-bold" to="/" style={{ color: '#198754' }}>
          FarmShop
        </Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <NavLink className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')} to="/" style={({ isActive }) => ({ color: isActive ? '#198754' : '#222' })}>
                <FaHome className="me-1 mb-1" /> Accueil
              </NavLink>
            </li>
            <li className="nav-item dropdown">
              <NavLink className={({ isActive }) => 'nav-link dropdown-toggle' + (isActive ? ' active' : '')}
                to="#" id="produitsDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false"
                style={({ isActive }) => ({ color: isActive ? '#198754' : '#222' })}>
                <FaBoxOpen className="me-1 mb-1" /> Produits
              </NavLink>
              <ul className="dropdown-menu" aria-labelledby="produitsDropdown">
                <li><NavLink className="dropdown-item" to="/produits/achat">Produits d'achat</NavLink></li>
                <li><NavLink className="dropdown-item" to="/produits/location">Produits de location</NavLink></li>
              </ul>
            </li>
            <li className="nav-item">
              <NavLink className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')} to="/blog" style={({ isActive }) => ({ color: isActive ? '#198754' : '#222' })}>
                <FaBlog className="me-1 mb-1" /> Blog
              </NavLink>
            </li>
            {user && (
              <>
                <li className="nav-item dropdown">
                  <NavLink className={({ isActive }) => 'nav-link dropdown-toggle' + (isActive ? ' active' : '')}
                    to="#" id="panierDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false"
                    style={({ isActive }) => ({ color: isActive ? '#198754' : '#222' })}>
                    <FaShoppingCart className="me-1 mb-1" /> Panier
                  </NavLink>
                  <ul className="dropdown-menu" aria-labelledby="panierDropdown">
                    <li><NavLink className="dropdown-item" to="/panier/achat">Panier d'achat</NavLink></li>
                    <li><NavLink className="dropdown-item" to="/panier/location">Panier de location</NavLink></li>
                  </ul>
                </li>
                <li className="nav-item">
                  <NavLink className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')} to="/wishlist" style={({ isActive }) => ({ color: isActive ? '#198754' : '#222' })}>
                    <FaHeart className="me-1 mb-1" /> Wishlist
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')} to="/mes-commandes" style={({ isActive }) => ({ color: isActive ? '#198754' : '#222', fontWeight: 500 })}>
                    <FaBoxOpen className="me-1 mb-1" /> Mes commandes
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')} to="/mes-locations" style={({ isActive }) => ({ color: isActive ? '#198754' : '#222', fontWeight: 500 })}>
                    <FaShoppingCart className="me-1 mb-1" /> Mes locations
                  </NavLink>
                </li>
                {user && user.role === 'Admin' && (
                  <li className="nav-item">
                    <NavLink className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')} to="/admin" style={({ isActive }) => ({ color: isActive ? '#198754' : '#222', fontWeight: 500 })}>
                      <FaUser className="me-1 mb-1" /> Panel Admin
                    </NavLink>
                  </li>
                )}
              </>
            )}
            <li className="nav-item">
              <NavLink className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')} to="/contact" style={({ isActive }) => ({ color: isActive ? '#198754' : '#222' })}>
                <FaEnvelope className="me-1 mb-1" /> Contact
              </NavLink>
            </li>
            {!user && (
              <li className="nav-item">
                <NavLink className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')} to="/login" style={({ isActive }) => ({ color: isActive ? '#198754' : '#222', fontWeight: 500 })}>
                  <FaUser className="me-1 mb-1" /> Connexion
                </NavLink>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;

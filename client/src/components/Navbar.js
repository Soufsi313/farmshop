import React, { useState, useEffect, useContext } from 'react';
import { Link, NavLink } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaHome, FaBoxOpen, FaBlog, FaHeart, FaEnvelope, FaShoppingCart, FaUser, FaCheckCircle, FaSignOutAlt } from 'react-icons/fa';
import { FaRegStar } from 'react-icons/fa';
import { CartWishlistContext } from '../App';

function Navbar() {
  // Simule l'état de connexion utilisateur (à remplacer par un vrai contexte ou Redux plus tard)
  const [user, setUser] = useState(null);
  const { cartAchatCount, cartLocationCount, wishlistCount } = useContext(CartWishlistContext);

  useEffect(() => {
    // Vérifie le localStorage pour un token ou un user (à remplacer par une vraie logique JWT)
    let userData = null;
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) userData = JSON.parse(userStr);
    } catch (e) {
      localStorage.removeItem('user');
      userData = null;
    }
    if (userData) {
      setUser(userData);
    }
  }, []);

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light shadow-sm" style={{ borderBottom: '2px solid #e6f4e6', background: '#fff' }}>
      <div className="container-fluid px-5">
        <Link className="navbar-brand fw-bold me-4" to="/" style={{ color: '#198754', fontSize: '1.7rem', letterSpacing: '1px' }}>
          FarmShop
        </Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse justify-content-center" id="navbarNav">
          <ul className="navbar-nav w-100 justify-content-center gap-3">
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
                <li>
                  <NavLink className={({ isActive }) => 'dropdown-item' + (isActive ? ' active' : '')} to="/produits/achat">
                    Achat
                  </NavLink>
                </li>
                <li>
                  <NavLink className={({ isActive }) => 'dropdown-item' + (isActive ? ' active' : '')} to="/produits/location">
                    Location
                  </NavLink>
                </li>
              </ul>
            </li>
            <li className="nav-item">
              <NavLink className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')} to="/blog" style={({ isActive }) => ({ color: isActive ? '#198754' : '#222' })}>
                <FaBlog className="me-1 mb-1" /> Blog
              </NavLink>
            </li>
            {/* Contact et Connexion TOUJOURS visibles pour les visiteurs (non connectés) */}
            {!user && (
              <>
                <li className="nav-item">
                  <NavLink className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')} to="/contact" style={({ isActive }) => ({ color: isActive ? '#198754' : '#222' })}>
                    <FaEnvelope className="me-1 mb-1" /> Contact
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')} to="/login" style={({ isActive }) => ({ color: isActive ? '#198754' : '#222', fontWeight: 500 })}>
                    <FaUser className="me-1 mb-1" /> Connexion
                  </NavLink>
                </li>
              </>
            )}
            {user && (
              <>
                <li className="nav-item dropdown position-relative">
                  <NavLink className={({ isActive }) => 'nav-link dropdown-toggle' + (isActive ? ' active' : '')}
                    to="#" id="panierDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false"
                    style={({ isActive }) => ({ color: isActive ? '#198754' : '#222' })}>
                    <FaShoppingCart className="me-1 mb-1" /> Panier
                    {(cartAchatCount > 0 || cartLocationCount > 0) && <span className="badge bg-danger position-absolute top-0 start-100 translate-middle" style={{fontSize:'0.8em'}}>{cartAchatCount + cartLocationCount}</span>}
                  </NavLink>
                  <ul className="dropdown-menu" aria-labelledby="panierDropdown">
                    <li>
                      <NavLink className="dropdown-item position-relative" to="/panier/achat">
                        Panier d'achat
                        {cartAchatCount > 0 && <span className="badge bg-danger ms-2" style={{fontSize:'0.8em'}}>{cartAchatCount}</span>}
                      </NavLink>
                    </li>
                    <li>
                      <NavLink className="dropdown-item position-relative" to="/panier/location">
                        Panier de location
                        {cartLocationCount > 0 && <span className="badge bg-danger ms-2" style={{fontSize:'0.8em'}}>{cartLocationCount}</span>}
                      </NavLink>
                    </li>
                  </ul>
                </li>
                <li className="nav-item position-relative">
                  <NavLink className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')} to="/wishlist" style={({ isActive }) => ({ color: isActive ? '#ffc107' : '#222' })}>
                    <FaRegStar className="me-1 mb-1" style={{color:'#ffc107'}} /> Wishlist
                    {wishlistCount > 0 && <span className="badge bg-danger position-absolute top-0 start-100 translate-middle" style={{fontSize:'0.8em'}}>{wishlistCount}</span>}
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
                {/* Affiche Contact pour tous les utilisateurs (toujours visible) */}
                <li className="nav-item">
                  <NavLink className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')} to="/contact" style={({ isActive }) => ({ color: isActive ? '#198754' : '#222' })}>
                    <FaEnvelope className="me-1 mb-1" /> Contact
                  </NavLink>
                </li>
                {/* Affiche Profil juste à côté de Contact, visible uniquement pour User et Admin */}
                {(user && (user.role === 'User' || user.role === 'Admin')) && (
                  <li className="nav-item">
                    <NavLink className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')} to="/profile" style={({ isActive }) => ({ color: isActive ? '#198754' : '#222' })}>
                      <FaUser className="me-1 mb-1" /> Profil
                    </NavLink>
                  </li>
                )}
                {/* Affiche Connexion à droite de Contact UNIQUEMENT si non connecté */}
                {!user && (
                  <li className="nav-item">
                    <NavLink className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')} to="/login" style={({ isActive }) => ({ color: isActive ? '#198754' : '#222', fontWeight: 500 })}>
                      <FaUser className="me-1 mb-1" /> Connexion
                    </NavLink>
                  </li>
                )}
                {user && (
                  <li className="nav-item d-flex align-items-center ms-2">
                    {user.profilePicture ? (
                      <img
                        src={user.profilePicture.startsWith('/uploads/') ? `http://localhost:3000${user.profilePicture}` : user.profilePicture}
                        alt="Profil"
                        className="rounded-circle border border-success me-2"
                        style={{ width: 36, height: 36, objectFit: 'cover', background: '#fff' }}
                      />
                    ) : null}
                    <span className="text-success me-2 d-flex align-items-center" title="Connecté">
                      <FaCheckCircle className="me-1" /> Connecté
                    </span>
                    <button className="btn btn-outline-danger btn-sm ms-2" onClick={() => {
                      localStorage.removeItem('token');
                      localStorage.removeItem('user');
                      setUser(null);
                      window.location.href = '/';
                    }}>
                      <FaSignOutAlt className="me-1" /> Déconnexion
                    </button>
                  </li>
                )}
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;

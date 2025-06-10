import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [csrfToken, setCsrfToken] = useState('');
  const navigate = useNavigate();

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError('Tous les champs sont obligatoires.');
      return;
    }
    setError('');
    // Appel API pour login (exemple simplifié)
    try {
      // Remplace l'URL par celle de ton backend
      const res = await fetch('http://localhost:3000/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken
        },
        credentials: 'include',
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (res.ok && data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate('/');
        window.location.reload(); // recharge la navbar
      } else {
        setError(data.message || 'Identifiants invalides');
      }
    } catch (err) {
      setError('Erreur serveur');
    }
  };

  useEffect(() => {
    // Récupère le token CSRF au chargement de la page
    fetch('http://localhost:3000/csrf-token', { credentials: 'include' })
      .then(res => res.json())
      .then(data => setCsrfToken(data.csrfToken || ''));
  }, []);

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card p-4 shadow-sm">
            <h2 className="mb-4 text-success text-center">Connexion</h2>
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Adresse email</label>
                <input type="email" className="form-control" name="email" value={form.email} onChange={handleChange} autoFocus />
              </div>
              <div className="mb-3">
                <label className="form-label">Mot de passe</label>
                <input type="password" className="form-control" name="password" value={form.password} onChange={handleChange} />
              </div>
              <button type="submit" className="btn btn-success w-100">Se connecter</button>
            </form>
            <div className="text-center mt-3">
              <span>Pas encore de compte ? </span>
              <Link to="/register" className="text-success fw-bold">S'inscrire</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;

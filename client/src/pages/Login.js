import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function Login() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = e => {
    e.preventDefault();
    // Ici tu pourras ajouter la logique d'appel API
    if (!form.username || !form.password) {
      setError('Tous les champs sont obligatoires.');
      return;
    }
    setError('');
    // ... appel API ...
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card p-4 shadow-sm">
            <h2 className="mb-4 text-success text-center">Connexion</h2>
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Nom d'utilisateur</label>
                <input type="text" className="form-control" name="username" value={form.username} onChange={handleChange} autoFocus />
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

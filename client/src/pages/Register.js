import React, { useEffect, useState } from 'react';

function Register() {
  const [form, setForm] = useState({ email: '', password: '', username: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [csrfToken, setCsrfToken] = useState('');

  useEffect(() => {
    fetch('http://localhost:3000/csrf-token', { credentials: 'include' })
      .then(res => res.json())
      .then(data => setCsrfToken(data.csrfToken || ''));
  }, []);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.email || !form.password || !form.username) {
      setError('Tous les champs sont obligatoires.');
      return;
    }
    setError('');
    setSuccess('');
    try {
      // Récupère le token CSRF juste avant le POST pour garantir la synchro session/token
      const csrfRes = await fetch('http://localhost:3000/csrf-token', { credentials: 'include' });
      const csrfData = await csrfRes.json();
      const csrfToken = csrfData.csrfToken;
      const res = await fetch('http://localhost:3000/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken
        },
        credentials: 'include',
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(data.message || 'Inscription réussie. Vérifiez votre email.');
        setForm({ email: '', password: '', username: '' });
      } else {
        setError(data.message || 'Erreur lors de l’inscription.');
      }
    } catch (err) {
      setError('Erreur serveur');
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card p-4 shadow-sm">
            <h2 className="mb-4 text-success text-center">Inscription</h2>
            {error && <div className="alert alert-danger">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Nom d'utilisateur</label>
                <input type="text" className="form-control" name="username" value={form.username} onChange={handleChange} autoFocus />
              </div>
              <div className="mb-3">
                <label className="form-label">Adresse email</label>
                <input type="email" className="form-control" name="email" value={form.email} onChange={handleChange} />
              </div>
              <div className="mb-3">
                <label className="form-label">Mot de passe</label>
                <input type="password" className="form-control" name="password" value={form.password} onChange={handleChange} />
              </div>
              <button type="submit" className="btn btn-success w-100">S'inscrire</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;

import React, { useState } from 'react';

function Register() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (!form.email || !form.password) {
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
            <h2 className="mb-4 text-success text-center">Inscription</h2>
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
              <button type="submit" className="btn btn-success w-100">S'inscrire</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;

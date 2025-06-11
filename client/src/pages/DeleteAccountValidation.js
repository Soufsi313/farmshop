import React, { useEffect, useState } from 'react';

const DeleteAccountValidation = () => {
  const [status, setStatus] = useState('pending'); // 'pending', 'success', 'error'
  const [message, setMessage] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (!token) {
      setStatus('error');
      setMessage('Lien de validation invalide ou manquant.');
      return;
    }
    // Appel backend pour valider la suppression
    fetch(`http://localhost:3000/users/validate-delete?token=${encodeURIComponent(token)}`)
      .then(async res => {
        const text = await res.text();
        if (res.ok) {
          setStatus('success');
          setMessage('Votre compte a bien été supprimé définitivement.');
        } else {
          setStatus('error');
          setMessage(text || 'Erreur lors de la validation de la suppression.');
        }
      })
      .catch(() => {
        setStatus('error');
        setMessage('Erreur réseau lors de la validation.');
      });
  }, []);

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card p-4 shadow-lg border-0" style={{ background: '#f8fff5' }}>
            <div className="text-center mb-4">
              <span className="fw-bold" style={{ color: '#d32f2f', fontSize: '2.2rem', letterSpacing: '2px' }}>FarmShop</span>
            </div>
            <h2 className="mb-3 text-danger text-center">Validation de suppression</h2>
            {status === 'pending' && <div className="alert alert-info text-center">Validation en cours...</div>}
            {status === 'success' && <div className="alert alert-success text-center">{message}</div>}
            {status === 'error' && <div className="alert alert-danger text-center">{message}</div>}
            <div className="text-center mt-4">
              <a href="/login" className="btn btn-outline-secondary">Retour à la connexion</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteAccountValidation;

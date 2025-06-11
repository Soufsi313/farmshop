import React, { useState } from 'react';

function EmailValidation({ location }) {
  // Récupère le lien de validation depuis l'état de navigation ou le localStorage
  let verifyUrl = '';
  if (location && location.state && location.state.verifyUrl) {
    verifyUrl = location.state.verifyUrl;
    // Sauvegarde pour F5 ou navigation directe
    localStorage.setItem('verifyUrl', verifyUrl);
  } else {
    verifyUrl = localStorage.getItem('verifyUrl') || '';
  }

  const [validated, setValidated] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Gère le clic sur le bouton de validation
  const handleValidate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setValidated(false);
    try {
      const url = new URL(verifyUrl);
      // On fait un appel direct au backend (GET)
      const res = await fetch(verifyUrl);
      const text = await res.text();
      if (res.ok && text.includes('Votre email a bien été vérifié')) {
        setValidated(true);
      } else {
        setError(text || 'Erreur lors de la validation.');
      }
    } catch (err) {
      setError('Erreur lors de la validation.');
    }
    setLoading(false);
  };

  // Correction UX : n'affiche le bloc principal que si verifyUrl existe
  if (!verifyUrl) {
    return (
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="card p-4 shadow-lg border-0" style={{ background: '#f8fff5' }}>
              <div className="text-center mb-4">
                <span className="fw-bold" style={{ color: '#198754', fontSize: '2.2rem', letterSpacing: '2px' }}>FarmShop</span>
              </div>
              <h2 className="mb-3 text-success text-center">Validez votre email</h2>
              <div className="alert alert-warning text-center mb-0">Aucun lien de validation disponible.<br/>Merci de recommencer l'inscription ou contactez le support.</div>
              <div className="text-center mt-4">
                <a href="/login" className="btn btn-outline-secondary">Retour à la connexion</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card p-4 shadow-lg border-0" style={{ background: '#f8fff5' }}>
            <div className="text-center mb-4">
              <span className="fw-bold" style={{ color: '#198754', fontSize: '2.2rem', letterSpacing: '2px' }}>FarmShop</span>
            </div>
            <h2 className="mb-3 text-success text-center">Validez votre email</h2>
            <p className="mb-3 text-center">
              Un email de confirmation vous a été envoyé.<br />
              <strong>Si vous ne le recevez pas, cliquez sur le bouton ci-dessous pour activer votre compte :</strong>
            </p>
            {validated ? (
              <div className="alert alert-success text-center">
                <i className="bi bi-check-circle-fill me-2" style={{ fontSize: '1.5rem' }}></i>
                Votre email a bien été vérifié !<br />
                <a href="/login" className="btn btn-success mt-3">Se connecter</a>
              </div>
            ) : (
              <div className="text-center mb-3">
                <button
                  className="btn btn-success btn-lg px-4 shadow-sm"
                  style={{ fontWeight: 600, fontSize: '1.1rem', borderRadius: 8, background: '#198754' }}
                  onClick={handleValidate}
                  disabled={loading}
                >
                  {loading ? 'Validation en cours...' : 'Valider mon adresse email'}
                </button>
                <div className="mt-3">
                  <small>Ou copiez-collez ce lien dans votre navigateur :</small>
                  <div className="alert alert-light mt-2 border" style={{ wordBreak: 'break-all', background: '#fff' }}>{verifyUrl}</div>
                </div>
                {error && <div className="alert alert-danger mt-3">{error}</div>}
              </div>
            )}
            <div className="text-center mt-4">
              <a href="/login" className="btn btn-outline-secondary">Retour à la connexion</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EmailValidation;

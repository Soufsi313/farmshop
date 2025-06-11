import React, { useState, useEffect, useRef } from 'react';

const REASONS = [
  'Produits',
  'Blogs',
  'Mes commandes',
  'Mes locations',
  'Autres'
];

const Profile = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedReason, setSelectedReason] = useState(REASONS[0]);
  const [message, setMessage] = useState('');
  const [user, setUser] = useState(null);
  const [bioEdit, setBioEdit] = useState(false);
  const [bioValue, setBioValue] = useState('');
  const [inbox, setInbox] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profilePicture, setProfilePicture] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef();

  const fetchUser = async (userId) => {
    const res = await fetch(`http://localhost:3000/users/${userId}`, { credentials: 'include' });
    if (res.ok) {
      const data = await res.json();
      setUser(data.user);
      setBioValue(data.user.bio || '');
      setProfilePicture(data.user.profilePicture || null);
      localStorage.setItem('user', JSON.stringify(data.user));
    }
  };

  useEffect(() => {
    // Récupère l'utilisateur du localStorage
    const localUser = (() => {
      try {
        return JSON.parse(localStorage.getItem('user'));
      } catch {
        return null;
      }
    })();
    if (!localUser) {
      setUser(null);
      setLoading(false);
      return;
    }
    fetchUser(localUser.id);
    // Récupère la boîte de réception
    fetch(`http://localhost:3000/users/${localUser.id}/inbox`, {
      credentials: 'include',
    })
      .then(res => res.json())
      .then(data => setInbox(Array.isArray(data.inbox) ? data.inbox : []))
      .finally(() => setLoading(false));
  }, []);

  const handleBioSave = async () => {
    if (!user) return;
    const csrfRes = await fetch('http://localhost:3000/csrf-token', { credentials: 'include' });
    const csrfData = await csrfRes.json();
    await fetch(`http://localhost:3000/users/${user.id}/bio`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-csrf-token': csrfData.csrfToken
      },
      credentials: 'include',
      body: JSON.stringify({ bio: bioValue })
    });
    await fetchUser(user.id);
    setBioEdit(false);
  };

  const handleProfilePictureChange = async (e) => {
    if (!user || !e.target.files[0]) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('profilePicture', e.target.files[0]);
    const csrfRes = await fetch('http://localhost:3000/csrf-token', { credentials: 'include' });
    const csrfData = await csrfRes.json();
    const res = await fetch(`http://localhost:3000/users/${user.id}/profile-picture`, {
      method: 'PUT',
      headers: {
        'x-csrf-token': csrfData.csrfToken
      },
      credentials: 'include',
      body: formData
    });
    const data = await res.json();
    if (res.ok && data.profilePicture) {
      setProfilePicture(data.profilePicture);
      setUser({ ...user, profilePicture: data.profilePicture });
      localStorage.setItem('user', JSON.stringify({ ...user, profilePicture: data.profilePicture }));
    }
    setUploading(false);
  };

  const handleContactAdmin = () => {
    setShowModal(true);
  };

  const handleSend = () => {
    // TODO: envoyer la raison et le message à l'API contact-admin
    // Exemple: fetch('/api/contact-admin', ...)
    setShowModal(false);
    setMessage('');
    setSelectedReason(REASONS[0]);
    alert('Message envoyé à l\'administrateur.');
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-8 col-md-10">
          <div className="card shadow-lg border-0 p-4" style={{ background: '#f8fff5', borderRadius: 18 }}>
            <div className="row align-items-center mb-4">
              <div className="col-auto">
                {profilePicture ? (
                  <img src={profilePicture.startsWith('/uploads/') ? `http://localhost:3000${profilePicture}` : profilePicture} alt="Profil" className="rounded-circle border border-3 border-success" style={{ width: 120, height: 120, objectFit: 'cover', background: '#fff' }} />
                ) : (
                  <div className="d-flex align-items-center justify-content-center rounded-circle bg-light border border-3 border-success" style={{ width: 120, height: 120, fontSize: 48, color: '#aaa' }}>
                    <i className="bi bi-person-circle"></i>
                  </div>
                )}
                <input type="file" accept="image/*" ref={fileInputRef} style={{ display: 'none' }} onChange={handleProfilePictureChange} />
                <button className="btn btn-outline-success btn-sm mt-3 w-100" onClick={()=>fileInputRef.current.click()} disabled={uploading}>
                  {uploading ? 'Chargement...' : 'Changer la photo'}
                </button>
              </div>
              <div className="col ps-4">
                <h1 className="mb-2 text-success">Mon Profil</h1>
                <p className="mb-1"><b>Nom d'utilisateur :</b> {user?.username}</p>
                <p className="mb-1"><b>Email :</b> {user?.email}</p>
                <p className="mb-1"><b>Rôle :</b> {user?.role}</p>
              </div>
            </div>
            {loading ? (
              <div className="text-center py-5"><div className="spinner-border text-success" role="status"><span className="visually-hidden">Chargement...</span></div></div>
            ) : user ? (
              <div className="user-infos mb-4">
                <div className="mb-3">
                  <b>Bio :</b>
                  {bioEdit ? (
                    <>
                      <textarea value={bioValue} onChange={e => setBioValue(e.target.value)} className="form-control d-inline-block ms-2" style={{ minWidth: 220, minHeight: 60, maxWidth: 400, verticalAlign: 'middle', display: 'inline-block', width: 'auto' }} />
                      <button className="btn btn-success btn-sm ms-2" onClick={handleBioSave}>Enregistrer</button>
                      <button className="btn btn-outline-secondary btn-sm ms-2" onClick={()=>setBioEdit(false)}>Annuler</button>
                    </>
                  ) : (
                    <>
                      <span className="ms-2">{user.bio || <span className="text-muted">(Aucune bio)</span>}</span>
                      <button className="btn btn-outline-primary btn-sm ms-2" onClick={()=>setBioEdit(true)}>Modifier</button>
                    </>
                  )}
                </div>
                {/* Affichage de la boîte de réception */}
                <div className="mb-4">
                  <h4 className="mb-3">Boîte à réception</h4>
                  {inbox.length === 0 ? <div className="text-muted">Aucun message</div> : (
                    <ul className="list-unstyled">
                      {inbox.map((msg, idx) => (
                        <li key={idx} className={`mb-3 p-3 rounded border ${msg.lu ? 'bg-light' : 'bg-success bg-opacity-10'}`}>
                          <b>De :</b> {msg.from} <br/>
                          <b>Sujet :</b> {msg.subject} <br/>
                          <b>Message :</b> {msg.body} <br/>
                          <span className="text-muted small">{msg.date ? new Date(msg.date).toLocaleString() : ''}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ) : (
              <div className="alert alert-warning">Aucune information utilisateur trouvée.</div>
            )}
            <div className="text-center">
              <button onClick={handleContactAdmin} className="btn btn-warning mt-3 px-4 py-2 fw-bold">
                Contacter l'administrateur
              </button>
            </div>
          </div>
        </div>
      </div>
      {showModal && (
        <div className="modal fade show" style={{ display: 'block', background: 'rgba(0,0,0,0.35)' }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content p-4 position-relative" style={{ borderRadius: 16 }}>
              <button onClick={() => setShowModal(false)} type="button" className="btn-close position-absolute end-0 top-0 m-3" aria-label="Fermer"></button>
              <h2 className="mb-3 fw-bold fs-4 text-success text-center">Contacter l'administrateur</h2>
              <label className="fw-semibold">Raison&nbsp;:
                <select value={selectedReason} onChange={e => setSelectedReason(e.target.value)} className="form-select d-inline-block w-auto ms-2">
                  {REASONS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </label>
              <br /><br />
              <label className="fw-semibold">Message&nbsp;:
                <textarea value={message} onChange={e => setMessage(e.target.value)} rows={4} className="form-control mt-2" style={{ minHeight: 80 }} />
              </label>
              <div className="mt-4 d-flex justify-content-end gap-2">
                <button onClick={() => setShowModal(false)} className="btn btn-secondary">Annuler</button>
                <button onClick={handleSend} className="btn btn-primary" style={{ background: '#1a2233', color: '#fff', border: 'none' }} disabled={!message.trim()}>Envoyer</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;

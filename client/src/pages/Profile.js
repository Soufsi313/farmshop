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
  const [inboxPage, setInboxPage] = useState(1);
  const [inboxTotal, setInboxTotal] = useState(0);
  const [replyMsg, setReplyMsg] = useState('');
  const [replyTo, setReplyTo] = useState(null); // {msg, idx}
  const [replySuccess, setReplySuccess] = useState('');
  const [replyError, setReplyError] = useState('');
  const [threads, setThreads] = useState([]);
  const [threadsLoading, setThreadsLoading] = useState(true);
  const inboxLimit = 10;
  const THREADS_PAGE_SIZE = 5;
  const [threadsPage, setThreadsPage] = useState({}); // {threadId: pageNumber}
  const fileInputRef = useRef();
  const [isSubscribedNewsletter, setIsSubscribedNewsletter] = useState(false);
  const [newsletterLoading, setNewsletterLoading] = useState(false);
  const [newsletterMsg, setNewsletterMsg] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteMsg, setDeleteMsg] = useState('');

  const fetchUser = async (userId) => {
    const res = await fetch(`http://localhost:3000/users/${userId}`, { credentials: 'include' });
    if (!res.ok) {
      setUser(null);
      setBioValue('');
      setProfilePicture(null);
      return;
    }
    const data = await res.json();
    setUser(data.user);
    setBioValue(data.user.bio || '');
    setProfilePicture(data.user.profilePicture || null);
    localStorage.setItem('user', JSON.stringify(data.user));
  };

  // Nouvelle fonction pour charger la page de la boîte de réception
  const fetchInbox = async (userId, page = 1) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`http://localhost:3000/messages/${userId}/inbox?page=${page}&limit=${inboxLimit}`, {
      credentials: 'include',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) {
      setInbox([]);
      setInboxTotal(0);
      return;
    }
    const data = await res.json();
    setInbox(Array.isArray(data.inbox) ? data.inbox : []);
    setInboxTotal(data.total || 0);
  };

  const fetchThreads = async (userId) => {
    setThreadsLoading(true);
    const token = localStorage.getItem('token');
    const res = await fetch(`http://localhost:3000/messages/${userId}/threads`, {
      credentials: 'include',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) {
      setThreads([]);
      setThreadsLoading(false);
      return;
    }
    const data = await res.json();
    if (data.threads) {
      // Trie chaque thread par date croissante
      Object.values(data.threads).forEach(arr => arr.sort((a, b) => new Date(a.date) - new Date(b.date)));
      setThreads(data.threads);
    } else {
      setThreads([]);
    }
    setThreadsLoading(false);
  };

  useEffect(() => {
    // Récupère l'utilisateur du localStorage
    const localUser = (() => {
      try {
        const userStr = localStorage.getItem('user');
        if (!userStr) return null;
        return JSON.parse(userStr);
      } catch (e) {
        // Si la valeur n'est pas un JSON valide, on la supprime pour éviter les erreurs récurrentes
        localStorage.removeItem('user');
        return null;
      }
    })();
    if (!localUser) {
      setUser(null);
      setLoading(false);
      return;
    }
    fetchUser(localUser.id);
    fetchInbox(localUser.id, inboxPage).finally(() => setLoading(false));
    fetchThreads(localUser.id);
    // Vérifie le statut d'abonnement à la newsletter
    if (localUser?.email) {
      fetch(`http://localhost:3000/newsletter/status?email=${encodeURIComponent(localUser.email)}`)
        .then(res => res.json())
        .then(data => setIsSubscribedNewsletter(!!data.isSubscribed))
        .catch(() => setIsSubscribedNewsletter(false));
    }
  }, [inboxPage]);

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
    if (!res.ok) {
      setUploading(false);
      alert('Erreur lors du changement de photo de profil.');
      return;
    }
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

  const handleSend = async () => {
    const adminId = 3;
    if (!user?.id) {
      alert("Vous devez être connecté pour contacter l'administrateur.");
      return;
    }
    const csrfRes = await fetch('http://localhost:3000/csrf-token', { credentials: 'include' });
    const csrfData = await csrfRes.json();
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:3000/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrfData.csrfToken,
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify({
          toId: adminId,
          fromId: user?.id,
          subject: selectedReason,
          body: message
        })
      });
      if (!res.ok) {
        alert('Erreur lors de l\'envoi du message.');
        return;
      }
      const data = await res.json();
      setShowModal(false);
      setMessage('');
      setSelectedReason(REASONS[0]);
      alert('Message envoyé à l\'administrateur.');
      // Après envoi, recharger la boîte de réception de l'admin si c'est lui qui s'auto-envoie un message
      if (user && user.id === adminId) {
        await fetchInbox(user.id, inboxPage);
      }
    } catch (err) {
      alert('Erreur réseau lors de l\'envoi du message.');
    }
  };

  // Suppression d'un message traité
  const handleDeleteInboxMessage = async (msgIdxOrId) => {
    if (!user) return;
    try {
      const msgId = inbox[msgIdxOrId]?.id || msgIdxOrId; // Support index ou id direct
      const csrfRes = await fetch('http://localhost:3000/csrf-token', { credentials: 'include' });
      const csrfData = await csrfRes.json();
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:3000/messages/${user.id}/${msgId}`, {
        method: 'DELETE',
        headers: {
          'x-csrf-token': csrfData.csrfToken,
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      });
      if (!res.ok) {
        alert('Erreur lors de la suppression du message.');
        return;
      }
      const data = await res.json();
      await fetchInbox(user.id, inboxPage);
      await fetchThreads(user.id);
    } catch (err) {
      alert('Erreur réseau lors de la suppression du message.');
    }
  };

  // Fonction pour répondre à un message (admin)
  const handleReply = async () => {
    if (!replyTo || !user) return;
    setReplyError('');
    setReplySuccess('');
    try {
      const csrfRes = await fetch('http://localhost:3000/csrf-token', { credentials: 'include' });
      const csrfData = await csrfRes.json();
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:3000/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrfData.csrfToken,
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify({
          toId: replyTo.msg.fromId,
          fromId: user.id,
          subject: 'Réponse à votre message',
          body: replyMsg,
          threadId: replyTo.msg.threadId
        })
      });
      if (!res.ok) {
        setReplyError('Erreur lors de l\'envoi de la réponse.');
        return;
      }
      const data = await res.json();
      if (res.ok) {
        setReplySuccess('Réponse envoyée !');
        setReplyMsg('');
        setReplyTo(null);
        // Rafraîchir la boîte de réception après envoi
        await fetchInbox(user.id, inboxPage);
      } else {
        setReplyError(data.message || 'Erreur lors de l\'envoi de la réponse.');
        if (data.message && data.message.toLowerCase().includes('csrf')) {
          alert('Erreur CSRF : veuillez rafraîchir la page et réessayer.');
        }
      }
    } catch (err) {
      setReplyError('Erreur serveur');
    }
  };

  // Helper pour paginer les messages d'un thread
  const getPaginatedMessages = (messages, threadId) => {
    const page = threadsPage[threadId] || 1;
    const start = (page - 1) * THREADS_PAGE_SIZE;
    return messages.slice(start, start + THREADS_PAGE_SIZE);
  };

  // Helper pour supprimer un message dans un thread (pagination)
  const handleDeleteThreadMessage = (threadId, idxInPage) => {
    const messages = threads[threadId] || [];
    const currentPage = threadsPage[threadId] || 1;
    const paginated = getPaginatedMessages(messages, threadId);
    const msg = paginated[idxInPage];
    if (msg && msg.id) {
      handleDeleteInboxMessage(msg.id);
    } else {
      alert("Impossible de supprimer ce message (id non trouvé)");
    }
  };

  const handleSubscribeNewsletter = async () => {
    if (!user?.email) return;
    setNewsletterLoading(true);
    setNewsletterMsg('');
    try {
      const csrfRes = await fetch('http://localhost:3000/csrf-token', { credentials: 'include' });
      const csrfData = await csrfRes.json();
      const res = await fetch('http://localhost:3000/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrfData.csrfToken
        },
        credentials: 'include',
        body: JSON.stringify({ email: user.email, userId: user.id })
      });
      if (res.ok) {
        setIsSubscribedNewsletter(true);
        setNewsletterMsg('Inscription à la newsletter réussie !');
      } else {
        setNewsletterMsg("Erreur lors de l'inscription à la newsletter.");
      }
    } catch {
      setNewsletterMsg("Erreur réseau lors de l'inscription.");
    }
    setNewsletterLoading(false);
  };

  const handleUnsubscribeNewsletter = async () => {
    if (!user?.email) return;
    setNewsletterLoading(true);
    setNewsletterMsg('');
    try {
      const csrfRes = await fetch('http://localhost:3000/csrf-token', { credentials: 'include' });
      const csrfData = await csrfRes.json();
      const res = await fetch('http://localhost:3000/newsletter/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrfData.csrfToken
        },
        credentials: 'include',
        body: JSON.stringify({ email: user.email })
      });
      if (res.ok) {
        setIsSubscribedNewsletter(false);
        setNewsletterMsg('Désabonnement réussi.');
      } else {
        setNewsletterMsg('Erreur lors du désabonnement.');
      }
    } catch {
      setNewsletterMsg('Erreur réseau lors du désabonnement.');
    }
    setNewsletterLoading(false);
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
                <div className="mb-2">
                  {isSubscribedNewsletter ? (
                    <button className="btn btn-outline-danger btn-sm me-2" onClick={handleUnsubscribeNewsletter} disabled={newsletterLoading}>
                      Se désinscrire de la newsletter
                    </button>
                  ) : (
                    <button className="btn btn-outline-success btn-sm me-2" onClick={handleSubscribeNewsletter} disabled={newsletterLoading}>
                      S'inscrire à la newsletter
                    </button>
                  )}
                  {newsletterMsg && <span className="ms-2 small text-success">{newsletterMsg}</span>}
                </div>
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
                    <>
                    <ul className="list-unstyled" style={{ background: '#f9fafb', borderRadius: 12, boxShadow: '0 2px 8px #e0e0e0', padding: 16 }}>
                      {inbox.map((msg, idx) => (
                        <li key={idx} className={`mb-3 p-3 rounded border position-relative ${msg.lu ? 'bg-white' : 'bg-light'} inbox-message-item`} style={{ borderColor: msg.lu ? '#e0e0e0' : '#b6e7c9', boxShadow: msg.lu ? 'none' : '0 2px 8px #e0ffe0' }}>
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <span><b>De :</b> {msg.from}</span>
                            <span className="text-muted small">{msg.date ? new Date(msg.date).toLocaleString() : ''}</span>
                          </div>
                          <div><b>Sujet :</b> {msg.subject}</div>
                          <div className="mb-2"><b>Message :</b> {msg.body}</div>
                          {/* On masque l'affichage du threadId pour ne pas polluer l'UI */}
                          {/* {msg.threadId && (
                            <div className="mb-2"><span className="badge bg-info text-dark">Fil : {msg.threadId.slice(0, 8)}</span></div>
                          )} */}
                          <div className="d-flex align-items-center gap-2 mt-2">
                            {msg.traite && <span className="badge bg-success">Traité</span>}
                            <button className="btn btn-outline-danger btn-sm" onClick={() => handleDeleteInboxMessage(idx)}>
                              Supprimer
                            </button>
                            {user?.role === 'Admin' && (
                              msg.fromId ? (
                                <button className="btn btn-outline-primary btn-sm" onClick={() => { setReplyTo({msg, idx}); setReplyMsg(''); setReplySuccess(''); setReplyError(''); }}>
                                  Répondre
                                </button>
                              ) : (
                                <span className="badge bg-secondary">Utilisateur anonyme, réponse impossible</span>
                              )
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                    {/* Pagination */}
                    <nav>
                      <ul className="pagination justify-content-center">
                        {Array.from({ length: Math.ceil(inboxTotal / inboxLimit) }, (_, i) => (
                          <li key={i} className={`page-item${inboxPage === i + 1 ? ' active' : ''}`}>
                            <button className="page-link" onClick={() => setInboxPage(i + 1)}>{i + 1}</button>
                          </li>
                        ))}
                      </ul>
                    </nav>
                    {/* Formulaire de réponse admin */}
                    {replyTo && (
                      <div className="card p-3 mt-4">
                        <h5>Répondre à : {replyTo.msg.subject}</h5>
                        {replyError && <div className="alert alert-danger">{replyError}</div>}
                        {replySuccess && <div className="alert alert-success">{replySuccess}</div>}
                        <textarea className="form-control mb-2" value={replyMsg} onChange={e => setReplyMsg(e.target.value)} rows={3} />
                        <button className="btn btn-success" onClick={handleReply} disabled={!replyMsg.trim()}>Envoyer</button>
                        <button className="btn btn-secondary ms-2" onClick={() => setReplyTo(null)}>Annuler</button>
                      </div>
                    )}
                    </>
                  )}
                </div>
                {/* Affichage des fils de discussion (vue conversation) */}
                <div className="mb-4">
                  <h4 className="mb-3">Conversations</h4>
                  {threadsLoading ? (
                    <div className="text-muted">Chargement des conversations...</div>
                  ) : Object.keys(threads).length === 0 ? (
                    <div className="text-muted">Aucune conversation</div>
                  ) : (
                    Object.entries(threads).map(([threadId, messages], tIdx) => {
                      const paginated = getPaginatedMessages(messages, threadId);
                      const totalPages = Math.ceil(messages.length / THREADS_PAGE_SIZE);
                      const currentPage = threadsPage[threadId] || 1;
                      return (
                        <div key={threadId} className="card mb-4 shadow-sm" style={{ borderRadius: 14, background: '#fff' }}>
                          <div className="card-header bg-light" style={{ borderRadius: '14px 14px 0 0' }}>
                            <b>Fil #{tIdx + 1}</b> &nbsp;
                            <span className="text-muted small">({messages.length} message{messages.length > 1 ? 's' : ''})</span>
                          </div>
                          <div className="card-body p-3">
                            {paginated.map((msg, idx) => (
                              <div key={idx + (currentPage-1)*THREADS_PAGE_SIZE} className="mb-3 pb-2 border-bottom" style={{ borderColor: '#f0f0f0' }}>
                                <div className="d-flex justify-content-between align-items-center mb-1">
                                  <span><b>{msg.from}</b> <span className="text-muted small">{msg.date ? new Date(msg.date).toLocaleString() : ''}</span></span>
                                  {msg.traite && <span className="badge bg-success">Traité</span>}
                                </div>
                                <div><b>Sujet :</b> {msg.subject}</div>
                                <div className="mb-1"><b>Message :</b> {msg.body}</div>
                                <div className="d-flex align-items-center gap-2 mt-1">
                                  <button className="btn btn-outline-danger btn-sm" onClick={() => handleDeleteThreadMessage(threadId, idx)}>
                                    Supprimer
                                  </button>
                                  {user?.role === 'Admin' && msg.fromId && (
                                    <button className="btn btn-outline-primary btn-sm" onClick={() => { setReplyTo({msg, idx: idx + (currentPage-1)*THREADS_PAGE_SIZE}); setReplyMsg(''); setReplySuccess(''); setReplyError(''); }}>
                                      Répondre
                                    </button>
                                  )}
                                  {user?.role === 'Admin' && !msg.fromId && (
                                    <span className="badge bg-secondary">Utilisateur anonyme, réponse impossible</span>
                                  )}
                                </div>
                              </div>
                            ))}
                            {/* Pagination du fil */}
                            {totalPages > 1 && (
                              <nav>
                                <ul className="pagination justify-content-center mt-2 mb-0">
                                  {Array.from({ length: totalPages }, (_, i) => (
                                    <li key={i} className={`page-item${currentPage === i + 1 ? ' active' : ''}`}>
                                      <button className="page-link" onClick={() => setThreadsPage(p => ({ ...p, [threadId]: i + 1 }))}>{i + 1}</button>
                                    </li>
                                  ))}
                                </ul>
                              </nav>
                            )}
                          </div>
                        </div>
                      );
                    })
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
            <div className="text-center mt-4">
              <button className="btn btn-outline-danger" onClick={() => setShowDeleteDialog(true)}>
                Supprimer mon compte
              </button>
              {deleteMsg && <div className="alert alert-info mt-3">{deleteMsg}</div>}
            </div>
            {showDeleteDialog && (
              <div className="modal fade show" style={{ display: 'block', background: 'rgba(0,0,0,0.35)' }} tabIndex="-1">
                <div className="modal-dialog modal-dialog-centered">
                  <div className="modal-content p-4 position-relative" style={{ borderRadius: 16 }}>
                    <button onClick={() => setShowDeleteDialog(false)} type="button" className="btn-close position-absolute end-0 top-0 m-3" aria-label="Fermer"></button>
                    <h2 className="mb-3 fw-bold fs-4 text-danger text-center">Supprimer mon compte</h2>
                    <p className="mb-3">Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.<br/>Un email de confirmation vous sera envoyé et vous pourrez télécharger vos données.</p>
                    <div className="d-flex justify-content-end gap-2">
                      <button className="btn btn-secondary" onClick={() => setShowDeleteDialog(false)}>Annuler</button>
                      <button className="btn btn-danger" disabled={deleteLoading} onClick={async () => {
                        setDeleteLoading(true);
                        setDeleteMsg('');
                        try {
                          const csrfRes = await fetch('http://localhost:3000/csrf-token', { credentials: 'include' });
                          const csrfData = await csrfRes.json();
                          const token = localStorage.getItem('token');
                          // Suppression du compte (soft delete)
                          const res = await fetch(`http://localhost:3000/users/soft-delete-account/${user.id}`, {
                            method: 'DELETE',
                            headers: {
                              'x-csrf-token': csrfData.csrfToken,
                              'Authorization': `Bearer ${token}`
                            },
                            credentials: 'include'
                          });
                          if (!res.ok) {
                            setDeleteMsg("Erreur lors de la suppression du compte.");
                            setDeleteLoading(false);
                            return;
                          }
                          // Récupérer le statut d'envoi de l'email
                          let emailSent = true;
                          let emailError = null;
                          try {
                            const data = await res.json();
                            emailSent = data.emailSent;
                            emailError = data.emailError;
                          } catch {}
                          // Téléchargement des données utilisateur
                          const downloadRes = await fetch(`http://localhost:3000/users/download-data/${user.id}`, {
                            headers: { 'Authorization': `Bearer ${token}` },
                            credentials: 'include'
                          });
                          if (downloadRes.ok) {
                            const blob = await downloadRes.blob();
                            const url = window.URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `mes_donnees_farmshop_${user.id}.zip`;
                            document.body.appendChild(a);
                            a.click();
                            a.remove();
                            if (emailSent) {
                              setDeleteMsg('Votre compte a été supprimé. Un email de confirmation vous a été envoyé. Vos données ont été téléchargées.');
                            } else {
                              setDeleteMsg('Votre compte a été supprimé. Vos données ont été téléchargées. <b style="color:#d32f2f">Erreur lors de l’envoi de l’email de confirmation.</b>');
                            }
                            // Déconnexion automatique
                            setTimeout(() => {
                              localStorage.removeItem('token');
                              localStorage.removeItem('user');
                              window.location.href = '/';
                            }, 4000);
                          } else {
                            setDeleteMsg('Compte supprimé, mais erreur lors du téléchargement des données.');
                          }
                        } catch {
                          setDeleteMsg('Erreur réseau lors de la suppression.');
                        }
                        setDeleteLoading(false);
                      }}>
                        Oui, supprimer mon compte
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
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

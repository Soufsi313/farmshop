import React, { useState, useEffect } from 'react';

function AdminInbox({ userId }) {
  const [inbox, setInbox] = useState([]);
  const [selectedMsg, setSelectedMsg] = useState(null);
  const [reply, setReply] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  useEffect(() => {
    const fetchInbox = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`http://localhost:3000/users/${userId}/inbox?page=${page}&limit=${limit}`, { credentials: 'include' });
        const data = await res.json();
        if (res.ok) {
          setInbox(Array.isArray(data.inbox) ? data.inbox : []);
          setTotal(data.total || 0);
        } else {
          setError(data.message || 'Erreur lors du chargement de la boîte à réception.');
        }
      } catch (err) {
        setError('Erreur serveur');
      }
      setLoading(false);
    };
    if (userId) fetchInbox();
  }, [userId, page]);

  const handleReply = async () => {
    if (!selectedMsg) return;
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const csrfRes = await fetch('http://localhost:3000/csrf-token', { credentials: 'include' });
      const csrfData = await csrfRes.json();
      const res = await fetch(`http://localhost:3000/users/${userId}/inbox`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrfData.csrfToken
        },
        credentials: 'include',
        body: JSON.stringify({
          from: 'admin',
          subject: 'Réponse à votre message',
          body: reply,
          threadId: selectedMsg.threadId // clé pour le fil de discussion
        })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess('Réponse envoyée !');
        setReply('');
        setSelectedMsg(null);
      } else {
        setError(data.message || 'Erreur lors de l\'envoi de la réponse.');
      }
    } catch (err) {
      setError('Erreur serveur');
    }
    setLoading(false);
  };

  return (
    <div>
      <h3>Boîte de réception utilisateur</h3>
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
      {loading ? <div>Chargement...</div> : (
        <ul className="list-group mb-3">
          {inbox.map((msg, idx) => (
            <li key={idx} className="list-group-item">
              <b>De :</b> {msg.from} <br/>
              <b>Sujet :</b> {msg.subject} <br/>
              <b>Message :</b> {msg.body} <br/>
              <span className="text-muted small">{msg.date ? new Date(msg.date).toLocaleString() : ''}</span>
              <button className="btn btn-sm btn-outline-primary ms-3" onClick={() => setSelectedMsg(msg)}>
                Répondre
              </button>
            </li>
          ))}
        </ul>
      )}
      {/* Pagination */}
      <nav>
        <ul className="pagination justify-content-center">
          {Array.from({ length: Math.ceil(total / limit) }, (_, i) => (
            <li key={i} className={`page-item${page === i + 1 ? ' active' : ''}`}>
              <button className="page-link" onClick={() => setPage(i + 1)}>{i + 1}</button>
            </li>
          ))}
        </ul>
      </nav>
      {/* Formulaire de réponse */}
      {selectedMsg && (
        <div className="card p-3 mt-4">
          <h5>Répondre à : {selectedMsg.subject}</h5>
          <textarea className="form-control mb-2" value={reply} onChange={e => setReply(e.target.value)} rows={3} />
          <button className="btn btn-success" onClick={handleReply} disabled={!reply.trim() || loading}>Envoyer</button>
          <button className="btn btn-secondary ms-2" onClick={() => setSelectedMsg(null)}>Annuler</button>
        </div>
      )}
    </div>
  );
}

export default AdminInbox;

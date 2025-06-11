import React, { useState } from 'react';

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

  // Récupération des infos utilisateur depuis le localStorage
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem('user'));
    } catch {
      return null;
    }
  })();

  return (
    <div className="profile-page">
      <h1>Mon Profil</h1>
      {user ? (
        <div className="user-infos" style={{marginBottom:24}}>
          <p><b>Nom d'utilisateur :</b> {user.username}</p>
          <p><b>Email :</b> {user.email}</p>
          <p><b>Rôle :</b> {user.role}</p>
          {user.bio && <p><b>Bio :</b> {user.bio}</p>}
          {user.profilePicture && <div style={{marginTop:8}}><img src={user.profilePicture} alt="Profil" style={{maxWidth:120,borderRadius:8}} /></div>}
          {/* Affichage de la boîte de réception */}
          {user.inbox && Array.isArray(user.inbox) && user.inbox.length > 0 && (
            <div style={{marginTop:24}}>
              <h4>Boîte à réception</h4>
              <ul style={{paddingLeft:0,listStyle:'none'}}>
                {user.inbox.map((msg, idx) => (
                  <li key={idx} style={{border:'1px solid #eee',borderRadius:6,padding:10,marginBottom:8,background:msg.lu?'#f8f8f8':'#e6f4e6'}}>
                    <b>De :</b> {msg.from} <br/>
                    <b>Sujet :</b> {msg.subject} <br/>
                    <b>Message :</b> {msg.body} <br/>
                    <span style={{fontSize:12,color:'#888'}}>{msg.date ? new Date(msg.date).toLocaleString() : ''}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {/* Affichage des documents (exemple, à adapter selon ta structure) */}
          {user.documents && Array.isArray(user.documents) && user.documents.length > 0 && (
            <div style={{marginTop:24}}>
              <h4>Documents</h4>
              <ul>
                {user.documents.map((doc, idx) => (
                  <li key={idx}><a href={doc.url} target="_blank" rel="noopener noreferrer">{doc.name || doc.url}</a></li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <div className="alert alert-warning">Aucune information utilisateur trouvée.</div>
      )}
      <button onClick={handleContactAdmin} className="btn btn-warning" style={{marginTop: '1rem'}}>
        Contacter l'administrateur
      </button>
      {showModal && (
        <div className="modal-overlay" style={{
          position:'fixed',top:0,left:0,right:0,bottom:0,
          background:'rgba(0,0,0,0.35)',
          display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000
        }}>
          <div className="modal-content" style={{
            background:'#fff',
            padding:'2.5rem 2rem 2rem 2rem',
            borderRadius:16,
            minWidth:340,
            boxShadow:'0 8px 32px rgba(0,0,0,0.18)',
            maxWidth:400,
            width:'100%',
            position:'relative',
            animation:'modalIn .3s cubic-bezier(.4,2,.6,1)'
          }}>
            <button onClick={() => setShowModal(false)} style={{position:'absolute',top:12,right:16,border:'none',background:'none',fontSize:22,cursor:'pointer',color:'#888'}} aria-label="Fermer">×</button>
            <h2 style={{marginBottom:18,fontWeight:600,fontSize:22,color:'#1a2233'}}>Contacter l'administrateur</h2>
            <label style={{fontWeight:500}}>Raison&nbsp;:
              <select value={selectedReason} onChange={e => setSelectedReason(e.target.value)} style={{marginLeft:8,padding:'6px 12px',borderRadius:6,border:'1px solid #ccc',fontSize:15}}>
                {REASONS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </label>
            <br /><br />
            <label style={{fontWeight:500}}>Message&nbsp;:
              <textarea value={message} onChange={e => setMessage(e.target.value)} rows={4} style={{width:'100%',marginTop:8,padding:10,borderRadius:8,border:'1px solid #ccc',fontSize:15,resize:'vertical',minHeight:80}} />
            </label>
            <div style={{marginTop:24,display:'flex',justifyContent:'flex-end',gap:12}}>
              <button onClick={() => setShowModal(false)} className="btn btn-secondary" style={{padding:'8px 18px',borderRadius:6,fontWeight:500}}>Annuler</button>
              <button onClick={handleSend} className="btn btn-primary" style={{padding:'8px 18px',borderRadius:6,fontWeight:500,background:'#1a2233',color:'#fff',border:'none'}} disabled={!message.trim()}>Envoyer</button>
            </div>
          </div>
          <style>{`
            @keyframes modalIn {
              from { transform: translateY(40px) scale(.98); opacity: 0; }
              to { transform: none; opacity: 1; }
            }
          `}</style>
        </div>
      )}
    </div>
  );
};

export default Profile;

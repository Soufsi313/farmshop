import React, { useEffect, useState } from 'react';

function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const limit = 10;

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`http://localhost:3000/users/active?page=${page}&limit=${limit}`, {
          headers: { 'Authorization': `Bearer ${token}` },
          credentials: 'include'
        });
        const data = await res.json();
        console.log('Réponse /users/active:', data); // DEBUG
        if (res.ok) {
          setUsers(data.users);
          setTotal(data.total);
        } else {
          setError(data.message || 'Erreur lors du chargement des utilisateurs.');
        }
      } catch (err) {
        setError('Erreur serveur');
      }
      setLoading(false);
    };
    fetchUsers();
  }, [page]);

  const totalPages = Math.ceil(total / limit);

  // Handler suppression utilisateur
  const handleDelete = async (userId) => {
    if (!window.confirm('Confirmer la suppression de cet utilisateur ?')) return;
    setLoading(true);
    setError('');
    try {
      // Récupère le token CSRF
      const csrfRes = await fetch('http://localhost:3000/csrf-token', { credentials: 'include' });
      const csrfData = await csrfRes.json();
      const csrfToken = csrfData.csrfToken;
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:3000/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-csrf-token': csrfToken
        },
        credentials: 'include'
      });
      const data = await res.json();
      if (res.ok) {
        setUsers(users.filter(u => u.id !== userId));
        setTotal(total - 1);
      } else {
        setError(data.message || 'Erreur lors de la suppression.');
      }
    } catch (err) {
      setError('Erreur serveur');
    }
    setLoading(false);
  };

  // Handler modification de rôle
  const handleRoleChange = async (userId, newRole) => {
    setLoading(true);
    setError('');
    try {
      // Récupère le token CSRF
      const csrfRes = await fetch('http://localhost:3000/csrf-token', { credentials: 'include' });
      const csrfData = await csrfRes.json();
      const csrfToken = csrfData.csrfToken;
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:3000/users/${userId}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'x-csrf-token': csrfToken
        },
        credentials: 'include',
        body: JSON.stringify({ newRole })
      });
      const data = await res.json();
      if (res.ok) {
        // Utilise la valeur de rôle retournée par le backend (sécurité)
        setUsers(users.map(u => u.id === userId ? { ...u, role: data.user.role } : u));
      } else {
        setError(data.message || 'Erreur lors du changement de rôle.');
      }
    } catch (err) {
      setError('Erreur serveur');
    }
    setLoading(false);
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-10">
          <h1 className="display-4 mb-4 text-success text-center">Admin Panel</h1>
          <h3 className="mb-3">Utilisateurs actifs</h3>
          {error && <div className="alert alert-danger">{error}</div>}
          {loading ? (
            <div className="text-center">Chargement...</div>
          ) : (
            <>
              <div className="table-responsive">
                <table className="table table-bordered table-hover align-middle">
                  <thead className="table-success">
                    <tr>
                      <th>#</th>
                      <th>Nom d'utilisateur</th>
                      <th>Email</th>
                      <th>Rôle</th>
                      <th>Date d'inscription</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.length === 0 ? (
                      <tr><td colSpan="6" className="text-center">Aucun utilisateur actif</td></tr>
                    ) : users.map((u, idx) => (
                      <tr key={u.id}>
                        <td>{(page - 1) * limit + idx + 1}</td>
                        <td>{u.username}</td>
                        <td>{u.email}</td>
                        <td>{u.role}</td>
                        <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                        <td>
                          {u.id !== JSON.parse(localStorage.getItem('user')).id && (
                            <button className="btn btn-danger btn-sm me-2" onClick={() => handleDelete(u.id)} disabled={u.role === 'Admin'}>
                              Supprimer
                            </button>
                          )}
                          {u.id !== JSON.parse(localStorage.getItem('user')).id && (
                            <select
                              className="form-select form-select-sm d-inline w-auto"
                              value={u.role}
                              style={{ minWidth: 90 }}
                              onChange={e => handleRoleChange(u.id, e.target.value)}
                            >
                              <option value="User">User</option>
                              <option value="Admin">Admin</option>
                            </select>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <nav className="d-flex justify-content-center mt-3">
                <ul className="pagination">
                  <li className={`page-item${page === 1 ? ' disabled' : ''}`}>
                    <button className="page-link" onClick={() => setPage(page - 1)} disabled={page === 1}>Précédent</button>
                  </li>
                  {[...Array(totalPages)].map((_, i) => (
                    <li key={i} className={`page-item${page === i + 1 ? ' active' : ''}`}>
                      <button className="page-link" onClick={() => setPage(i + 1)}>{i + 1}</button>
                    </li>
                  ))}
                  <li className={`page-item${page === totalPages || totalPages === 0 ? ' disabled' : ''}`}>
                    <button className="page-link" onClick={() => setPage(page + 1)} disabled={page === totalPages || totalPages === 0}>Suivant</button>
                  </li>
                </ul>
              </nav>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminPanel;
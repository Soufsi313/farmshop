import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function MesCommandes() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchOrders() {
      setLoading(true);
      const token = localStorage.getItem('token');
      try {
        const res = await fetch('/order-items', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setOrders(data.orders || []);
      } catch {
        setOrders([]);
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, []);

  return (
    <div className="container py-5">
      <h1 className="mb-4">Mes commandes</h1>
      {loading ? (
        <div>Chargement...</div>
      ) : orders.length === 0 ? (
        <div className="alert alert-info">Aucune commande trouvée.</div>
      ) : (
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>#</th>
              <th>Date</th>
              <th>Statut</th>
              <th>Montant</th>
              <th>Détail</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>{new Date(order.createdAt).toLocaleString()}</td>
                <td>{order.status}</td>
                <td>{order.totalTTC ? order.totalTTC.toFixed(2) : 'N/A'} €</td>
                <td>
                  <button className="btn btn-outline-primary btn-sm" onClick={() => navigate(`/commande/${order.id}`)}>
                    Voir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

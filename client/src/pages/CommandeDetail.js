import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function CommandeDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchOrder() {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      try {
        const res = await fetch(`/order-items/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Commande introuvable');
        const data = await res.json();
        setOrder(data.order || null);
      } catch (e) {
        setError(e.message || 'Erreur lors du chargement');
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [id]);

  if (loading) return <div className="container py-5">Chargement...</div>;
  if (error) return <div className="container py-5"><div className="alert alert-danger">{error}</div></div>;
  if (!order) return <div className="container py-5"><div className="alert alert-warning">Commande introuvable.</div></div>;

  const items = order.OrderItems || order.items || [];
  // Calcul des totaux
  const totalProduitsTTC = items.reduce((sum, i) => sum + (Number(i.totalPriceTTC) || 0), 0);
  const fraisLivraisonTTC = order.shippingFees ? Number(order.shippingFees) : 0;
  const totalTTCFinal = (order.totalTTC !== undefined && order.totalTTC !== null)
    ? Number(order.totalTTC)
    : (totalProduitsTTC + fraisLivraisonTTC);

  return (
    <div className="container py-5">
      <button className="btn btn-link mb-3" onClick={() => navigate(-1)}>&larr; Retour</button>
      <h2 className="mb-3">Détail de la commande #{order.id}</h2>
      <div className="mb-2"><strong>Date :</strong> {new Date(order.createdAt).toLocaleString()}</div>
      <div className="mb-2"><strong>Statut :</strong> {order.status}</div>
      <div className="mb-2"><strong>Montant total TTC :</strong> {order.totalTTC ? Number(order.totalTTC).toFixed(2) : 'N/A'} €</div>
      <div className="mb-2"><strong>Frais de livraison TTC :</strong> {order.shippingFees ? Number(order.shippingFees).toFixed(2) : '0.00'} €</div>
      <div className="mb-2">
        <strong>Adresse de livraison :</strong><br />
        {order.shippingAddress && (
          <span>{order.shippingAddress}, {order.shippingPostalCode} {order.shippingCity}, {order.shippingCountry}</span>
        )}
        {(!order.shippingAddress && !order.shippingPostalCode && !order.shippingCity && !order.shippingCountry) && (
          <span className="text-muted">Non renseignée</span>
        )}
      </div>
      <div className="table-responsive mt-4">
        <table className="table table-bordered align-middle">
          <thead className="table-success">
            <tr>
              <th>Produit</th>
              <th>Quantité</th>
              <th>Prix unitaire</th>
              <th>Remise</th>
              <th>TVA (%)</th>
              <th>Total TTC</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr><td colSpan="6" className="text-center">Aucun produit</td></tr>
            ) : items.map((item, idx) => (
              <tr key={idx}>
                <td>{item.Product?.name || item.productName || '-'}</td>
                <td>{item.quantity}</td>
                <td>{item.unitPrice ? Number(item.unitPrice).toFixed(2) + ' €' : '-'}</td>
                <td>{item.specialOfferDiscount ? Number(item.specialOfferDiscount).toFixed(2) + ' €' : '-'}</td>
                <td>{item.Product?.tax_rate || item.tvaRate || '-'}</td>
                <td>{item.totalPriceTTC ? Number(item.totalPriceTTC).toFixed(2) + ' €' : (item.totalTTC ? Number(item.totalTTC).toFixed(2) + ' €' : '-')}</td>
              </tr>
            ))}
            {/* Ligne total produits */}
            <tr className="table-light">
              <td colSpan="5" className="text-end"><strong>Total produits TTC</strong></td>
              <td><strong>{totalProduitsTTC.toFixed(2)} €</strong></td>
            </tr>
            {/* Ligne frais livraison */}
            <tr className="table-light">
              <td colSpan="5" className="text-end"><strong>Frais de livraison TTC</strong></td>
              <td><strong>{fraisLivraisonTTC.toFixed(2)} €</strong></td>
            </tr>
            {/* Ligne total TTC payé */}
            <tr className="table-success">
              <td colSpan="5" className="text-end fs-5"><strong>Total TTC payé</strong></td>
              <td className="fs-5"><strong>{totalTTCFinal.toFixed(2)} €</strong></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

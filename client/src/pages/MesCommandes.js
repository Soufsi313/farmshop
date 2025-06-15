import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';

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

  // Génération de la facture PDF
  const handleDownloadInvoice = (order) => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`Facture - Commande #${order.id}`, 10, 15);
    doc.setFontSize(12);
    doc.text(`Date : ${new Date(order.createdAt).toLocaleString()}`, 10, 25);
    doc.text(`Statut : ${order.status}`, 10, 32);
    doc.text(`Montant total : ${order.totalTTC ? order.totalTTC.toFixed(2) : 'N/A'} €`, 10, 39);
    doc.text(' ', 10, 46);
    // Tableau des achats (simplifié, à adapter si plus de détails)
    let y = 55;
    doc.text('Détail des achats :', 10, y);
    y += 7;
    doc.setFontSize(10);
    doc.text('Produit', 10, y);
    doc.text('Quantité', 60, y);
    doc.text('Prix unitaire', 90, y);
    doc.text('Total TTC', 130, y);
    y += 5;
    if (order.items && order.items.length > 0) {
      order.items.forEach(item => {
        doc.text(item.productName || '-', 10, y);
        doc.text(String(item.quantity), 60, y);
        doc.text(item.unitPrice ? item.unitPrice.toFixed(2) + ' €' : '-', 90, y);
        doc.text(item.totalTTC ? item.totalTTC.toFixed(2) + ' €' : '-', 130, y);
        y += 5;
      });
    } else {
      doc.text('Aucun détail disponible', 10, y);
      y += 5;
    }
    y += 10;
    doc.setFontSize(11);
    doc.text('Droit de rétractation : Vous disposez d’un droit de rétractation de 14 jours (sauf denrées périssables).', 10, y, { maxWidth: 180 });
    doc.save(`facture_commande_${order.id}.pdf`);
  };

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
              <th>Facture</th>
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
                <td>
                  <button className="btn btn-outline-success btn-sm" onClick={() => handleDownloadInvoice(order)}>
                    Télécharger la facture
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

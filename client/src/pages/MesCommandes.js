import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function MesCommandes() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const commandesParPage = 15;
  const indexOfLast = currentPage * commandesParPage;
  const indexOfFirst = indexOfLast - commandesParPage;
  const commandesPage = orders.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(orders.length / commandesParPage);
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
    // Tableau détaillé des achats
    const items = order.OrderItems || order.items || [];
    const rows = items.map(item => {
      let name = (item.Product && item.Product.name) ? String(item.Product.name) : (item.productName || '-');
      // Nettoyage du nom : supprime les caractères non imprimables et espaces superflus
      name = name.replace(/[^\x20-\x7EÀ-ÿœŒ\-]/g, '').replace(/\s+/g, ' ').trim();
      if (name.length > 45) name = name.substring(0, 45) + '...';
      return [
        name,
        String(item.quantity),
        item.unitPrice ? Number(item.unitPrice).toFixed(2) + ' €' : '-',
        item.specialOfferDiscount ? Number(item.specialOfferDiscount).toFixed(2) + ' €' : '-',
        item.tvaRate ? Number(item.tvaRate).toFixed(2) + ' %' : '-',
        item.totalPriceTTC ? Number(item.totalPriceTTC).toFixed(2) + ' €' : (item.totalTTC ? Number(item.totalTTC).toFixed(2) + ' €' : '-')
      ];
    });
    const totalRemise = items.reduce((sum, i) => sum + (Number(i.specialOfferDiscount) || 0), 0);
    autoTable(doc, {
      startY: 40,
      head: [[
        'Produit',
        'Quantité',
        'Prix unitaire',
        'Remise',
        'TVA',
        'Total TTC'
      ]],
      body: rows.length > 0 ? rows : [['Aucun détail disponible', '', '', '', '', '']],
      theme: 'grid',
      headStyles: { fillColor: [40, 167, 69] },
      styles: { fontSize: 10 },
      columnStyles: {
        0: { cellWidth: 50 },
        1: { cellWidth: 20, halign: 'center' },
        2: { cellWidth: 25, halign: 'right' },
        3: { cellWidth: 25, halign: 'right' },
        4: { cellWidth: 20, halign: 'right' },
        5: { cellWidth: 30, halign: 'right' },
      },
      didDrawPage: (data) => {
        if (totalRemise > 0) {
          const y = data.cursor.y + 4;
          doc.setFontSize(11);
          doc.text(`Total remises appliquées : -${totalRemise.toFixed(2)} €`, 10, y);
        }
      }
    });
    let y = doc.lastAutoTable ? doc.lastAutoTable.finalY + 8 : 55;
    // Récupération des totaux réels
    const totalHT = items.reduce((sum, i) => sum + (Number(i.totalPriceHT) || 0), 0);
    // Détail TVA par taux (utilise Product.tax_rate)
    const totalTVA6 = items.filter(i => Number(i.Product?.tax_rate) === 6).reduce((sum, i) => sum + ((Number(i.totalPriceTTC) || 0) - (Number(i.totalPriceHT) || 0)), 0);
    const totalTVA21 = items.filter(i => Number(i.Product?.tax_rate) === 21).reduce((sum, i) => sum + ((Number(i.totalPriceTTC) || 0) - (Number(i.totalPriceHT) || 0)), 0);
    // Frais de livraison TTC
    let fraisLivraisonTTC = order.shippingFees ? Number(order.shippingFees) : 0;
    if (fraisLivraisonTTC > 0) {
      doc.text(`Frais de livraison (TTC) : ${fraisLivraisonTTC.toFixed(2)} €`, 10, y);
      y += 6;
    }
    doc.text(`Total HT produits : ${totalHT.toFixed(2)} €`, 10, y);
    y += 6;
    doc.text(`TVA 6% : ${totalTVA6.toFixed(2)} €`, 10, y);
    y += 6;
    // Total TTC payé = total produits TTC + livraison TTC
    const totalProduitsTTC = items.reduce((sum, i) => sum + (Number(i.totalPriceTTC) || 0), 0);
    const totalTTCFinal = totalProduitsTTC + fraisLivraisonTTC;
    doc.text(`Total TTC payé : ${totalTTCFinal.toFixed(2)} €`, 10, y);
    y += 10;
    doc.setFontSize(10);
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
        <>
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
            {commandesPage.map(order => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>{new Date(order.createdAt).toLocaleString()}</td>
                <td>{order.status}</td>
                <td>{order.totalTTC !== null && order.totalTTC !== undefined ? Number(order.totalTTC).toFixed(2) : 'N/A'} €</td>
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
        {/* Pagination */}
        <div className="d-flex justify-content-center align-items-center gap-2 my-3">
          <button className="btn btn-secondary btn-sm" onClick={() => setCurrentPage(p => Math.max(1, p-1))} disabled={currentPage === 1}>Précédent</button>
          <span>Page {currentPage} / {totalPages}</span>
          <button className="btn btn-secondary btn-sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))} disabled={currentPage === totalPages}>Suivant</button>
        </div>
        </>
      )}
    </div>
  );
}

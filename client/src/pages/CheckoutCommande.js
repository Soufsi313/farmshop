import React, { useState, useEffect } from 'react';
import { getUserCart } from '../utils/cartApi';
import { useNavigate } from 'react-router-dom';

function CheckoutCommande() {
  const [adresse, setAdresse] = useState('');
  const [orderItems, setOrderItems] = useState([]);
  const tvaRate = 6;
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchCart() {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const cart = await getUserCart(token);
        setOrderItems(cart.CartItems || []);
      } catch (err) {
        setOrderItems([]);
      }
    }
    fetchCart();
  }, []);

  // Utilitaire pour récupérer l'offre spéciale, peu importe la structure
  function getSpecialOffer(item) {
    return item.SpecialOffer || item.Product?.specialOffer;
  }

  // DEBUG : log structure reçue
  useEffect(() => {
    if (orderItems.length > 0) {
      console.log('CheckoutCommande orderItems:', orderItems);
    }
  }, [orderItems]);

  // Calculs dynamiques
  const totalHT = orderItems.reduce((sum, item) => {
    const price = item.Product?.price ?? 0;
    const qty = item.quantity;
    let discount = 0;
    const offer = getSpecialOffer(item);
    if (offer && offer.discountType && qty >= (offer.minQuantity || 0)) {
      if (offer.discountType === 'percentage') {
        discount = price * (offer.discountValue / 100) * qty;
      } else if (offer.discountType === 'fixed') {
        discount = offer.discountValue * qty;
      }
    }
    return sum + (price * qty - discount);
  }, 0);
  const totalTVA = totalHT * (tvaRate / 100);
  const totalTTC = totalHT + totalTVA;

  return (
    <div className="container py-5">
      <button className="btn btn-outline-secondary mb-3" onClick={() => navigate('/panier/achat')}>
        &larr; Retour au panier
      </button>
      <h1 className="mb-4 text-success">Confirmation de commande</h1>
      <div className="mb-4">
        <label className="form-label fw-bold">Adresse de livraison</label>
        <textarea
          className="form-control"
          rows={3}
          value={adresse}
          onChange={e => setAdresse(e.target.value)}
          placeholder="Renseignez votre adresse de livraison ici..."
        />
      </div>
      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title">Récapitulatif de la commande</h5>
          {orderItems.length === 0 ? (
            <div className="text-muted">Aucun produit à afficher</div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Produit</th>
                  <th>Quantité</th>
                  <th>Prix unitaire</th>
                  <th>Remise</th>
                  <th>Total HT</th>
                </tr>
              </thead>
              <tbody>
                {orderItems.map(item => {
                  const price = item.Product?.price ?? 0;
                  const qty = item.quantity;
                  let discount = 0;
                  const offer = getSpecialOffer(item);
                  if (offer && offer.discountType && qty >= (offer.minQuantity || 0)) {
                    if (offer.discountType === 'percentage') {
                      discount = price * (offer.discountValue / 100) * qty;
                    } else if (offer.discountType === 'fixed') {
                      discount = offer.discountValue * qty;
                    }
                  }
                  const totalHT = price * qty - discount;
                  return (
                    <tr key={item.id}>
                      <td>
                        {item.Product?.name}
                        {offer && offer.discountType && qty >= (offer.minQuantity || 0) && (
                          <div className="text-danger small mt-1">
                            Offre spéciale : -{offer.discountValue}{offer.discountType === 'percentage' ? '%' : '€'}{offer.minQuantity ? ` dès ${offer.minQuantity}kg` : ''}
                            {offer.description ? <div className="small text-muted">{offer.description}</div> : null}
                          </div>
                        )}
                      </td>
                      <td>{qty}</td>
                      <td>{price.toFixed(2)} €</td>
                      <td className="text-danger">-{discount.toFixed(2)} €</td>
                      <td>{totalHT.toFixed(2)} €</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
      <div className="mb-3">
        <strong>Total HT :</strong> {totalHT.toFixed(2)} €<br />
        <strong>TVA ({tvaRate}%) :</strong> {totalTVA.toFixed(2)} €<br />
        <strong>Total TTC :</strong> {totalTTC.toFixed(2)} €
      </div>
      <button className="btn btn-success">Valider et payer</button>
    </div>
  );
}

export default CheckoutCommande;

import React, { useContext, useState, useEffect } from 'react';
import { CartWishlistContext } from '../App';
import { useNavigate } from 'react-router-dom';
import { getUserCart, updateCartItem } from '../utils/cartApi';

function CartAchat() {
  // On tente de récupérer cartAchat du contexte, sinon on utilise un state local
  const context = useContext(CartWishlistContext);
  console.log('CartAchat context:', context); // Debug context
  const [cartAchat, setCartAchat] = useState(context?.cartAchat || []);
  const [quantities, setQuantities] = useState({});
  const navigate = useNavigate();

  // Récupération du token (exemple: depuis localStorage)
  const token = localStorage.getItem('token');

  useEffect(() => {
    async function fetchCart() {
      if (!token) return;
      try {
        const cart = await getUserCart(token);
        // Si la structure de retour est { items: [...] } ou similaire, adaptez ici
        setCartAchat(cart.CartItems || []);
        console.log('CartAchat API cart:', cart);
      } catch (err) {
        console.error('Erreur chargement panier connecté:', err);
      }
    }
    fetchCart();
  }, [token]);

  useEffect(() => {
    console.log('CartAchat cartAchat state:', cartAchat); // Debug cartAchat state
  }, [cartAchat]);

  useEffect(() => {
    // Met à jour les quantités locales quand le panier change
    const q = {};
    cartAchat.forEach(item => { q[item.id] = item.quantity; });
    setQuantities(q);
  }, [cartAchat]);

  // DEBUG : Affiche la catégorie de chaque produit pour analyse TVA
  useEffect(() => {
    cartAchat.forEach(item => {
      console.log('Produit:', item.Product?.name, '| Catégorie:', item.Product?.category?.name);
    });
  }, [cartAchat]);

  // Utilitaire pour récupérer l'offre spéciale, peu importe la structure
  function getSpecialOffer(item) {
    return item.SpecialOffer || item.Product?.specialOffer;
  }

  // Calcul du prix remisé
  function getDiscountedPrice(item) {
    const offer = getSpecialOffer(item);
    const qty = quantities[item.id] ?? item.quantity;
    const hasOffer = offer && (!offer.startDate || new Date(offer.startDate) <= new Date()) && (!offer.endDate || new Date(offer.endDate) >= new Date()) && qty >= (offer.minQuantity || 0);
    if (hasOffer) {
      if (offer.discountType === 'percentage') {
        return (item.Product.price ?? 0) * (1 - offer.discountValue / 100);
      } else if (offer.discountType === 'fixed') {
        return (item.Product.price ?? 0) - offer.discountValue;
      }
    }
    return item.Product?.price ?? 0;
  }

  const handleRemove = async (id) => {
    const token = localStorage.getItem('token');
    try {
      await import('../utils/cartApi').then(api => api.removeCartItem(token, id));
      // Recharge le panier après suppression
      const cart = await getUserCart(token);
      setCartAchat(cart.CartItems || []);
    } catch (err) {
      alert('Erreur lors de la suppression de l\'article : ' + err.message);
    }
  };

  const handleQuantityChange = (itemId, value) => {
    const qty = Math.max(1, Number(value));
    setQuantities(q => ({ ...q, [itemId]: qty }));
  };

  const handleQuantityUpdate = async (item) => {
    const token = localStorage.getItem('token');
    try {
      await updateCartItem(token, item.id, quantities[item.id]);
      // Recharge le panier après modification
      const cart = await getUserCart(token);
      setCartAchat(cart.CartItems || []);
    } catch (err) {
      alert('Erreur lors de la modification de la quantité : ' + err.message);
    }
  };

  // Calculs détaillés pour chaque ligne du panier
  const lignesDetail = cartAchat.map(item => {
    const price = item.Product?.price ?? 0;
    const qty = quantities[item.id] ?? item.quantity;
    const offer = getSpecialOffer(item);
    let discount = 0;
    if (offer && (!offer.startDate || new Date(offer.startDate) <= new Date()) && (!offer.endDate || new Date(offer.endDate) >= new Date()) && qty >= (offer.minQuantity || 0)) {
      if (offer.discountType === 'percentage') {
        discount = price * (offer.discountValue / 100) * qty;
      } else if (offer.discountType === 'fixed') {
        discount = offer.discountValue * qty;
      }
    }
    // On considère alimentaire si la catégorie du produit est 'food', 'alimentaire', 'alimentation', 'fruits', 'légumes', 'fruits et légumes' (insensible à la casse)
    const cat = (item.Product?.category?.name || '').toLowerCase();
    const isFood = [
      "food", "alimentaire", "alimentation", "fruits", "légumes", "fruits et légumes"
    ].includes(cat);
    const tvaRateLigne = item.Product?.tax_rate !== undefined ? Number(item.Product.tax_rate) : 21;
    const totalHT = price * qty - discount;
    const tva = totalHT * (tvaRateLigne / 100);
    const totalTTC = totalHT + tva;
    return { name: item.Product?.name, qty, price, discount, totalHT, tvaRateLigne, tva, totalTTC, category: item.Product?.category?.name };
  });
  // Frais de livraison : 2.50€ TTC si < 25€ TTC produits
  let fraisLivraisonTTC = lignesDetail.reduce((sum, l) => sum + l.totalTTC, 0) >= 25 ? 0 : 2.50;
  // Totaux
  const totalHT = lignesDetail.reduce((sum, l) => sum + l.totalHT, 0);
  const totalTVA6 = lignesDetail.filter(l => l.tvaRateLigne === 6).reduce((sum, l) => sum + l.tva, 0);
  const totalTVA = lignesDetail.reduce((sum, l) => sum + l.tva, 0);
  const totalTTC = lignesDetail.reduce((sum, l) => sum + l.totalTTC, 0) + fraisLivraisonTTC;

  return (
    <div className="container py-5">
      <h1 className="mb-5 text-success text-center display-4 fw-bold">Mon panier d'achat</h1>
      {cartAchat.length === 0 ? (
        <div className="alert alert-info text-center">Votre panier est vide.</div>
      ) : (
        <div className="table-responsive">
          <table className="table align-middle">
            <thead>
              <tr>
                <th>Produit</th>
                <th>Catégorie</th>
                <th>Prix unitaire HT</th>
                <th>Quantité</th>
                <th>Remise</th>
                <th>TVA</th>
                <th>Total TTC</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {lignesDetail.map((l, idx) => {
                const item = cartAchat[idx];
                return (
                  <tr key={idx}>
                    <td>{l.name}</td>
                    <td>{item.Product?.category?.name || <span className="text-muted">-</span>}</td>
                    <td>{l.price.toFixed(2)} €</td>
                    <td>
                      <input
                        type="number"
                        min={1}
                        value={quantities[item.id] ?? item.quantity}
                        onChange={e => handleQuantityChange(item.id, e.target.value)}
                        style={{ width: 60 }}
                      />
                      <button className="btn btn-sm btn-outline-primary ms-2" onClick={() => handleQuantityUpdate(item)}>
                        Mettre à jour
                      </button>
                    </td>
                    <td className="text-danger">-{l.discount.toFixed(2)} €</td>
                    <td>{l.tva.toFixed(2)} € ({l.tvaRateLigne}%)</td>
                    <td className="fw-bold">{l.totalTTC.toFixed(2)} €</td>
                    <td>
                      <button className="btn btn-outline-danger btn-sm" onClick={() => handleRemove(item.id)}>Supprimer</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={3} className="text-end fw-bold">Total HT produits</td>
                <td colSpan={2} className="fw-bold">{totalHT.toFixed(2)} €</td>
                <td className="fw-bold">TVA 6%</td>
                <td className="fw-bold">{totalTVA6.toFixed(2)} €</td>
                <td></td>
              </tr>
              <tr>
                <td colSpan={5} className="text-end fw-bold">Frais de livraison (TTC)</td>
                <td colSpan={2} className="fw-bold">{fraisLivraisonTTC > 0 ? fraisLivraisonTTC.toFixed(2) + ' €' : '-'}</td>
                <td></td>
              </tr>
              <tr>
                <td colSpan={6} className="text-end fw-bold">Total TTC à payer</td>
                <td className="fw-bold text-success" style={{fontSize:'1.2em'}}>{totalTTC.toFixed(2)} €</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
      {/* Boutons d'action */}
      <div className="d-flex justify-content-between align-items-center mb-4" style={{maxWidth:700,margin:'0 auto'}}>
        <button className="btn btn-secondary" onClick={() => navigate('/produits/achat')}>Continuer mes achats</button>
        <button className="btn btn-success" 
                onClick={() => navigate('/checkout')}
                disabled={cartAchat.length === 0}
        >
          Confirmer ma commande
        </button>
      </div>
      <div className="card shadow-sm mb-4" style={{maxWidth:700,margin:'40px auto 0 auto',borderRadius:12,border:'1px solid #e0e0e0'}}>
        <div className="card-body bg-light">
          <ul className="list-unstyled text-center small mb-0">
            <li className="mb-1"><strong>TVA incluse :</strong> Tous nos prix incluent la TVA.</li>
            <li className="mb-1"><strong>Livraison :</strong> Les frais de livraison seront calculés à l’étape suivante.</li>
            <li className="mb-1"><strong>Paiement sécurisé :</strong> Le paiement en ligne est 100 % sécurisé.</li>
            <li className="mb-1"><strong>Droit de rétractation :</strong> Vous disposez d’un droit de rétractation de 14 jours (sauf denrées périssables).</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default CartAchat;

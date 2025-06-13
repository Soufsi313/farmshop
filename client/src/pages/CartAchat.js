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

  const getLineTotal = (item) => {
    const qty = quantities[item.id] ?? item.quantity;
    return getDiscountedPrice(item) * qty;
  };

  const total = cartAchat.reduce((sum, item) => sum + getLineTotal(item), 0);

  const handleRemove = (id) => {
    setCartAchat(cartAchat.filter(item => item.id !== id));
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

  return (
    <div className="container py-5">
      <h1 className="mb-5 text-success text-center display-4 fw-bold">Mon panier d'achat</h1>
      <div className="card shadow-sm mb-4" style={{maxWidth:700,margin:'0 auto',borderRadius:12,border:'1px solid #e0e0e0'}}>
        <div className="card-body bg-light">
          <ul className="list-unstyled text-center small mb-0">
            <li className="mb-1"><strong>TVA incluse :</strong> Tous nos prix incluent la TVA.</li>
            <li className="mb-1"><strong>Livraison :</strong> Les frais de livraison seront calculés à l’étape suivante.</li>
            <li className="mb-1"><strong>Paiement sécurisé :</strong> Le paiement en ligne est 100 % sécurisé.</li>
            <li className="mb-1"><strong>Droit de rétractation :</strong> Vous disposez d’un droit de rétractation de 14 jours (sauf denrées périssables).</li>
          </ul>
        </div>
      </div>
      {cartAchat.length === 0 ? (
        <div className="alert alert-info text-center">Votre panier est vide.</div>
      ) : (
        <div className="table-responsive">
          <table className="table align-middle">
            <thead>
              <tr>
                <th>Produit</th>
                <th>Prix unitaire</th>
                <th>Quantité</th>
                <th>Total</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {cartAchat.map(item => {
                console.log('CartAchat item:', item, 'Product:', item.Product, 'SpecialOffer:', item.Product?.specialOffer);
                return (
                  <tr key={item.id}>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        {item.Product?.mainImage && <img src={`http://localhost:3000${item.Product.mainImage}`} alt={item.Product?.name} style={{width:48, height:48, objectFit:'contain', borderRadius:8, background:'#f8f9fa'}} />}
                        <span className="fw-bold">{item.Product?.name}</span>
                      </div>
                      {(() => {
                        const offer = getSpecialOffer(item);
                        const qty = quantities[item.id] ?? item.quantity;
                        if (offer && (!offer.startDate || new Date(offer.startDate) <= new Date()) && (!offer.endDate || new Date(offer.endDate) >= new Date()) && qty >= (offer.minQuantity || 0)) {
                          return (
                            <div className="text-danger small mt-1">
                              Offre spéciale : -{offer.discountValue}{offer.discountType === 'percentage' ? '%' : '€'}{offer.minQuantity ? ` dès ${offer.minQuantity}kg` : ''}
                              {offer.description ? <div className="small text-muted">{offer.description}</div> : null}
                            </div>
                          );
                        }
                        return null;
                      })()}
                    </td>
                    <td>
                      {(() => {
                        const offer = item.Product?.specialOffer;
                        const hasOffer = offer && offer.active && (quantities[item.id] ?? item.quantity) >= (offer.minQuantity || 0);
                        if (hasOffer) {
                          return <>
                            <span className="text-decoration-line-through text-muted me-2">
                              {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(item.Product?.price ?? 0)}
                            </span>
                            <span className="fw-bold text-success">
                              {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(getDiscountedPrice(item))}
                            </span>
                          </>;
                        }
                        return <span className="fw-bold">{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(item.Product?.price ?? 0)}</span>;
                      })()}
                    </td>
                    <td>
                      <input
                        type="number"
                        min={1}
                        value={quantities[item.id] ?? item.quantity}
                        onChange={e => handleQuantityChange(item.id, e.target.value)}
                        style={{ width: 60 }}
                      />
                      <button className="btn btn-outline-primary btn-sm ms-2" onClick={() => handleQuantityUpdate(item)}>
                        Modifier
                      </button>
                      {item.Product?.symbol}
                    </td>
                    <td className="fw-bold">
                      {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(getLineTotal(item))}
                    </td>
                    <td>
                      <button className="btn btn-outline-danger btn-sm" onClick={() => handleRemove(item.id)}>Supprimer</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={3} className="text-end fw-bold">Total</td>
                <td className="fw-bold text-success" style={{fontSize:'1.2em'}}>
                  {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(total)}
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
      <button className="btn btn-secondary mt-4" onClick={() => navigate('/produits/achat')}>Continuer mes achats</button>
    </div>
  );
}

export default CartAchat;

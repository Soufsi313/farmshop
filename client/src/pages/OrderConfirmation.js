import React, { useEffect, useContext } from 'react';
import { CartWishlistContext } from '../App';
import { getUserCart } from '../utils/cartApi';
import { useNavigate } from 'react-router-dom';

export default function OrderConfirmation() {
  const { setCartAchatCount } = useContext(CartWishlistContext);
  const navigate = useNavigate();

  useEffect(() => {
    // On force la mise à jour du panier (vide côté backend après paiement)
    async function refreshCart() {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const cart = await getUserCart(token);
          setCartAchatCount(cart.CartItems ? cart.CartItems.length : 0);
        } catch {
          setCartAchatCount(0);
        }
      }
    }
    refreshCart();
    // Optionnel : vider le panier du localStorage si utilisé
    localStorage.removeItem('cart');
  }, [setCartAchatCount]);

  return (
    <div className="container py-5 text-center">
      <h1 className="text-success mb-4">Merci pour votre achat !</h1>
      <p className="lead">Votre commande a bien été enregistrée et payée. Vous recevrez un email de confirmation sous peu.</p>
      <button className="btn btn-primary mt-4" onClick={() => navigate('/')}>Retour à l'accueil</button>
    </div>
  );
}

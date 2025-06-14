// Utilitaires pour le panier d'achat connecté

export async function getUserCart(token) {
  // Correction de l'URL pour correspondre à la route backend
  const res = await fetch('http://localhost:3000/api/cart/user', {
    headers: { 'Authorization': `Bearer ${token}` },
    credentials: 'include',
  });
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch (e) {
    throw new Error('Réponse non JSON du serveur: ' + text);
  }
}

export async function addCartItem(token, cartId, productId, quantity) {
  const csrfRes = await fetch('http://localhost:3000/csrf-token', { credentials: 'include' });
  const csrfData = await csrfRes.json();
  const res = await fetch('http://localhost:3000/api/cartitem', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'x-csrf-token': csrfData.csrfToken,
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ cartId, productId, quantity })
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error('Erreur ajout au panier (réponse serveur) : ' + errorText);
  }
  return await res.json();
}

export async function getCartItems(token, cartId) {
  const res = await fetch(`http://localhost:3000/api/cartitem/${cartId}`, {
    headers: { 'Authorization': `Bearer ${token}` },
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Erreur récupération items panier');
  return await res.json();
}

export async function updateCartItem(token, itemId, quantity) {
  const csrfRes = await fetch('http://localhost:3000/csrf-token', { credentials: 'include' });
  const csrfData = await csrfRes.json();
  const res = await fetch(`http://localhost:3000/api/cartitem/${itemId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'x-csrf-token': csrfData.csrfToken,
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ quantity })
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error('Erreur modification quantité panier : ' + errorText);
  }
  return await res.json();
}

export async function removeCartItem(token, itemId) {
  const csrfRes = await fetch('http://localhost:3000/csrf-token', { credentials: 'include' });
  const csrfData = await csrfRes.json();
  const res = await fetch(`http://localhost:3000/api/cartitem/${itemId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'x-csrf-token': csrfData.csrfToken,
    },
    credentials: 'include',
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error('Erreur suppression item panier : ' + errorText);
  }
  return await res.json();
}

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Wishlist() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchWishlist = async () => {
      setLoading(true);
      setError('');
      try {
        const userStr = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        if (!userStr || !token) {
          setError('Vous devez être connecté pour accéder à la wishlist.');
          setLoading(false);
          return;
        }
        const user = JSON.parse(userStr);
        const res = await fetch(`http://localhost:3000/wishlist/${user.id}`, {
          headers: { 'Authorization': `Bearer ${token}` },
          credentials: 'include'
        });
        const data = await res.json();
        console.log('Réponse API wishlist:', res.status, data); // DEBUG
        if (res.ok) {
          setProducts((data || []).map(w => w.Product));
        } else {
          setError(data.message || 'Erreur lors du chargement de la wishlist.');
        }
      } catch (err) {
        setError('Erreur serveur');
      }
      setLoading(false);
    };
    fetchWishlist();
  }, []);

  const handleRemove = async (productId) => {
    const userStr = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (!userStr || !token) return;
    const user = JSON.parse(userStr);
    // Récupère le token CSRF
    const csrfRes = await fetch('http://localhost:3000/csrf-token', { credentials: 'include' });
    const csrfData = await csrfRes.json();
    const res = await fetch('http://localhost:3000/wishlist/remove', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'x-csrf-token': csrfData.csrfToken
      },
      credentials: 'include',
      body: JSON.stringify({ productId, userId: user.id })
    });
    if (res.ok) {
      setProducts(products => products.filter(p => p.id !== productId));
    } else {
      alert('Erreur lors de la suppression de la wishlist.');
    }
  };

  return (
    <div className="container py-5">
      <h1 className="mb-5 text-warning text-center display-4 fw-bold">Ma Wishlist</h1>
      {loading ? (
        <div className="text-center py-5"><div className="spinner-border text-warning" role="status"><span className="visually-hidden">Chargement...</span></div></div>
      ) : error ? (
        <div className="alert alert-danger text-center">{error}</div>
      ) : (
        <div className="d-flex flex-wrap gap-4 justify-content-center">
          {products.length === 0 ? (
            <div className="col-12 text-center">Aucun produit dans la wishlist.</div>
          ) : (
            products.map(product => (
              <div
                className="product-card-hz d-flex align-items-center bg-white shadow-sm border rounded-4 p-2 mb-2"
                key={product.id}
                style={{ minWidth: 320, maxWidth: 420, flex: '1 1 350px', height: 120, cursor: 'pointer', position: 'relative' }}
                onClick={() => navigate(`/produits/achat/${product.id}`)}
              >
                {product.mainImage && (
                  <img src={`http://localhost:3000${product.mainImage}`} alt={product.name} style={{ width: 80, height: 80, objectFit: 'contain', background:'#f8f9fa', borderRadius:'1rem', marginRight: 16 }} />
                )}
                <div className="flex-grow-1 d-flex flex-column h-100 justify-content-between">
                  <div>
                    <h6 className="fw-bold text-success mb-1" style={{ fontSize: '1.05rem', minHeight: 24 }}>
                      {product.name}
                    </h6>
                  </div>
                  <div className="d-flex align-items-end justify-content-between mt-1">
                    <span className="fw-bold text-dark">{product.price} € <span className="text-secondary" style={{ fontSize: '0.95em' }}>{product.symbol}</span></span>
                    <span className="badge bg-light text-dark border border-1 ms-2">{product.quantity > 0 ? `Stock : ${product.quantity}` : 'Rupture'}</span>
                  </div>
                </div>
                <button className="btn btn-outline-danger btn-sm position-absolute top-0 end-0 m-2" title="Retirer de la wishlist" onClick={e => { e.stopPropagation(); handleRemove(product.id); }}>
                  &times;
                </button>
              </div>
            ))
          )}
        </div>
      )}
      <style>{`
        .product-card-hz {
          transition: box-shadow 0.18s, transform 0.18s;
        }
        .product-card-hz:hover {
          box-shadow: 0 8px 24px 0 rgba(255,193,7,0.10), 0 1.5px 6px 0 rgba(0,0,0,0.08);
          transform: translateY(-2px) scale(1.01);
          border-color: #ffc10722;
        }
      `}</style>
    </div>
  );
}

export default Wishlist;

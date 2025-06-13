import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserCart, addCartItem } from '../utils/cartApi';

function AchatProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantities, setQuantities] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch('http://localhost:3000/products?orderBy=name&orderDir=ASC&limit=100');
        const data = await res.json();
        console.log('Réponse produits:', res.status, data); // DEBUG
        if (res.ok) {
          setProducts(data.products || []);
        } else {
          setError(data.message || 'Erreur lors du chargement des produits.');
        }
      } catch (err) {
        setError('Erreur serveur');
        console.error('Erreur fetch produits:', err); // DEBUG
      }
      setLoading(false);
    };
    fetchProducts();
  }, []);

  const handleQuantityChange = (productId, value, max) => {
    let qty = Math.max(1, Math.min(Number(value), max));
    setQuantities(q => ({ ...q, [productId]: qty }));
  };

  const handleAddToCart = async (e, product) => {
    e.stopPropagation();
    const userStr = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    const qty = quantities[product.id] || 1;
    if (userStr && token) {
      try {
        // Récupérer ou créer le panier en base
        const cart = await getUserCart(token);
        console.log('Cart reçu pour ajout au panier:', cart); // DEBUG
        if (!cart || !cart.id) {
          alert('Erreur : panier non trouvé ou id manquant.');
          return;
        }
        // Ajouter l’item au panier en base
        await addCartItem(token, cart.id, product.id, qty);
        alert(`Produit ajouté au panier : ${product.name} x${qty}`);
      } catch (err) {
        alert('Erreur lors de l’ajout au panier : ' + err.message);
      }
    } else {
      // Fallback : panier local (non connecté)
      alert(`Produit ajouté: ${product.name} x${qty}`);
    }
  };

  // Début utilitaire offre spéciale
  const isSpecialOfferActive = () => {
    const now = new Date();
    const start = new Date('2025-06-13T00:00:00');
    const end = new Date('2025-06-16T00:00:00');
    return now >= start && now < end;
  };
  // Fin utilitaire offre spéciale

  return (
    <div className="container py-5">
      <h1 className="mb-5 text-success text-center display-4 fw-bold">Produits d'achat</h1>
      {loading ? (
        <div className="text-center py-5"><div className="spinner-border text-success" role="status"><span className="visually-hidden">Chargement...</span></div></div>
      ) : error ? (
        <div className="alert alert-danger text-center">{error}</div>
      ) : (
        <div className="d-flex flex-wrap gap-4 justify-content-center">
          {products.length === 0 ? (
            <div className="col-12 text-center">Aucun produit disponible à l'achat.</div>
          ) : (
            products.filter(p => p.isAvailable).map(product => (
              <div
                className="product-card-hz d-flex flex-column bg-white shadow-sm border rounded-4 p-3 mb-2 align-items-stretch"
                key={product.id}
                style={{ minWidth: 320, maxWidth: 420, flex: '1 1 350px', height: 220, cursor: 'pointer', justifyContent: 'space-between', position: 'relative' }}
                onClick={() => navigate(`/produits/achat/${product.id}`)}
              >
                {isSpecialOfferActive() && product.specialOfferActive && product.specialOffer && (
                  <div style={{position:'absolute',top:10,left:10,zIndex:2}}>
                    <span className="badge bg-danger text-white px-3 py-2" style={{fontSize:'1em',boxShadow:'0 2px 8px #d9534f44',borderRadius:8}}>
                      {product.specialOffer.description || `Offre spéciale : ${product.specialOffer.discountValue}${product.specialOffer.discountType === 'percentage' ? '%' : '€'} dès ${product.specialOffer.minQuantity}${product.symbol || ''}`}
                    </span>
                  </div>
                )}
                <div className="d-flex flex-column align-items-center" style={{height: 110, justifyContent:'center'}}>
                  <div style={{width: 80, height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', background:'#fff', borderRadius:'1rem', border:'1px solid #eee', overflow:'hidden'}}>
                    <img src={`http://localhost:3000${product.mainImage}`} alt={product.name} style={{ maxWidth: 70, maxHeight: 70, objectFit: 'contain', background:'#f8f9fa', borderRadius:'0.7rem' }} />
                  </div>
                  <span className="fw-bold text-dark mt-2" style={{minHeight: 24, display:'flex', alignItems:'center', justifyContent:'center'}}>{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(product.price)} <span className="text-secondary ms-1" style={{ fontSize: '0.95em' }}>{product.symbol}</span></span>
                </div>
                <div className="flex-grow-1 d-flex flex-column justify-content-between align-items-center" style={{minHeight: 60}}>
                  <h6 className="fw-bold text-success mb-1 text-center" style={{ fontSize: '1.05rem', minHeight: 28, maxHeight: 32, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', width:'100%' }}>
                    {product.name}
                  </h6>
                  <span className="badge bg-light text-dark border border-1 mb-2" style={{minHeight: 24}}>{product.quantity > 0 ? `Stock : ${product.quantity}` : 'Rupture'}</span>
                </div>
                <div className="d-flex flex-row align-items-end justify-content-between w-100 mt-auto" onClick={e => e.stopPropagation()}>
                  <input type="number" min={1} max={product.quantity} value={quantities[product.id] || 1} onChange={e => handleQuantityChange(product.id, e.target.value, product.quantity)} style={{width: 56, marginBottom: 0}} disabled={product.quantity === 0} />
                  <button className="btn btn-success ms-2" style={{height:38, minWidth:90, fontSize:'0.95em', padding:'0 12px'}} disabled={product.quantity === 0} onClick={e => handleAddToCart(e, product)}>
                    Ajouter au panier
                  </button>
                </div>
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
          box-shadow: 0 8px 24px 0 rgba(40,167,69,0.10), 0 1.5px 6px 0 rgba(0,0,0,0.08);
          transform: translateY(-2px) scale(1.01);
          border-color: #19875422;
        }
      `}</style>
    </div>
  );
}

export default AchatProducts;

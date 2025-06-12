import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function AchatProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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
                className="product-card-hz d-flex align-items-center bg-white shadow-sm border rounded-4 p-2 mb-2"
                key={product.id}
                style={{ minWidth: 320, maxWidth: 420, flex: '1 1 350px', height: 120, cursor: 'pointer' }}
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
                <button className="btn btn-warning ms-3 align-self-center" style={{height:38, minWidth:38, fontSize:'0.95em', padding:'0 12px'}} disabled onClick={e => e.stopPropagation()}>🛒</button>
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

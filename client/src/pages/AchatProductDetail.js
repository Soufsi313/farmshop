import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaHeart, FaShareAlt, FaArrowLeft, FaShoppingCart, FaRegStar } from 'react-icons/fa';

function AchatProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [likeCount, setLikeCount] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [likeLoading, setLikeLoading] = useState(false);
  const [mainImage, setMainImage] = useState(null);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [wishlistAdded, setWishlistAdded] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`http://localhost:3000/products/${id}`);
        const data = await res.json();
        if (res.ok) {
          setProduct(data.product || null);
          setLikeCount(data.product?.likeCount || 0);
          setMainImage(data.product?.mainImage ? `http://localhost:3000${data.product.mainImage}` : null);
        } else {
          setError(data.message || 'Produit introuvable.');
        }
      } catch (err) {
        setError('Erreur serveur');
      }
      setLoading(false);
    };
    fetchProduct();
  }, [id]);

  const handleLike = async () => {
    setLikeLoading(true);
    try {
      await fetch('http://localhost:3000/products/like-share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: id, userId: 1 }) // TODO: replace userId by real user
      });
      setLikeCount(likeCount + 1);
    } catch {}
    setLikeLoading(false);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: product.description,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Lien copié dans le presse-papier !');
    }
  };

  const handleAddToCart = () => {
    // TODO: call backend to add to cart
    alert(`Ajouté au panier : ${quantity} x ${product.name}`);
  };

  const handleAddToWishlist = async () => {
    setWishlistLoading(true);
    try {
      const userStr = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      if (!userStr || !token) {
        alert('Vous devez être connecté pour ajouter à la wishlist.');
        setWishlistLoading(false);
        return;
      }
      const user = JSON.parse(userStr);
      // Récupère le token CSRF
      const csrfRes = await fetch('http://localhost:3000/csrf-token', { credentials: 'include' });
      const csrfData = await csrfRes.json();
      const res = await fetch('http://localhost:3000/wishlist/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'x-csrf-token': csrfData.csrfToken
        },
        credentials: 'include',
        body: JSON.stringify({ productId: id, userId: user.id })
      });
      if (res.ok) setWishlistAdded(true);
      else alert('Erreur lors de l’ajout à la wishlist.');
    } catch {}
    setWishlistLoading(false);
  };

  if (loading) return <div className="text-center py-5"><div className="spinner-border text-success" role="status"><span className="visually-hidden">Chargement...</span></div></div>;
  if (error || !product) return <div className="alert alert-danger text-center my-5">{error || 'Produit introuvable.'}</div>;

  const gallery = Array.isArray(product.galleryImages) ? product.galleryImages : [];

  return (
    <div className="container py-5">
      <button className="btn btn-link text-success mb-4" onClick={() => navigate(-1)}><FaArrowLeft className="me-1" /> Retour</button>
      <div className="row justify-content-center">
        <div className="col-12 col-xl-10"> {/* extra large */}
          <div className="card shadow border-0 p-5" style={{minHeight:480}}>
            <div className="row g-5 align-items-center">
              <div className="col-12 col-md-6 text-center">
                {mainImage && (
                  <img src={mainImage} alt={product.name} className="img-fluid rounded-4 bg-light p-3" style={{ maxHeight: 440, objectFit: 'contain', maxWidth: '100%' }} />
                )}
                {gallery.length > 0 && (
                  <div className="d-flex flex-wrap gap-3 justify-content-center mt-4">
                    {[product.mainImage, ...gallery].filter((img, idx, arr) => img && arr.indexOf(img) === idx).map((img, idx) => (
                      <img
                        key={idx}
                        src={`http://localhost:3000${img}`}
                        alt={`miniature-${idx}`}
                        className={`rounded-3 border ${mainImage === `http://localhost:3000${img}` ? 'border-success border-3' : 'border-1'}`}
                        style={{ width: 80, height: 80, objectFit: 'cover', cursor: 'pointer', background: '#f8f9fa' }}
                        onClick={() => setMainImage(`http://localhost:3000${img}`)}
                      />
                    ))}
                  </div>
                )}
              </div>
              <div className="col-12 col-md-6">
                <h2 className="fw-bold text-success mb-4" style={{ fontSize: '2.7rem' }}>{product.name}</h2>
                <div className="mb-4">
                  <span className="fw-bold" style={{fontSize:'2.5rem'}}>{product.price} € <span className="text-secondary" style={{fontSize:'1.7rem'}}>{product.symbol}</span></span>
                  <span className="badge bg-light text-dark border border-1 ms-4" style={{fontSize:'1.3rem', padding:'0.7em 1.2em'}}>{product.quantity > 0 ? `Stock : ${product.quantity}` : 'Rupture'}</span>
                </div>
                <p className="text-muted mb-5" style={{fontSize:'1.35rem'}}>{product.description}</p>
                <div className="d-flex align-items-center gap-3 mb-4">
                  <button className="btn btn-outline-danger d-flex align-items-center px-3 py-2" onClick={handleLike} disabled={likeLoading} title="J'aime" style={{fontSize:'1.1rem'}}>
                    <FaHeart className="me-2" /> {likeCount}
                  </button>
                  <button className="btn btn-outline-primary d-flex align-items-center px-3 py-2" onClick={handleShare} title="Partager" style={{fontSize:'1.1rem'}}>
                    <FaShareAlt className="me-2" /> Partager
                  </button>
                  <button className={`btn btn-outline-warning d-flex align-items-center px-3 py-2${wishlistAdded ? ' active' : ''}`} onClick={handleAddToWishlist} disabled={wishlistLoading || wishlistAdded} title="Ajouter à la wishlist" style={{fontSize:'1.1rem'}}>
                    <FaRegStar className="me-2" /> {wishlistAdded ? 'Ajouté' : 'Wishlist'}
                  </button>
                </div>
                <div className="d-flex align-items-center gap-4 mb-3">
                  <input type="number" min="1" max={product.quantity} value={quantity} onChange={e => setQuantity(Math.max(1, Math.min(product.quantity, Number(e.target.value))))} className="form-control w-auto" style={{maxWidth:120, fontSize:'1.25rem', height:54}} />
                  <button className="btn btn-success d-flex align-items-center px-5 py-3" onClick={handleAddToCart} disabled={product.quantity === 0} style={{fontSize:'1.25rem'}}>
                    <FaShoppingCart className="me-2" /> Ajouter au panier
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AchatProductDetail;

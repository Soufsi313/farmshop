import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaHeart, FaShareAlt, FaArrowLeft, FaShoppingCart, FaRegStar, FaStar, FaFacebook, FaWhatsapp, FaTwitter } from 'react-icons/fa';
import { CartWishlistContext } from '../App';
import { getUserCart, addCartItem } from '../utils/cartApi';

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
  const [showShareMenu, setShowShareMenu] = useState(false);
  const { setCartAchatCount, setWishlistCount, wishlistCount } = useContext(CartWishlistContext);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`http://localhost:3000/products/${id}`);
        const data = await res.json();
        if (res.ok) {
          setProduct(data.product || null);
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

    // Récupère le nombre de likes réel depuis l'API
    const fetchLikeCount = async () => {
      try {
        const res = await fetch(`http://localhost:3000/product-likes/count/${id}`);
        const data = await res.json();
        setLikeCount(data.likeCount || 0);
      } catch {
        setLikeCount(0);
      }
    };
    fetchLikeCount();

    // Vérifie si le produit est déjà dans la wishlist
    const checkWishlist = async () => {
      const userStr = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      if (!userStr || !token) return;
      const user = JSON.parse(userStr);
      const res = await fetch(`http://localhost:3000/wishlist/${user.id}`, {
        headers: { 'Authorization': `Bearer ${token}` },
        credentials: 'include'
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setWishlistCount(data.length);
        setWishlistAdded(data.some(w => w.Product && w.Product.id === Number(id)));
      }
    };
    checkWishlist();
  }, [id, setWishlistCount]);

  const handleLike = async () => {
    setLikeLoading(true);
    try {
      // Récupère le token CSRF
      const csrfRes = await fetch('http://localhost:3000/csrf-token', { credentials: 'include' });
      const csrfData = await csrfRes.json();
      await fetch('http://localhost:3000/products/like-share', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrfData.csrfToken
        },
        credentials: 'include',
        body: JSON.stringify({ productId: id, userId: 1 }) // TODO: remplacer userId par le vrai user
      });
      const newCount = likeCount + 1;
      setLikeCount(newCount);
      localStorage.setItem(`likeCount_${id}`, newCount);

      // Après le like, recharge le compteur réel
      const res = await fetch(`http://localhost:3000/product-likes/count/${id}`);
      const data = await res.json();
      setLikeCount(data.likeCount || 0);
    } catch {}
    setLikeLoading(false);
  };

  const handleShareMenu = (e) => {
    e.preventDefault();
    setShowShareMenu((v) => !v);
  };

  const handleShareNetwork = (network) => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(product?.name || '');
    let shareUrl = '';
    if (network === 'facebook') shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
    if (network === 'twitter') shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${text}`;
    if (network === 'whatsapp') shareUrl = `https://wa.me/?text=${text}%20${url}`;
    window.open(shareUrl, '_blank');
    setShowShareMenu(false);
  };

  const handleAddToCart = async () => {
    const userStr = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (userStr && token) {
      try {
        const cart = await getUserCart(token);
        await addCartItem(token, cart.id, product.id, quantity);
        setCartAchatCount(c => c + 1);
        alert(`Ajouté au panier : ${quantity} x ${product.name}`);
      } catch (err) {
        alert('Erreur lors de l’ajout au panier : ' + err.message);
      }
    } else {
      setCartAchatCount(c => c + 1);
      alert(`Ajouté au panier : ${quantity} x ${product.name}`);
    }
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
      if (res.ok) {
        setWishlistAdded(true);
        setWishlistCount(c => c + 1);
      }
      else alert('Erreur lors de l’ajout à la wishlist.');
    } catch {}
    setWishlistLoading(false);
  };

  // Début utilitaire offre spéciale
  const isSpecialOfferActive = () => {
    const now = new Date();
    const start = new Date('2025-06-13T00:00:00');
    const end = new Date('2025-06-16T00:00:00');
    return now >= start && now < end;
  };
  // Fin utilitaire offre spéciale

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
                  <span className="fw-bold" style={{fontSize:'2.5rem'}}>{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(product.price)} <span className="text-secondary" style={{fontSize:'1.7rem'}}>{product.symbol}</span></span>
                  <span className="badge bg-light text-dark border border-1 ms-4" style={{fontSize:'1.3rem', padding:'0.7em 1.2em'}}>{product.quantity > 0 ? `Stock : ${product.quantity}` : 'Rupture'}</span>
                </div>
                <div className="text-muted mb-5" style={{fontSize:'1.35rem'}} dangerouslySetInnerHTML={{ __html: product.description }} />
                <div className="d-flex align-items-center gap-3 mb-4" style={{position:'relative'}}>
                  <button className="btn btn-outline-danger d-flex align-items-center px-3 py-2" onClick={handleLike} disabled={likeLoading} title="J'aime" style={{fontSize:'1.1rem'}}>
                    <FaHeart className="me-2" /> {likeCount}
                  </button>
                  <div style={{position:'relative'}}>
                    <button className="btn btn-outline-primary d-flex align-items-center px-3 py-2" onClick={handleShareMenu} title="Partager" style={{fontSize:'1.1rem'}}>
                      <FaShareAlt className="me-2" /> Partager
                    </button>
                    {showShareMenu && (
                      <div className="card shadow-sm p-2" style={{position:'absolute',top:'110%',left:0,zIndex:10,minWidth:220}}>
                        <button className="dropdown-item d-flex align-items-center gap-2" onClick={() => handleShareNetwork('facebook')}>
                          <FaFacebook style={{color:'#1877f3', fontSize:'1.3em'}} /> <span>Partager sur Facebook</span>
                        </button>
                        <button className="dropdown-item d-flex align-items-center gap-2" onClick={() => handleShareNetwork('whatsapp')}>
                          <FaWhatsapp style={{color:'#25d366', fontSize:'1.3em'}} /> <span>Partager sur WhatsApp</span>
                        </button>
                        <button className="dropdown-item d-flex align-items-center gap-2" onClick={() => handleShareNetwork('twitter')}>
                          <FaTwitter style={{color:'#1da1f2', fontSize:'1.3em'}} /> <span>Partager sur Twitter</span>
                        </button>
                      </div>
                    )}
                  </div>
                  <button className={`btn btn-outline-warning d-flex align-items-center px-3 py-2${wishlistAdded ? ' active' : ''}`} onClick={handleAddToWishlist} disabled={wishlistLoading || wishlistAdded} title="Ajouter à la wishlist" style={{fontSize:'1.1rem'}}>
                    {wishlistAdded ? <FaStar className="me-2" style={{color:'#ffc107'}} /> : <FaRegStar className="me-2" />} {wishlistAdded ? 'Ajouté' : 'Wishlist'}
                  </button>
                </div>
                {isSpecialOfferActive() && product?.specialOfferActive && product?.specialOffer && (
                  <div className="mb-3">
                    <span className="badge bg-danger text-white px-4 py-3" style={{fontSize:'1.15em',boxShadow:'0 2px 8px #d9534f44',borderRadius:10}}>
                      {product.specialOffer.description || `Offre spéciale : ${product.specialOffer.discountValue}${product.specialOffer.discountType === 'percentage' ? '%' : '€'} dès ${product.specialOffer.minQuantity}${product.symbol || ''}`}
                    </span>
                  </div>
                )}
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

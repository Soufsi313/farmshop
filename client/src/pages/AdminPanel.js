import React, { useEffect, useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'active', 'deleted'
  const limit = 10;
  const userTotalPages = Math.ceil(total / limit);

  // Product management state
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [productForm, setProductForm] = useState({
    id: null,
    name: '',
    description: '',
    price: '',
    quantity: '',
    categoryId: '',
    symbol: 'Au kg',
    mainImage: null,
    galleryImages: [],
    criticalThreshold: '',
    isAvailable: true,
    tax_rate: '6' // Valeur par défaut 6%
  });
  const [productEditMode, setProductEditMode] = useState(false);
  const [productError, setProductError] = useState('');
  const [productLoading, setProductLoading] = useState(false);
  const [productImagePreview, setProductImagePreview] = useState(null);
  const [galleryPreviews, setGalleryPreviews] = useState([]);

  // Category management state
  const [categoryForm, setCategoryForm] = useState({ id: null, name: '', description: '' });
  const [categoryEditMode, setCategoryEditMode] = useState(false);
  const [categoryError, setCategoryError] = useState('');
  const [categoryLoading, setCategoryLoading] = useState(false);

  // Pagination for products and categories
  const productLimit = 5;
  const [productPage, setProductPage] = useState(1);
  const [productTotal, setProductTotal] = useState(0);
  const productTotalPages = Math.ceil(productTotal / productLimit);

  const categoryLimit = 5;
  const [categoryPage, setCategoryPage] = useState(1);
  const [categoryTotal, setCategoryTotal] = useState(0);
  const categoryTotalPages = Math.ceil(categoryTotal / categoryLimit);

  // Tri et recherche catégories
  const [categoryOrderBy, setCategoryOrderBy] = useState('name');
  const [categoryOrderDir, setCategoryOrderDir] = useState('ASC');
  const [categorySearch, setCategorySearch] = useState('');

  // Tri et recherche produits
  const [productOrderBy, setProductOrderBy] = useState('name');
  const [productOrderDir, setProductOrderDir] = useState('ASC');
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('');

  // --- GESTION DES OFFRES SPECIALES ---
  // State
  const [offers, setOffers] = useState([]);
  const [offerForm, setOfferForm] = useState({
    id: null,
    name: '',
    description: '',
    discountType: 'percentage',
    discountValue: '',
    minQuantity: '',
    startDate: '',
    endDate: '',
    productId: ''
  });
  const [offerEditMode, setOfferEditMode] = useState(false);
  const [offerError, setOfferError] = useState('');
  const [offerLoading, setOfferLoading] = useState(false);
  const offerLimit = 5;
  const [offerPage, setOfferPage] = useState(1);
  const [offerTotal, setOfferTotal] = useState(0);
  const offerTotalPages = Math.ceil(offerTotal / offerLimit);
  const [offerOrderBy, setOfferOrderBy] = useState('startDate');
  const [offerOrderDir, setOfferOrderDir] = useState('DESC');
  const [offerSearch, setOfferSearch] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`http://localhost:3000/users/all?page=${page}&limit=${limit}`, {
          headers: { 'Authorization': `Bearer ${token}` },
          credentials: 'include'
        });
        const data = await res.json();
        if (res.ok) {
          setUsers(data.users);
          setTotal(data.total);
        } else {
          setError(data.message || 'Erreur lors du chargement des utilisateurs.');
        }
      } catch (err) {
        setError('Erreur serveur');
      }
      setLoading(false);
    };
    fetchUsers();
  }, [page]);

  // Handler suppression utilisateur
  const handleDelete = async (userId) => {
    if (!window.confirm('Confirmer la suppression de cet utilisateur ?')) return;
    setLoading(true);
    setError('');
    try {
      // Récupère le token CSRF
      const csrfRes = await fetch('http://localhost:3000/csrf-token', { credentials: 'include' });
      const csrfData = await csrfRes.json();
      const csrfToken = csrfData.csrfToken;
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:3000/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-csrf-token': csrfToken
        },
        credentials: 'include'
      });
      const data = await res.json();
      if (res.ok) {
        setUsers(users.filter(u => u.id !== userId));
        setTotal(total - 1);
      } else {
        setError(data.message || 'Erreur lors de la suppression.');
      }
    } catch (err) {
      setError('Erreur serveur');
    }
    setLoading(false);
  };

  // Handler modification de rôle
  const handleRoleChange = async (userId, newRole) => {
    setLoading(true);
    setError('');
    try {
      // Récupère le token CSRF
      const csrfRes = await fetch('http://localhost:3000/csrf-token', { credentials: 'include' });
      const csrfData = await csrfRes.json();
      const csrfToken = csrfData.csrfToken;
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:3000/users/${userId}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'x-csrf-token': csrfToken
        },
        credentials: 'include',
        body: JSON.stringify({ newRole })
      });
      const data = await res.json();
      if (res.ok) {
        // Utilise la valeur de rôle retournée par le backend (sécurité)
        setUsers(users.map(u => u.id === userId ? { ...u, role: data.user.role } : u));
      } else {
        setError(data.message || 'Erreur lors du changement de rôle.');
      }
    } catch (err) {
      setError('Erreur serveur');
    }
    setLoading(false);
  };

  // Handler réactivation utilisateur soft deleted
  const handleRestore = async (userId) => {
    if (!window.confirm('Confirmer la réactivation de ce compte ?')) return;
    setLoading(true);
    setError('');
    try {
      const csrfRes = await fetch('http://localhost:3000/csrf-token', { credentials: 'include' });
      const csrfData = await csrfRes.json();
      const csrfToken = csrfData.csrfToken;
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:3000/users/restore-account/${userId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-csrf-token': csrfToken
        },
        credentials: 'include'
      });
      if (res.ok) {
        setUsers(users.map(u => u.id === userId ? { ...u, deletedAt: null } : u));
      } else {
        setError('Erreur lors de la réactivation du compte.');
      }
    } catch (err) {
      setError('Erreur serveur');
    }
    setLoading(false);
  };

  // Utilitaire pour lire le user du localStorage sans erreur JSON.parse
  function safeGetUser() {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) return null;
      return JSON.parse(userStr);
    } catch (e) {
      localStorage.removeItem('user');
      return null;
    }
  }

  // Filtered users for display
  const filteredUsers = users.filter(u => {
    if (filter === 'active') return !u.deletedAt;
    if (filter === 'deleted') return !!u.deletedAt;
    return true;
  });

  // Fetch products and categories
  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line
  }, [productPage, productOrderBy, productOrderDir, productSearch, productCategoryFilter]);

  useEffect(() => {
    fetchCategories();
    // eslint-disable-next-line
  }, [categoryPage, categoryOrderBy, categoryOrderDir, categorySearch]);

  const fetchProducts = async () => {
    setProductLoading(true);
    setProductError('');
    try {
      const params = new URLSearchParams();
      params.append('page', productPage);
      params.append('limit', productLimit);
      params.append('orderBy', productOrderBy);
      params.append('orderDir', productOrderDir);
      if (productSearch.trim() !== '') params.append('search', productSearch);
      if (productCategoryFilter) params.append('categoryId', productCategoryFilter);
      const res = await fetch(`http://localhost:3000/products?${params.toString()}`, {
        credentials: 'include'
      });
      const data = await res.json();
      // DEBUG : Afficher le premier produit reçu
      if (data.products && data.products.length > 0) {
        console.log('Produit reçu:', data.products[0]);
        // Afficher toutes les clés et valeurs pour debug
        Object.entries(data.products[0]).forEach(([k, v]) => console.log('  ', k, v));
      }
      setProducts(data.products || []);
      setProductTotal(data.total || 0);
    } catch (err) {
      setProductError('Erreur serveur');
    }
    setProductLoading(false);
  };

  const fetchCategories = async () => {
    try {
      const params = new URLSearchParams({
        page: categoryPage,
        limit: categoryLimit,
        orderBy: categoryOrderBy,
        orderDir: categoryOrderDir
      });
      if (categorySearch.trim() !== '') {
        params.append('search', categorySearch);
      }
      const res = await fetch(`http://localhost:3000/categories?${params.toString()}`);
      const data = await res.json();
      if (res.ok) {
        setCategories(data.categories || []);
        setCategoryTotal(data.total || 0);
      }
    } catch {}
  };

  // Handler pour la recherche produit (input)
  const handleProductSearchChange = e => {
    setProductSearch(e.target.value);
    setProductPage(1);
  };

  // Handler pour le filtre catégorie produit
  const handleProductCategoryFilter = e => {
    setProductCategoryFilter(e.target.value);
    setProductPage(1);
  };

  // Handle product form changes
  const handleProductFormChange = e => {
    const { name, value, type, checked, files } = e.target;
    if (type === 'checkbox') {
      setProductForm(f => ({ ...f, [name]: checked }));
    } else if (type === 'file') {
      if (name === 'mainImage') {
        setProductForm(f => ({ ...f, mainImage: files[0] }));
        setProductImagePreview(files[0] ? URL.createObjectURL(files[0]) : null);
      } else if (name === 'galleryImages') {
        setProductForm(f => ({ ...f, galleryImages: Array.from(files) }));
        setGalleryPreviews(Array.from(files).map(f => URL.createObjectURL(f)));
      }
    } else {
      setProductForm(f => ({ ...f, [name]: value }));
    }
  };

  // Add or update product
  const handleProductSubmit = async e => {
    e.preventDefault();
    setProductLoading(true);
    setProductError('');
    try {
      const token = localStorage.getItem('token');
      const csrfRes = await fetch('http://localhost:3000/csrf-token', { credentials: 'include' });
      const csrfData = await csrfRes.json();
      const csrfToken = csrfData.csrfToken;
      const formData = new FormData();
      Object.entries(productForm).forEach(([key, val]) => {
        if (key === 'mainImage' && val) formData.append('mainImage', val);
        else if (key === 'galleryImages' && val && val.length) {
          val.forEach((img, idx) => formData.append('galleryImages', img));
        } else if (key !== 'mainImage' && key !== 'galleryImages') {
          formData.append(key, val);
        }
      });
      // Correction : forcer categoryId en nombre si présent
      if (formData.get('categoryId')) {
        formData.set('categoryId', Number(formData.get('categoryId')));
      }
      const url = productEditMode
        ? `http://localhost:3000/products/${productForm.id}`
        : 'http://localhost:3000/products/add';
      const method = productEditMode ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-csrf-token': csrfToken
        },
        credentials: 'include',
        body: formData
      });
      if (res.ok) {
        fetchProducts();
        setProductForm({
          id: null, name: '', description: '', price: '', quantity: '', categoryId: '', symbol: 'Au kg', mainImage: null, galleryImages: [], criticalThreshold: '', isAvailable: true, tax_rate: '6'
        });
        setProductEditMode(false);
        setProductImagePreview(null);
        setGalleryPreviews([]);
      } else {
        const data = await res.json();
        setProductError(data.message || 'Erreur lors de l’enregistrement du produit.');
      }
    } catch (err) {
      setProductError('Erreur serveur');
    }
    setProductLoading(false);
  };

  // Edit product
  const handleProductEdit = prod => {
    setProductForm({
      id: prod.id,
      name: prod.name,
      description: prod.description,
      price: prod.price,
      quantity: prod.quantity,
      categoryId: prod.categoryId,
      symbol: prod.symbol,
      mainImage: null,
      galleryImages: [],
      criticalThreshold: prod.criticalThreshold,
      isAvailable: prod.isAvailable
    });
    setProductEditMode(true);
    setProductImagePreview(prod.mainImage ? `http://localhost:3000${prod.mainImage}` : null);
    setGalleryPreviews(Array.isArray(prod.galleryImages) ? prod.galleryImages.map(img => `http://localhost:3000${img}`) : []);
  };

  // Delete product
  const handleProductDelete = async id => {
    if (!window.confirm('Confirmer la suppression de ce produit ?')) return;
    setProductLoading(true);
    setProductError('');
    try {
      const token = localStorage.getItem('token');
      const csrfRes = await fetch('http://localhost:3000/csrf-token', { credentials: 'include' });
      const csrfData = await csrfRes.json();
      const csrfToken = csrfData.csrfToken;
      const res = await fetch(`http://localhost:3000/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-csrf-token': csrfToken
        },
        credentials: 'include'
      });
      if (res.ok) fetchProducts();
      else {
        const data = await res.json();
        setProductError(data.message || 'Erreur lors de la suppression.');
      }
    } catch (err) {
      setProductError('Erreur serveur');
    }
    setProductLoading(false);
  };

  // Add or update category
  const handleCategorySubmit = async e => {
    e.preventDefault();
    setCategoryLoading(true);
    setCategoryError('');
    try {
      const token = localStorage.getItem('token');
      const csrfRes = await fetch('http://localhost:3000/csrf-token', { credentials: 'include' });
      const csrfData = await csrfRes.json();
      const csrfToken = csrfData.csrfToken;
      const url = categoryEditMode
        ? `http://localhost:3000/categories/${categoryForm.id}`
        : 'http://localhost:3000/categories';
      const method = categoryEditMode ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'x-csrf-token': csrfToken
        },
        credentials: 'include',
        body: JSON.stringify({ name: categoryForm.name, description: categoryForm.description })
      });
      const data = await res.json();
      if (res.ok) {
        fetchCategories();
        setCategoryForm({ id: null, name: '', description: '' });
        setCategoryEditMode(false);
      } else {
        setCategoryError(data.message || 'Erreur lors de l’enregistrement de la catégorie.');
      }
    } catch (err) {
      setCategoryError('Erreur serveur');
    }
    setCategoryLoading(false);
  };

  // Edit category
  const handleCategoryEdit = cat => {
    setCategoryForm({ id: cat.id, name: cat.name, description: cat.description });
    setCategoryEditMode(true);
  };

  // Delete category
  const handleCategoryDelete = async id => {
    if (!window.confirm('Confirmer la suppression de cette catégorie ?')) return;
    setCategoryLoading(true);
    setCategoryError('');
    try {
      const token = localStorage.getItem('token');
      const csrfRes = await fetch('http://localhost:3000/csrf-token', { credentials: 'include' });
      const csrfData = await csrfRes.json();
      const csrfToken = csrfData.csrfToken;
      const res = await fetch(`http://localhost:3000/categories/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-csrf-token': csrfToken
        },
        credentials: 'include'
      });
      if (res.ok) fetchCategories();
      else {
        const data = await res.json();
        setCategoryError(data.message || 'Erreur lors de la suppression.');
      }
    } catch (err) {
      setCategoryError('Erreur serveur');
    }
    setCategoryLoading(false);
  };

  const handleCategorySearchChange = e => {
    setCategorySearch(e.target.value);
    setCategoryPage(1);
  };

  // Fetch offers (admin)
  const fetchOffers = async () => {
    setOfferLoading(true);
    setOfferError('');
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        page: offerPage,
        limit: offerLimit,
        orderBy: offerOrderBy,
        orderDir: offerOrderDir
      });
      if (offerSearch.trim() !== '') params.append('search', offerSearch);
      const res = await fetch(`http://localhost:3000/special-offers/all?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` },
        credentials: 'include'
      });
      const data = await res.json();
      if (res.ok) {
        setOffers(data.offers || []);
        setOfferTotal(data.total || (data.offers ? data.offers.length : 0));
      } else {
        setOfferError(data.message || 'Erreur lors du chargement des offres.');
      }
    } catch (err) {
      setOfferError('Erreur serveur');
    }
    setOfferLoading(false);
  };

  useEffect(() => { fetchOffers(); /* eslint-disable-next-line */ }, [offerPage, offerOrderBy, offerOrderDir, offerSearch]);

  // Form handlers
  const handleOfferFormChange = e => {
    const { name, value } = e.target;
    setOfferForm(f => ({ ...f, [name]: value }));
  };

  const handleOfferSubmit = async e => {
    e.preventDefault();
    setOfferLoading(true);
    setOfferError('');
    try {
      const token = localStorage.getItem('token');
      const csrfRes = await fetch('http://localhost:3000/csrf-token', { credentials: 'include' });
      const csrfData = await csrfRes.json();
      const csrfToken = csrfData.csrfToken;
      const url = offerEditMode
        ? `http://localhost:3000/special-offers/${offerForm.id}`
        : 'http://localhost:3000/special-offers';
      const method = offerEditMode ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'x-csrf-token': csrfToken
        },
        credentials: 'include',
        body: JSON.stringify({
          name: offerForm.name,
          description: offerForm.description,
          discountType: offerForm.discountType,
          discountValue: offerForm.discountValue,
          minQuantity: offerForm.minQuantity,
          startDate: offerForm.startDate,
          endDate: offerForm.endDate,
          productId: offerForm.productId
        })
      });
      const data = await res.json();
      if (res.ok) {
        fetchOffers();
        setOfferForm({ id: null, name: '', description: '', discountType: 'percentage', discountValue: '', minQuantity: '', startDate: '', endDate: '', productId: '' });
        setOfferEditMode(false);
      } else {
        setOfferError(data.message || 'Erreur lors de l’enregistrement de l’offre.');
      }
    } catch (err) {
      setOfferError('Erreur serveur');
    }
    setOfferLoading(false);
  };

  const handleOfferEdit = offer => {
    setOfferForm({
      id: offer.id,
      name: offer.name,
      description: offer.description,
      discountType: offer.discountType,
      discountValue: offer.discountValue,
      minQuantity: offer.minQuantity || '',
      startDate: offer.startDate ? offer.startDate.slice(0, 10) : '',
      endDate: offer.endDate ? offer.endDate.slice(0, 10) : '',
      productId: offer.productId
    });
    setOfferEditMode(true);
  };

  const handleOfferDelete = async id => {
    if (!window.confirm('Confirmer la suppression de cette offre ?')) return;
    setOfferLoading(true);
    setOfferError('');
    try {
      const token = localStorage.getItem('token');
      const csrfRes = await fetch('http://localhost:3000/csrf-token', { credentials: 'include' });
      const csrfData = await csrfRes.json();
      const csrfToken = csrfData.csrfToken;
      const res = await fetch(`http://localhost:3000/special-offers/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-csrf-token': csrfToken
        },
        credentials: 'include'
      });
      if (res.ok) fetchOffers();
      else {
        const data = await res.json();
        setOfferError(data.message || 'Erreur lors de la suppression.');
      }
    } catch (err) {
      setOfferError('Erreur serveur');
    }
    setOfferLoading(false);
  };

  const handleOfferSearchChange = e => {
    setOfferSearch(e.target.value);
    setOfferPage(1);
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-10">
          <h1 className="display-4 mb-4 text-success text-center">Admin Panel</h1>
          <div className="mb-3 d-flex gap-2 align-items-center">
            <span>Filtrer :</span>
            <select className="form-select w-auto" value={filter} onChange={e => setFilter(e.target.value)}>
              <option value="all">Tous</option>
              <option value="active">Actifs</option>
              <option value="deleted">Supprimés</option>
            </select>
          </div>
          {error && <div className="alert alert-danger">{error}</div>}
          {loading ? (
            <div className="text-center">Chargement...</div>
          ) : (
            <>
              <div className="table-responsive">
                <table className="table table-bordered table-hover align-middle">
                  <thead className="table-success">
                    <tr>
                      <th>#</th>
                      <th>Nom d'utilisateur</th>
                      <th>Email</th>
                      <th>Rôle</th>
                      <th>Date d'inscription</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.length === 0 ? (
                      <tr><td colSpan="6" className="text-center">Aucun utilisateur</td></tr>
                    ) : filteredUsers.map((u, idx) => (
                      <tr key={u.id} className={u.deletedAt ? 'table-danger' : ''}>
                        <td>{(page - 1) * limit + idx + 1}</td>
                        <td>{u.username}</td>
                        <td>{u.email}</td>
                        <td>{u.role}</td>
                        <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                        <td>
                          {u.id !== (safeGetUser()?.id) && (
                            u.deletedAt ? (
                              <button className="btn btn-success btn-sm me-2" onClick={() => handleRestore(u.id)}>
                                Réactiver
                              </button>
                            ) : (
                              <button className="btn btn-danger btn-sm me-2" onClick={() => handleDelete(u.id)} disabled={u.role === 'Admin'}>
                                Supprimer
                              </button>
                            )
                          )}
                          {u.id !== (safeGetUser()?.id) && (
                            <select
                              className="form-select form-select-sm d-inline w-auto"
                              value={u.role}
                              style={{ minWidth: 90 }}
                              onChange={e => handleRoleChange(u.id, e.target.value)}
                            >
                              <option value="User">User</option>
                              <option value="Admin">Admin</option>
                            </select>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <nav className="d-flex justify-content-center mt-3">
                <ul className="pagination">
                  <li className={`page-item${page === 1 ? ' disabled' : ''}`}>
                    <button className="page-link" onClick={() => setPage(page - 1)} disabled={page === 1}>Précédent</button>
                  </li>
                  {[...Array(userTotalPages)].map((_, i) => (
                    <li key={i} className={`page-item${page === i + 1 ? ' active' : ''}`}>
                      <button className="page-link" onClick={() => setPage(i + 1)}>{i + 1}</button>
                    </li>
                  ))}
                  <li className={`page-item${page === userTotalPages ? ' disabled' : ''}`}>
                    <button className="page-link" onClick={() => setPage(page + 1)} disabled={page === userTotalPages}>Suivant</button>
                  </li>
                </ul>
              </nav>
            </>
          )}
        </div>
      </div>
      <hr className="my-5" />
      <div className="row justify-content-center">
        <div className="col-md-10">
          <h2 className="mb-4 text-success">Gestion des produits</h2>
          {productError && <div className="alert alert-danger">{productError}</div>}
          {productLoading ? <div>Chargement...</div> : (
            <>
              <form className="row g-3 mb-4" onSubmit={handleProductSubmit} encType="multipart/form-data">
                <input type="hidden" name="id" value={productForm.id || ''} />
                <div className="col-md-4">
                  <label className="form-label">Nom</label>
                  <input className="form-control" name="name" value={productForm.name} onChange={handleProductFormChange} required />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Prix</label>
                  <input className="form-control" name="price" type="number" min="0" step="0.01" value={productForm.price} onChange={handleProductFormChange} required />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Quantité</label>
                  <input className="form-control" name="quantity" type="number" min="0" value={productForm.quantity} onChange={handleProductFormChange} required />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Catégorie</label>
                  <select className="form-select" name="categoryId" value={productForm.categoryId} onChange={handleProductFormChange} required>
                    <option value="">Sélectionner</option>
                    {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label">Unité</label>
                  <select className="form-select" name="symbol" value={productForm.symbol} onChange={handleProductFormChange} required>
                    <option value="Au kg">Au kg</option>
                    <option value="À la pièce">À la pièce</option>
                    <option value="Au litre">Au litre</option>
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label">Seuil critique</label>
                  <input className="form-control" name="criticalThreshold" type="number" min="0" value={productForm.criticalThreshold} onChange={handleProductFormChange} required />
                </div>
                <div className="col-md-4">
                  <label className="form-label">TVA (%)</label>
                  <select className="form-select" name="tax_rate" value={productForm.tax_rate} onChange={handleProductFormChange} required>
                    <option value="6">6% (Alimentaire)</option>
                    <option value="12">12% (Spécial)</option>
                    <option value="21">21% (Non alimentaire)</option>
                  </select>
                </div>
                <div className="col-md-12">
                  <label className="form-label">Description</label>
                  <ReactQuill
                    theme="snow"
                    value={productForm.description}
                    onChange={val => setProductForm(f => ({ ...f, description: val }))}
                    modules={{
                      toolbar: [
                        [{ 'header': [1, 2, false] }],
                        ['bold', 'italic', 'underline', 'strike'],
                        [{ 'color': [] }, { 'background': [] }],
                        [{ 'align': [] }],
                        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                        ['link', 'image'],
                        [{ 'align': '' }, { 'align': 'center' }, { 'align': 'right' }, { 'align': 'justify' }],
                        ['clean']
                      ]
                    }}
                    formats={['header', 'bold', 'italic', 'underline', 'strike', 'color', 'background', 'align', 'list', 'bullet', 'link', 'image']}
                    style={{ minHeight: 120, background: '#fff', borderRadius: 8 }}
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Image principale</label>
                  <input className="form-control" name="mainImage" type="file" accept="image/*" onChange={handleProductFormChange} />
                  {productImagePreview && <img src={productImagePreview} alt="main" className="img-thumbnail mt-2" style={{ maxHeight: 80 }} />}
                </div>
                <div className="col-md-4">
                  <label className="form-label">Galerie d'images</label>
                  <input className="form-control" name="galleryImages" type="file" accept="image/*" multiple onChange={handleProductFormChange} />
                  {galleryPreviews.length > 0 && galleryPreviews.map((src, i) => <img key={i} src={src} alt="gallery" className="img-thumbnail mt-2 me-1" style={{ maxHeight: 50 }} />)}
                </div>
                <div className="col-md-2 d-flex align-items-center">
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" name="isAvailable" checked={productForm.isAvailable} onChange={handleProductFormChange} id="isAvailableCheck" />
                    <label className="form-check-label" htmlFor="isAvailableCheck">Disponible</label>
                  </div>
                </div>
                <div className="col-md-2 d-flex align-items-end">
                  <button className="btn btn-success w-100" type="submit">{productEditMode ? 'Mettre à jour' : 'Ajouter'}</button>
                </div>
                {productEditMode && (
                  <div className="col-md-2 d-flex align-items-end">
                    <button className="btn btn-secondary w-100" type="button" onClick={() => {
                      setProductEditMode(false);
                      setProductForm({ id: null, name: '', description: '', price: '', quantity: '', categoryId: '', symbol: 'Au kg', mainImage: null, galleryImages: [], criticalThreshold: '', isAvailable: true, tax_rate: '6' });
                      setProductImagePreview(null);
                      setGalleryPreviews([]);
                    }}>Annuler</button>
                  </div>
                )}
              </form>
              <div className="d-flex mb-2 align-items-center gap-2">
                <input
                  className="form-control w-auto"
                  type="text"
                  placeholder="Recherche..."
                  value={productSearch}
                  onChange={handleProductSearchChange}
                  style={{ minWidth: 200 }}
                />
                <select className="form-select w-auto" value={productCategoryFilter} onChange={handleProductCategoryFilter}>
                  <option value="">Toutes catégories</option>
                  {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </select>
              </div>
              <div className="table-responsive">
                <table className="table table-bordered table-hover align-middle">
                  <thead className="table-success">
                    <tr>
                      <th>#</th>
                      <th style={{ cursor: 'pointer' }} onClick={() => {
                        setProductOrderBy('name');
                        setProductOrderDir(productOrderBy === 'name' && productOrderDir === 'ASC' ? 'DESC' : 'ASC');
                        setProductPage(1);
                      }}>
                        Nom {productOrderBy === 'name' ? (productOrderDir === 'ASC' ? '▲' : '▼') : ''}
                      </th>
                      <th style={{ cursor: 'pointer' }} onClick={() => {
                        setProductOrderBy('categoryId');
                        setProductOrderDir(productOrderBy === 'categoryId' && productOrderDir === 'ASC' ? 'DESC' : 'ASC');
                        setProductPage(1);
                      }}>
                        Catégorie {productOrderBy === 'categoryId' ? (productOrderDir === 'ASC' ? '▲' : '▼') : ''}
                      </th>
                      <th style={{ cursor: 'pointer' }} onClick={() => {
                        setProductOrderBy('price');
                        setProductOrderDir(productOrderBy === 'price' && productOrderDir === 'ASC' ? 'DESC' : 'ASC');
                        setProductPage(1);
                      }}>
                        Prix {productOrderBy === 'price' ? (productOrderDir === 'ASC' ? '▲' : '▼') : ''}
                      </th>
                      <th>Quantité</th>
                      <th>Unité</th>
                      <th>Seuil critique</th>
                      <th>TVA (%)</th>
                      <th>Disponible</th>
                      <th>Image</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.length === 0 ? (
                      <tr><td colSpan="11" className="text-center">Aucun produit</td></tr>
                    ) : products.map((p, idx) => (
                      <tr key={p.id} className={!p.isAvailable ? 'table-warning' : ''}>
                        <td>{(productPage - 1) * productLimit + idx + 1}</td>
                        <td>{p.name}</td>
                        <td>{categories.find(c => c.id === p.categoryId)?.name || ''}</td>
                        <td>{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(p.price)}</td>
                        <td>{p.quantity}</td>
                        <td>{p.symbol}</td>
                        <td>{p.criticalThreshold}</td>
                        <td>{p.tax_rate}</td>
                        <td>{p.isAvailable ? 'Oui' : 'Non'}</td>
                        <td>{p.mainImage && <img src={`http://localhost:3000${p.mainImage}`} alt="main" style={{ maxHeight: 40 }} />}</td>
                        <td>
                          <button className="btn btn-primary btn-sm me-2" onClick={() => handleProductEdit(p)}>Éditer</button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleProductDelete(p.id)}>Supprimer</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <nav className="d-flex justify-content-center mt-3">
                <ul className="pagination">
                  <li className={`page-item${productPage === 1 ? ' disabled' : ''}`}>
                    <button className="page-link" onClick={() => setProductPage(productPage - 1)} disabled={productPage === 1}>Précédent</button>
                  </li>
                  {[...Array(productTotalPages)].map((_, i) => (
                    <li key={i} className={`page-item${productPage === i + 1 ? ' active' : ''}`}>
                      <button className="page-link" onClick={() => setProductPage(i + 1)}>{i + 1}</button>
                    </li>
                  ))}
                  <li className={`page-item${productPage === productTotalPages ? ' disabled' : ''}`}>
                    <button className="page-link" onClick={() => setProductPage(productPage + 1)} disabled={productPage === productTotalPages}>Suivant</button>
                  </li>
                </ul>
              </nav>
            </>
          )}
        </div>
      </div>
      <hr className="my-5" />
      <div className="row justify-content-center">
        <div className="col-md-8">
          <h2 className="mb-4 text-success">Gestion des catégories</h2>
          {categoryError && <div className="alert alert-danger">{categoryError}</div>}
          {categoryLoading ? <div>Chargement...</div> : (
            <>
              <form className="row g-3 mb-4" onSubmit={handleCategorySubmit}>
                <input type="hidden" name="id" value={categoryForm.id || ''} />
                <div className="col-md-6">
                  <label className="form-label">Nom</label>
                  <input className="form-control" name="name" value={categoryForm.name} onChange={e => setCategoryForm(f => ({ ...f, name: e.target.value }))} required />
                </div>
                <div className="col-md-3 d-flex align-items-end">
                  <button className="btn btn-success w-100" type="submit">{categoryEditMode ? 'Mettre à jour' : 'Ajouter'}</button>
                </div>
                {categoryEditMode && (
                  <div className="col-md-3 d-flex align-items-end">
                    <button className="btn btn-secondary w-100" type="button" onClick={() => {
                      setCategoryEditMode(false);
                      setCategoryForm({ id: null, name: '', description: '' });
                    }}>Annuler</button>
                  </div>
                )}
              </form>
              <div className="d-flex mb-2 align-items-center gap-2">
                <input
                  className="form-control w-auto"
                  type="text"
                  placeholder="Recherche..."
                  value={categorySearch}
                  onChange={handleCategorySearchChange}
                  style={{ minWidth: 200 }}
                />
              </div>
              <div className="table-responsive">
                <table className="table table-bordered table-hover align-middle">
                  <thead className="table-success">
                    <tr>
                      <th style={{ cursor: 'pointer' }} onClick={() => {
                        setCategoryOrderBy('id');
                        setCategoryOrderDir(categoryOrderBy === 'id' && categoryOrderDir === 'ASC' ? 'DESC' : 'ASC');
                        setCategoryPage(1);
                      }}>
                        # {categoryOrderBy === 'id' ? (categoryOrderDir === 'ASC' ? '▲' : '▼') : ''}
                      </th>
                      <th style={{ cursor: 'pointer' }} onClick={() => {
                        setCategoryOrderBy('name');
                        setCategoryOrderDir(categoryOrderBy === 'name' && categoryOrderDir === 'ASC' ? 'DESC' : 'ASC');
                        setCategoryPage(1);
                      }}>
                        Nom {categoryOrderBy === 'name' ? (categoryOrderDir === 'ASC' ? '▲' : '▼') : ''}
                      </th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.length === 0 ? (
                      <tr><td colSpan="3" className="text-center">Aucune catégorie</td></tr>
                    ) : categories.map((cat) => (
                      <tr key={cat.id}>
                        <td>{cat.id}</td>
                        <td>{cat.name}</td>
                        <td>
                          <button className="btn btn-primary btn-sm me-2" onClick={() => handleCategoryEdit(cat)}>Éditer</button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleCategoryDelete(cat.id)}>Supprimer</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <nav className="d-flex justify-content-center mt-3">
                {categoryTotalPages > 1 && (
                  <ul className="pagination">
                    <li className={`page-item${categoryPage === 1 ? ' disabled' : ''}`}>
                      <button className="page-link" onClick={() => setCategoryPage(categoryPage - 1)} disabled={categoryPage === 1}>Précédent</button>
                    </li>
                    {[...Array(categoryTotalPages)].map((_, i) => (
                      <li key={i} className={`page-item${categoryPage === i + 1 ? ' active' : ''}`}>
                        <button className="page-link" onClick={() => setCategoryPage(i + 1)}>{i + 1}</button>
                      </li>
                    ))}
                    <li className={`page-item${categoryPage === categoryTotalPages ? ' disabled' : ''}`}>
                      <button className="page-link" onClick={() => setCategoryPage(categoryPage + 1)} disabled={categoryPage === categoryTotalPages}>Suivant</button>
                    </li>
                  </ul>
                )}
              </nav>
            </>
          )}
        </div>
      </div>
      <hr className="my-5" />
      <div className="row justify-content-center">
        <div className="col-md-8">
          <h2 className="mb-4 text-success">Gestion des offres spéciales</h2>
          {offerError && <div className="alert alert-danger">{offerError}</div>}
          {offerLoading ? <div>Chargement...</div> : (
            <>
              <form className="row g-3 mb-4" onSubmit={handleOfferSubmit}>
                <input type="hidden" name="id" value={offerForm.id || ''} />
                <div className="col-md-6">
                  <label className="form-label">Nom de l'offre</label>
                  <input className="form-control" name="name" value={offerForm.name} onChange={handleOfferFormChange} required />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Produit concerné</label>
                  <select className="form-select" name="productId" value={offerForm.productId} onChange={handleOfferFormChange} required>
                    <option value="">Sélectionner</option>
                    {products.map(prod => <option key={prod.id} value={prod.id}>{prod.name}</option>)}
                  </select>
                </div>
                <div className="col-md-12">
                  <label className="form-label">Description</label>
                  <textarea className="form-control" name="description" value={offerForm.description} onChange={handleOfferFormChange} />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Type de remise</label>
                  <select className="form-select" name="discountType" value={offerForm.discountType} onChange={handleOfferFormChange} required>
                    <option value="percentage">Pourcentage (%)</option>
                    <option value="fixed">Montant fixe (€)</option>
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label">Valeur de la remise</label>
                  <input className="form-control" name="discountValue" type="number" min="0" step="0.01" value={offerForm.discountValue} onChange={handleOfferFormChange} required />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Quantité min. (optionnel)</label>
                  <input className="form-control" name="minQuantity" type="number" min="0" value={offerForm.minQuantity} onChange={handleOfferFormChange} />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Date de début</label>
                  <input className="form-control" name="startDate" type="date" value={offerForm.startDate} onChange={handleOfferFormChange} required />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Date de fin</label>
                  <input className="form-control" name="endDate" type="date" value={offerForm.endDate} onChange={handleOfferFormChange} required />
                </div>
                <div className="col-md-2 d-flex align-items-end">
                  <button className="btn btn-success w-100" type="submit">{offerEditMode ? 'Mettre à jour' : 'Ajouter'}</button>
                </div>
                {offerEditMode && (
                  <div className="col-md-2 d-flex align-items-end">
                    <button className="btn btn-secondary w-100" type="button" onClick={() => {
                      setOfferEditMode(false);
                      setOfferForm({ id: null, name: '', description: '', discountType: 'percentage', discountValue: '', minQuantity: '', startDate: '', endDate: '', productId: '' });
                    }}>Annuler</button>
                  </div>
                )}
              </form>
              <div className="d-flex mb-2 align-items-center gap-2">
                <input
                  className="form-control w-auto"
                  type="text"
                  placeholder="Recherche..."
                  value={offerSearch}
                  onChange={handleOfferSearchChange}
                  style={{ minWidth: 200 }}
                />
              </div>
              <div className="table-responsive">
                <table className="table table-bordered table-hover align-middle">
                  <thead className="table-success">
                    <tr>
                      <th style={{ cursor: 'pointer' }} onClick={() => {
                        setOfferOrderBy('name');
                        setOfferOrderDir(offerOrderBy === 'name' && offerOrderDir === 'ASC' ? 'DESC' : 'ASC');
                        setOfferPage(1);
                      }}>
                        Nom {offerOrderBy === 'name' ? (offerOrderDir === 'ASC' ? '▲' : '▼') : ''}
                      </th>
                      <th style={{ cursor: 'pointer' }} onClick={() => {
                        setOfferOrderBy('startDate');
                        setOfferOrderDir(offerOrderBy === 'startDate' && offerOrderDir === 'ASC' ? 'DESC' : 'ASC');
                        setOfferPage(1);
                      }}>
                        Début {offerOrderBy === 'startDate' ? (offerOrderDir === 'ASC' ? '▲' : '▼') : ''}
                      </th>
                      <th>Fin</th>
                      <th>Produit</th>
                      <th>Remise</th>
                      <th>Qté min.</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {offers.length === 0 ? (
                      <tr><td colSpan="7" className="text-center">Aucune offre</td></tr>
                    ) : offers.map((offer) => (
                      <tr key={offer.id}>
                        <td>{offer.name}</td>
                        <td>{offer.startDate ? new Date(offer.startDate).toLocaleDateString() : ''}</td>
                        <td>{offer.endDate ? new Date(offer.endDate).toLocaleDateString() : ''}</td>
                        <td>{offer.product?.name || (products.find(p => p.id === offer.productId)?.name || '')}</td>
                        <td>{offer.discountType === 'percentage' ? `${offer.discountValue}%` : `${offer.discountValue} €`}</td>
                        <td>{offer.minQuantity || '-'}</td>
                        <td>
                          <button className="btn btn-primary btn-sm me-2" onClick={() => handleOfferEdit(offer)}>Éditer</button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleOfferDelete(offer.id)}>Supprimer</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <nav className="d-flex justify-content-center mt-3">
                {offerTotalPages > 1 && (
                  <ul className="pagination">
                    <li className={`page-item${offerPage === 1 ? ' disabled' : ''}`}>
                      <button className="page-link" onClick={() => setOfferPage(offerPage - 1)} disabled={offerPage === 1}>Précédent</button>
                    </li>
                    {[...Array(offerTotalPages)].map((_, i) => (
                      <li key={i} className={`page-item${offerPage === i + 1 ? ' active' : ''}`}>
                        <button className="page-link" onClick={() => setOfferPage(i + 1)}>{i + 1}</button>
                      </li>
                    ))}
                    <li className={`page-item${offerPage === offerTotalPages ? ' disabled' : ''}`}>
                      <button className="page-link" onClick={() => setOfferPage(offerPage + 1)} disabled={offerPage === offerTotalPages}>Suivant</button>
                    </li>
                  </ul>
                )}
              </nav>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminPanel;

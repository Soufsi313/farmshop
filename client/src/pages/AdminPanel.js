import React, { useEffect, useState } from 'react';

function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'active', 'deleted'
  const limit = 10;

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
    isAvailable: true
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

  const totalPages = Math.ceil(total / limit);

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
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    setProductLoading(true);
    setProductError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:3000/products', {
        headers: { 'Authorization': `Bearer ${token}` },
        credentials: 'include'
      });
      const data = await res.json();
      if (res.ok) {
        setProducts(data.products || []);
      } else {
        setProductError(data.message || 'Erreur lors du chargement des produits.');
      }
    } catch (err) {
      setProductError('Erreur serveur');
    }
    setProductLoading(false);
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('http://localhost:3000/categories');
      const data = await res.json();
      if (res.ok) {
        setCategories(data.categories || []);
      }
    } catch {}
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
          id: null, name: '', description: '', price: '', quantity: '', categoryId: '', symbol: 'Au kg', mainImage: null, galleryImages: [], criticalThreshold: '', isAvailable: true
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
                  {[...Array(totalPages)].map((_, i) => (
                    <li key={i} className={`page-item${page === i + 1 ? ' active' : ''}`}>
                      <button className="page-link" onClick={() => setPage(i + 1)}>{i + 1}</button>
                    </li>
                  ))}
                  <li className={`page-item${page === totalPages ? ' disabled' : ''}`}>
                    <button className="page-link" onClick={() => setPage(page + 1)} disabled={page === totalPages}>Suivant</button>
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
                <div className="col-md-12">
                  <label className="form-label">Description</label>
                  <textarea className="form-control" name="description" value={productForm.description} onChange={handleProductFormChange} />
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
                      setProductForm({ id: null, name: '', description: '', price: '', quantity: '', categoryId: '', symbol: 'Au kg', mainImage: null, galleryImages: [], criticalThreshold: '', isAvailable: true });
                      setProductImagePreview(null);
                      setGalleryPreviews([]);
                    }}>Annuler</button>
                  </div>
                )}
              </form>
              <div className="table-responsive">
                <table className="table table-bordered table-hover align-middle">
                  <thead className="table-success">
                    <tr>
                      <th>#</th>
                      <th>Nom</th>
                      <th>Catégorie</th>
                      <th>Prix</th>
                      <th>Quantité</th>
                      <th>Unité</th>
                      <th>Seuil critique</th>
                      <th>Disponible</th>
                      <th>Image</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.length === 0 ? (
                      <tr><td colSpan="10" className="text-center">Aucun produit</td></tr>
                    ) : products.map((p, idx) => (
                      <tr key={p.id} className={!p.isAvailable ? 'table-warning' : ''}>
                        <td>{idx + 1}</td>
                        <td>{p.name}</td>
                        <td>{categories.find(c => c.id === p.categoryId)?.name || ''}</td>
                        <td>{p.price} €</td>
                        <td>{p.quantity}</td>
                        <td>{p.symbol}</td>
                        <td>{p.criticalThreshold}</td>
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
                <div className="col-md-6">
                  <label className="form-label">Description</label>
                  <input className="form-control" name="description" value={categoryForm.description} onChange={e => setCategoryForm(f => ({ ...f, description: e.target.value }))} />
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
              <div className="table-responsive">
                <table className="table table-bordered table-hover align-middle">
                  <thead className="table-success">
                    <tr>
                      <th>#</th>
                      <th>Nom</th>
                      <th>Description</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.length === 0 ? (
                      <tr><td colSpan="4" className="text-center">Aucune catégorie</td></tr>
                    ) : categories.map((cat, idx) => (
                      <tr key={cat.id}>
                        <td>{idx + 1}</td>
                        <td>{cat.name}</td>
                        <td>{cat.description}</td>
                        <td>
                          <button className="btn btn-primary btn-sm me-2" onClick={() => handleCategoryEdit(cat)}>Éditer</button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleCategoryDelete(cat.id)}>Supprimer</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminPanel;
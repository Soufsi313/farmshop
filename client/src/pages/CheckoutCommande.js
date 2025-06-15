import React, { useState, useEffect } from 'react';
import { getUserCart } from '../utils/cartApi';
import { useNavigate } from 'react-router-dom';

function CheckoutCommande() {
  const [pays, setPays] = useState('');
  const [adresseRue, setAdresseRue] = useState('');
  const [codePostal, setCodePostal] = useState('');
  const [localite, setLocalite] = useState('');
  const [orderItems, setOrderItems] = useState([]);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const tvaRate = 6;
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchCart() {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const cart = await getUserCart(token);
        setOrderItems(cart.CartItems || []);
      } catch (err) {
        setOrderItems([]);
      }
    }
    fetchCart();
  }, []);

  // Utilitaire pour récupérer l'offre spéciale, peu importe la structure
  function getSpecialOffer(item) {
    return item.SpecialOffer || item.Product?.specialOffer;
  }

  // DEBUG : log structure reçue
  useEffect(() => {
    if (orderItems.length > 0) {
      console.log('CheckoutCommande orderItems:', orderItems);
    }
  }, [orderItems]);

  // Calculs dynamiques détaillés
  const lignesDetail = orderItems.map(item => {
    const price = item.Product?.price ?? 0;
    const qty = item.quantity;
    let discount = 0;
    const offer = getSpecialOffer(item);
    if (offer && offer.discountType && qty >= (offer.minQuantity || 0)) {
      if (offer.discountType === 'percentage') {
        discount = price * (offer.discountValue / 100) * qty;
      } else if (offer.discountType === 'fixed') {
        discount = offer.discountValue * qty;
      }
    }
    // Catégories alimentaires élargies
    const foodCategories = [
      "food", "alimentaire", "alimentation", "fruits", "légumes", "fruits et légumes"
    ];
    const isFood = foodCategories.includes((item.Product?.category?.name || '').toLowerCase());
    const tvaRateLigne = item.Product?.tax_rate !== undefined ? Number(item.Product.tax_rate) : 21;
    const totalHT = price * qty - discount;
    const tva = totalHT * (tvaRateLigne / 100);
    const totalTTC = totalHT + tva;
    return { name: item.Product?.name, qty, price, discount, totalHT, tvaRateLigne, tva, totalTTC };
  });
  // Frais de livraison : 2.50€ TTC si < 25€ TTC produits
  let fraisLivraisonTTC = lignesDetail.reduce((sum, l) => sum + l.totalTTC, 0) >= 25 ? 0 : 2.50;
  // Totaux
  const totalHT = lignesDetail.reduce((sum, l) => sum + l.totalHT, 0);
  const totalTVA = lignesDetail.reduce((sum, l) => sum + l.tva, 0);
  const totalTTC = lignesDetail.reduce((sum, l) => sum + l.totalTTC, 0) + fraisLivraisonTTC;
  console.log('totalTTC', totalTTC, 'lignesDetail', lignesDetail, 'fraisLivraison', fraisLivraisonTTC);
  const adresseComplete = `${adresseRue}, ${codePostal} ${localite}, ${pays}`;

  // Redirection Stripe Checkout
  async function handleStripeCheckout() {
    const token = localStorage.getItem('token');
    // 1. Créer la commande côté backend
    let orderId = null;
    try {
      const resOrder = await fetch('/order-items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify({
          shippingAddress: adresseRue,
          shippingPostalCode: codePostal,
          shippingCity: localite,
          shippingCountry: pays
        })
      });
      const dataOrder = await resOrder.json();
      if (!resOrder.ok || !dataOrder.orderId) {
        alert(dataOrder.message || 'Erreur lors de la création de la commande');
        return;
      }
      orderId = dataOrder.orderId;
    } catch (err) {
      alert('Erreur lors de la création de la commande');
      return;
    }
    // 2. Envoyer le montant total TTC comme un seul item à Stripe
    const lineItems = [{
      name: 'Commande FarmShop',
      amount: Math.round(totalTTC * 100), // en centimes
      quantity: 1
    }];
    // 3. Appel backend pour créer la session Stripe Checkout avec metadata
    const res = await fetch('/api/payment/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        lineItems,
        successUrl: window.location.origin + '/order-confirmed',
        cancelUrl: window.location.origin + '/checkout?canceled=1',
        metadata: { orderId },
      }),
    });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    } else {
      alert(data.error || 'Erreur lors de la redirection vers Stripe');
    }
  }

  return (
    <div className="container py-5">
      <button className="btn btn-outline-secondary mb-3" onClick={() => navigate('/panier/achat')}>
        &larr; Retour au panier
      </button>
      <h1 className="mb-4 text-success">Confirmation de commande</h1>
      <div className="mb-4">
        <label className="form-label fw-bold">Adresse de livraison</label>
        <div className="d-flex flex-column gap-2">
          <select className="form-control" value={pays} onChange={e => setPays(e.target.value)}>
            <option value="">🌍 Sélectionnez un pays</option>
            <option value="Afghanistan">Afghanistan</option>
            <option value="Afrique du Sud">Afrique du Sud</option>
            <option value="Albanie">Albanie</option>
            <option value="Algérie">Algérie</option>
            <option value="Allemagne">Allemagne</option>
            <option value="Andorre">Andorre</option>
            <option value="Angola">Angola</option>
            <option value="Arabie Saoudite">Arabie Saoudite</option>
            <option value="Argentine">Argentine</option>
            <option value="Arménie">Arménie</option>
            <option value="Australie">Australie</option>
            <option value="Autriche">Autriche</option>
            <option value="Azerbaïdjan">Azerbaïdjan</option>
            <option value="Belgique">Belgique</option>
            <option value="Bénin">Bénin</option>
            <option value="Biélorussie">Biélorussie</option>
            <option value="Birmanie">Birmanie</option>
            <option value="Bolivie">Bolivie</option>
            <option value="Bosnie-Herzégovine">Bosnie-Herzégovine</option>
            <option value="Botswana">Botswana</option>
            <option value="Brésil">Brésil</option>
            <option value="Bulgarie">Bulgarie</option>
            <option value="Burkina Faso">Burkina Faso</option>
            <option value="Burundi">Burundi</option>
            <option value="Cameroun">Cameroun</option>
            <option value="Canada">Canada</option>
            <option value="Chili">Chili</option>
            <option value="Chine">Chine</option>
            <option value="Chypre">Chypre</option>
            <option value="Colombie">Colombie</option>
            <option value="Comores">Comores</option>
            <option value="Congo">Congo</option>
            <option value="Corée du Sud">Corée du Sud</option>
            <option value="Costa Rica">Costa Rica</option>
            <option value="Côte d'Ivoire">Côte d'Ivoire</option>
            <option value="Croatie">Croatie</option>
            <option value="Cuba">Cuba</option>
            <option value="Danemark">Danemark</option>
            <option value="Djibouti">Djibouti</option>
            <option value="Dominique">Dominique</option>
            <option value="Égypte">Égypte</option>
            <option value="Émirats arabes unis">Émirats arabes unis</option>
            <option value="Équateur">Équateur</option>
            <option value="Érythrée">Érythrée</option>
            <option value="Espagne">Espagne</option>
            <option value="Estonie">Estonie</option>
            <option value="États-Unis">États-Unis</option>
            <option value="Éthiopie">Éthiopie</option>
            <option value="Finlande">Finlande</option>
            <option value="France">France</option>
            <option value="Gabon">Gabon</option>
            <option value="Gambie">Gambie</option>
            <option value="Géorgie">Géorgie</option>
            <option value="Ghana">Ghana</option>
            <option value="Grèce">Grèce</option>
            <option value="Guatemala">Guatemala</option>
            <option value="Guinée">Guinée</option>
            <option value="Guinée-Bissau">Guinée-Bissau</option>
            <option value="Guinée équatoriale">Guinée équatoriale</option>
            <option value="Guyana">Guyana</option>
            <option value="Haïti">Haïti</option>
            <option value="Honduras">Honduras</option>
            <option value="Hongrie">Hongrie</option>
            <option value="Inde">Inde</option>
            <option value="Indonésie">Indonésie</option>
            <option value="Irak">Irak</option>
            <option value="Iran">Iran</option>
            <option value="Irlande">Irlande</option>
            <option value="Islande">Islande</option>
            <option value="Israël">Israël</option>
            <option value="Italie">Italie</option>
            <option value="Jamaïque">Jamaïque</option>
            <option value="Japon">Japon</option>
            <option value="Jordanie">Jordanie</option>
            <option value="Kazakhstan">Kazakhstan</option>
            <option value="Kenya">Kenya</option>
            <option value="Kirghizistan">Kirghizistan</option>
            <option value="Kiribati">Kiribati</option>
            <option value="Koweït">Koweït</option>
            <option value="Laos">Laos</option>
            <option value="Lesotho">Lesotho</option>
            <option value="Lettonie">Lettonie</option>
            <option value="Liban">Liban</option>
            <option value="Libéria">Libéria</option>
            <option value="Libye">Libye</option>
            <option value="Liechtenstein">Liechtenstein</option>
            <option value="Lituanie">Lituanie</option>
            <option value="Luxembourg">Luxembourg</option>
            <option value="Macédoine">Macédoine</option>
            <option value="Madagascar">Madagascar</option>
            <option value="Malaisie">Malaisie</option>
            <option value="Malawi">Malawi</option>
            <option value="Maldives">Maldives</option>
            <option value="Mali">Mali</option>
            <option value="Malte">Malte</option>
            <option value="Maroc">Maroc</option>
            <option value="Marshall">Marshall</option>
            <option value="Maurice">Maurice</option>
            <option value="Mauritanie">Mauritanie</option>
            <option value="Mexique">Mexique</option>
            <option value="Micronésie">Micronésie</option>
            <option value="Moldavie">Moldavie</option>
            <option value="Monaco">Monaco</option>
            <option value="Mongolie">Mongolie</option>
            <option value="Monténégro">Monténégro</option>
            <option value="Mozambique">Mozambique</option>
            <option value="Namibie">Namibie</option>
            <option value="Nauru">Nauru</option>
            <option value="Népal">Népal</option>
            <option value="Nicaragua">Nicaragua</option>
            <option value="Niger">Niger</option>
            <option value="Nigéria">Nigéria</option>
            <option value="Norvège">Norvège</option>
            <option value="Nouvelle-Zélande">Nouvelle-Zélande</option>
            <option value="Oman">Oman</option>
            <option value="Ouganda">Ouganda</option>
            <option value="Ouzbékistan">Ouzbékistan</option>
            <option value="Pakistan">Pakistan</option>
            <option value="Palaos">Palaos</option>
            <option value="Palestine">Palestine</option>
            <option value="Panama">Panama</option>
            <option value="Papouasie-Nouvelle-Guinée">Papouasie-Nouvelle-Guinée</option>
            <option value="Paraguay">Paraguay</option>
            <option value="Pays-Bas">Pays-Bas</option>
            <option value="Pérou">Pérou</option>
            <option value="Philippines">Philippines</option>
            <option value="Pologne">Pologne</option>
            <option value="Portugal">Portugal</option>
            <option value="Qatar">Qatar</option>
            <option value="Roumanie">Roumanie</option>
            <option value="Royaume-Uni">Royaume-Uni</option>
            <option value="Russie">Russie</option>
            <option value="Rwanda">Rwanda</option>
            <option value="Saint-Kitts-et-Nevis">Saint-Kitts-et-Nevis</option>
            <option value="Saint-Marin">Saint-Marin</option>
            <option value="Saint-Vincent-et-les-Grenadines">Saint-Vincent-et-les-Grenadines</option>
            <option value="Sainte-Lucie">Sainte-Lucie</option>
            <option value="Salomon">Salomon</option>
            <option value="Salvador">Salvador</option>
            <option value="Samoa">Samoa</option>
            <option value="Sao Tomé-et-Principe">Sao Tomé-et-Principe</option>
            <option value="Sénégal">Sénégal</option>
            <option value="Serbie">Serbie</option>
            <option value="Seychelles">Seychelles</option>
            <option value="Sierra Leone">Sierra Leone</option>
            <option value="Singapour">Singapour</option>
            <option value="Slovaquie">Slovaquie</option>
            <option value="Slovénie">Slovénie</option>
            <option value="Somalie">Somalie</option>
            <option value="Soudan">Soudan</option>
            <option value="Soudan du Sud">Soudan du Sud</option>
            <option value="Sri Lanka">Sri Lanka</option>
            <option value="Suède">Suède</option>
            <option value="Suisse">Suisse</option>
            <option value="Suriname">Suriname</option>
            <option value="Syrie">Syrie</option>
            <option value="Tadjikistan">Tadjikistan</option>
            <option value="Tanzanie">Tanzanie</option>
            <option value="Tchad">Tchad</option>
            <option value="Thaïlande">Thaïlande</option>
            <option value="Timor oriental">Timor oriental</option>
            <option value="Togo">Togo</option>
            <option value="Tonga">Tonga</option>
            <option value="Trinité-et-Tobago">Trinité-et-Tobago</option>
            <option value="Tunisie">Tunisie</option>
            <option value="Turkménistan">Turkménistan</option>
            <option value="Turquie">Turquie</option>
            <option value="Tuvalu">Tuvalu</option>
            <option value="Ukraine">Ukraine</option>
            <option value="Uruguay">Uruguay</option>
            <option value="Vanuatu">Vanuatu</option>
            <option value="Vatican">Vatican</option>
            <option value="Venezuela">Venezuela</option>
            <option value="Viêt Nam">Viêt Nam</option>
            <option value="Yémen">Yémen</option>
            <option value="Zambie">Zambie</option>
            <option value="Zimbabwe">Zimbabwe</option>
          </select>
          <input type="text" className="form-control" placeholder="🏠 Adresse (rue, numéro, boîte)" value={adresseRue} onChange={e => setAdresseRue(e.target.value)} />
          <input type="text" className="form-control" placeholder="🏷️ Code postal" value={codePostal} onChange={e => setCodePostal(e.target.value)} />
          <input type="text" className="form-control" placeholder="📍 Localité" value={localite} onChange={e => setLocalite(e.target.value)} />
        </div>
      </div>
      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title">Récapitulatif de la commande</h5>
          {lignesDetail.length === 0 ? (
            <div className="text-muted">Aucun produit à afficher</div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Produit</th>
                  <th>Quantité</th>
                  <th>Prix unitaire HT</th>
                  <th>Remise</th>
                  <th>TVA</th>
                  <th>Total TTC</th>
                </tr>
              </thead>
              <tbody>
                {lignesDetail.map((l, idx) => (
                  <tr key={idx}>
                    <td>{l.name}</td>
                    <td>{l.qty}</td>
                    <td>{l.price.toFixed(2)} €</td>
                    <td className="text-danger">-{l.discount.toFixed(2)} €</td>
                    <td>{l.tva.toFixed(2)} € ({l.tvaRateLigne}%)</td>
                    <td>{l.totalTTC.toFixed(2)} €</td>
                  </tr>
                ))}
                {fraisLivraisonTTC > 0 && (
                  <tr>
                    <td>Frais de livraison</td>
                    <td>{fraisLivraisonTTC > 0 ? fraisLivraisonTTC.toFixed(2) + ' €' : '-'}</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
      <div className="mb-3">
        <strong>Total HT :</strong> {totalHT.toFixed(2)} €<br />
        <strong>Total TVA :</strong> {totalTVA.toFixed(2)} €<br />
        <strong>Total TTC :</strong> {totalTTC.toFixed(2)} €<br />
        <span className="text-danger"><strong>Frais de livraison :</strong> {fraisLivraisonTTC > 0 ? fraisLivraisonTTC.toFixed(2) + ' €' : 'offerts'} (offerts dès 25€ d'achat)</span><br />
        <strong>Total à payer :</strong> {totalTTC.toFixed(2)} €
      </div>
      {!paymentSuccess && (
        <button className="btn btn-success" onClick={handleStripeCheckout} disabled={orderItems.length === 0 || !pays || !adresseRue || !codePostal || !localite}>
          Valider et payer
        </button>
      )}
      {paymentSuccess && (
        <div className="alert alert-success mt-4">
          Paiement réussi ! Merci pour votre commande.
        </div>
      )}
    </div>
  );
}

export default CheckoutCommande;

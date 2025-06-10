import React from 'react';

function Home() {
  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8 text-center">
          <h1 className="display-4 mb-4">Bienvenue sur <span className="text-success">FarmShop</span> !</h1>
          <p className="lead">Votre boutique en ligne de produits fermiers, locale et responsable.</p>
          <a href="#" className="btn btn-success btn-lg mt-3">Découvrir nos produits</a>
        </div>
      </div>
    </div>
  );
}

export default Home;

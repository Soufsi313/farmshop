import React from 'react';

function Footer() {
  return (
    <footer className="bg-light text-center py-3 mt-5 border-top" style={{ borderTop: '2px solid #e6f4e6', background: '#fff' }}>
      <div className="container">
        <span className="text-muted">
          © 2024-2025 FarmShop. Tous droits réservés &nbsp;|&nbsp;
          <a href="https://www.afsca.be/" target="_blank" rel="noopener noreferrer" style={{ color: '#198754', textDecoration: 'underline' }}>
            Site officiel de l'AFSCA
          </a>
        </span>
      </div>
    </footer>
  );
}

export default Footer;

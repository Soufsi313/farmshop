const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');
const lusca = require('lusca');

// Middleware d'assainissement XSS avec DOMPurify
const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

function xssSanitizer(req, res, next) {
    // Fonction récursive pour nettoyer tous les champs string
    function sanitize(obj) {
        if (typeof obj === 'string') {
            return DOMPurify.sanitize(obj);
        } else if (Array.isArray(obj)) {
            return obj.map(sanitize);
        } else if (obj && typeof obj === 'object') {
            for (const key in obj) {
                obj[key] = sanitize(obj[key]);
            }
            return obj;
        }
        return obj;
    }
    if (req.body) req.body = sanitize(req.body);
    if (req.query) req.query = sanitize(req.query);
    if (req.params) req.params = sanitize(req.params);
    next();
}

// Middleware de sécurité groupé
const securityMiddleware = [
    helmet(),
    cors(),
    rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100,
        message: 'Trop de requêtes, réessayez plus tard.'
    }),
    xssSanitizer
];

module.exports = securityMiddleware;

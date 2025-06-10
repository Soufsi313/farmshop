const jwt = require('jsonwebtoken');
const User = require('../models/Users');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
const JWT_EXPIRES_IN = '2h';

// Login controller: authenticates user and returns JWT
exports.login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }
    try {
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }
        // Suppression de la vérification d'email à la connexion
        // if (!user.isEmailVerified) {
        //     return res.status(403).json({ message: 'Veuillez vérifier votre adresse email avant de vous connecter.' });
        // }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }
        // Don't include password in token payload
        const payload = { id: user.id, email: user.email, role: user.role };
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
        res.json({ token, user: payload });
    } catch (err) {
        console.error('Erreur lors du login:', err);
        res.status(500).json({ message: 'Server error.' });
    }
};

// Register controller: creates user with email verification
exports.register = async (req, res) => {
    const { email, password, username } = req.body;
    if (!email || !password || !username) {
        return res.status(400).json({ message: 'Email, username et password sont obligatoires.' });
    }
    try {
        // Vérifie si l'utilisateur existe déjà
        const existing = await User.findOne({ where: { email } });
        if (existing) {
            return res.status(400).json({ message: 'Email déjà utilisé.' });
        }
        // Génère un token de vérification unique
        const emailVerificationToken = crypto.randomBytes(32).toString('hex');
        // Crée l'utilisateur en base (non vérifié)
        const user = await User.create({
            email,
            password,
            username,
            role: 'User',
            isEmailVerified: false,
            emailVerificationToken
        });
        // Envoie l'email de vérification
        const transporter = nodemailer.createTransport({
            host: 'sandbox.smtp.mailtrap.io',
            port: 587,
            secure: false,
            auth: {
                user: process.env.MAILTRAP_USER || 'edeba16d2e8382',
                pass: process.env.MAILTRAP_PASS || '',
            },
        });
        const verifyUrl = `http://localhost:3000/users/verify-email?token=${emailVerificationToken}`;
        // Template d'email professionnel FarmShop
        const emailHtml = `
        <div style="background:#f8fff5;padding:32px 0;font-family:'Segoe UI',Arial,sans-serif;">
          <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:12px;box-shadow:0 2px 8px rgba(25,135,84,0.08);padding:32px 24px;">
            <div style="text-align:center;margin-bottom:24px;">
              <span style="display:inline-block;background:#198754;color:#fff;font-size:2rem;font-weight:bold;padding:8px 24px;border-radius:8px;letter-spacing:2px;">FarmShop</span>
            </div>
            <h2 style="color:#198754;text-align:center;margin-bottom:16px;">Bienvenue sur FarmShop !</h2>
            <p style="font-size:1.1rem;color:#222;text-align:center;margin-bottom:24px;">
              Merci de vous être inscrit sur notre boutique.<br>
              Pour activer votre compte, veuillez cliquer sur le bouton ci-dessous&nbsp;:
            </p>
            <div style="text-align:center;margin-bottom:32px;">
              <a href="${verifyUrl}" style="background:#198754;color:#fff;text-decoration:none;padding:14px 32px;border-radius:6px;font-size:1.1rem;font-weight:600;display:inline-block;box-shadow:0 2px 8px rgba(25,135,84,0.08);transition:background 0.2s;">Valider mon adresse email</a>
            </div>
            <p style="font-size:0.98rem;color:#555;text-align:center;">Si le bouton ne fonctionne pas, copiez-collez ce lien dans votre navigateur&nbsp;:<br><span style="color:#198754;word-break:break-all;">${verifyUrl}</span></p>
            <hr style="margin:32px 0 16px 0;border:none;border-top:1px solid #e6f4e6;">
            <div style="text-align:center;font-size:0.95rem;color:#888;">
              © 2024-2025 FarmShop. Tous droits réservés.<br>
              <a href="https://www.afsca.be/" style="color:#198754;text-decoration:underline;" target="_blank">Site officiel de l'AFSCA</a>
            </div>
          </div>
        </div>`;
        await transporter.sendMail({
            from: 'FarmShop <no-reply@farmshop.com>',
            to: email,
            subject: 'Vérification de votre adresse email',
            html: emailHtml
        });
        res.status(201).json({ message: 'Inscription réussie. Vérifiez votre email pour activer votre compte.' });
    } catch (err) {
        console.error('Erreur lors de l’inscription:', err);
        // Si l'utilisateur a été créé mais que l'email échoue, on renvoie quand même un message d'inscription
        if (user && user.id) {
            return res.status(201).json({ message: 'Inscription réussie, mais l’email de vérification n’a pas pu être envoyé. Contactez le support.' });
        }
        res.status(500).json({ message: 'Erreur serveur.' });
    }
};

// Middleware to protect routes
exports.authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        jwt.verify(token, JWT_SECRET, (err, user) => {
            if (err) {
                return res.status(403).json({ message: 'Invalid or expired token.' });
            }
            req.user = user;
            next();
        });
    } else {
        res.status(401).json({ message: 'Authorization token required.' });
    }
};

// Middleware for admin-only routes
exports.requireAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'Admin') {
        next();
    } else {
        res.status(403).json({ message: 'Admin access required.' });
    }
};

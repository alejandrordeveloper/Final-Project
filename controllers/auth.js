const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();
require('dotenv').config();

// Modelo de usuario
const User = require('../models/users');

// Helper para leer cookies
function parseCookies(req) {
  const header = req.headers.cookie || '';
  return header
    .split(';')
    .map(s => s.trim())
    .filter(Boolean)
    .reduce((acc, c) => {
      const idx = c.indexOf('=');
      if (idx < 0) return acc;
      acc[c.slice(0, idx)] = decodeURIComponent(c.slice(idx + 1));
      return acc;
    }, {});
}

// Middleware para proteger rutas solo para admins
function requireAdmin(req, res, next) {
  const cookies = parseCookies(req);
  const token = cookies['token'];
  if (!token) return res.status(401).send('Unauthorized');

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'admin') return res.status(403).send('Forbidden');
    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(401).send('Invalid token');
  }
}

// Endpoint de login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: 'Email y password requeridos' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).exec();
    if (!user) return res.status(401).json({ error: 'Credenciales inválidas' });

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return res.status(401).json({ error: 'Credenciales inválidas' });

    // Crear JWT
    const token = jwt.sign(
      { userId: user._id.toString(), email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
    );

    // Enviar cookie segura
    res.setHeader(
      'Set-Cookie',
      `token=${encodeURIComponent(token)}; HttpOnly; Path=/; SameSite=Lax; Max-Age=3600`
    );

    // Redirigir según rol
    res.json({
      ok: true,
      redirect: user.role === 'admin' ? '/admin' : '/dashboard',
    });
  } catch (err) {
    console.error('Login error', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Endpoint de logout
router.post('/logout', (req, res) => {
  res.setHeader('Set-Cookie', `token=; HttpOnly; Path=/; Max-Age=0`);
  res.json({ ok: true });
});

// Endpoint de registro (signup)
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: 'Email y password requeridos' });
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() }).exec();
    if (existing) return res.status(409).json({ error: 'El usuario ya existe' });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      email: email.toLowerCase().trim(),
      passwordHash,
      role: 'user'
    });

    // Generar JWT y enviar cookie (autologin después del registro)
    const token = jwt.sign(
      { userId: user._id.toString(), email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
    );

    res.setHeader(
      'Set-Cookie',
      `token=${encodeURIComponent(token)}; HttpOnly; Path=/; SameSite=Lax; Max-Age=3600`
    );

    res.status(201).json({ ok: true, redirect: '/' });
  } catch (err) {
    console.error('Register error', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = { router, requireAdmin };

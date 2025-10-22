// routes/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const supabase = require('../supabaseClient');
const router = express.Router();

// Registrar usuario
router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  const { error } = await supabase
    .from('users')
    .insert([{ username, password: hashedPassword }]);

  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json({ message: 'Usuario registrado' });
});

// Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('username', username)
    .single();

  if (error || !data) return res.status(400).json({ error: 'Usuario no encontrado' });

  const valid = await bcrypt.compare(password, data.password);
  if (!valid) return res.status(401).json({ error: 'Contraseña incorrecta' });

  res.json({ message: 'Login exitoso', user: { id: data.id, username: data.username } });
});

module.exports = router;

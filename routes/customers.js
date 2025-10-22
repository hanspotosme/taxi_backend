// routes/customers.js
const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');

// POST /api/customers → Insertar un cliente
router.post('/', async (req, res) => {
  const { name, phone, address, notes } = req.body;

  if (!name || !phone || !address) {
    return res.status(400).json({
      error: 'Faltan campos obligatorios. Asegúrate de enviar name, phone y address.'
    });
  }

  // Validación de número de teléfono (EE.UU.)
  const phoneRegex = /^\(\d{3}\) \d{3}-\d{4}$/;
  if (!phoneRegex.test(phone)) {
    return res.status(400).json({
      error: 'El número de teléfono debe tener el formato (XXX) XXX-XXXX.'
    });
  }

  const { data, error } = await supabase
    .from('customers')
    .insert([{ name, phone, address, notes }])
    .select('*');

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.status(201).json({ message: 'Cliente registrado', data: data[0] });
});

// GET /api/customers → Obtener todos los clientes
router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
});

// DELETE /api/customers/:id → Eliminar cliente
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  const { error } = await supabase
    .from('customers')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error al borrar:', error.message);
    return res.status(500).json({ error: error.message });
  }

  res.json({ message: 'Cliente eliminado correctamente' });
});

// PATCH /api/customers/:id → Actualizar cliente
router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, phone, address, notes } = req.body;

  if (!name || !phone || !address) {
    return res.status(400).json({
      error: 'Faltan campos obligatorios. Asegúrate de enviar name, phone y address.'
    });
  }

  const phoneRegex = /^\(\d{3}\) \d{3}-\d{4}$/;
  if (!phoneRegex.test(phone)) {
    return res.status(400).json({
      error: 'El número de teléfono debe tener el formato (XXX) XXX-XXXX.'
    });
  }

  const { data, error } = await supabase
    .from('customers')
    .update({ name, phone, address, notes })
    .eq('id', id)
    .select('*');

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json({ message: 'Cliente actualizado correctamente', data: data[0] });
});

module.exports = router;

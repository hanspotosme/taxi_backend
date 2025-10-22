// routes/staff.js
const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');

// POST /api/staff → Insertar personal
router.post('/', async (req, res) => {
  const { name, phone, role, vehicle_info} = req.body;

  if (!name || !phone || !role) {
    return res.status(400).json({
      error: 'Faltan campos obligatorios. Asegúrate de enviar name, phone y role.'
    });
  }

  const phoneRegex = /^\(\d{3}\) \d{3}-\d{4}$/;
  if (!phoneRegex.test(phone)) {
    return res.status(400).json({
      error: 'El número de teléfono debe tener el formato (XXX) XXX-XXXX.'
    });
  }

  const { data, error } = await supabase
    .from('staff')
    .insert([{ name, phone, role, vehicle_info}])
    .select('*');

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.status(201).json({ message: 'Personal registrado', data: data[0] });
});

// GET /api/staff → Obtener todo el personal
router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('staff')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
});

// DELETE /api/staff/:id → Eliminar personal
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  const { error } = await supabase
    .from('staff')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error al borrar:', error.message);
    return res.status(500).json({ error: error.message });
  }

  res.json({ message: 'Personal eliminado correctamente' });
});

// PATCH /api/staff/:id → Actualizar personal
router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, phone, role, vehicle_info} = req.body;

  if (!name || !phone || !role) {
    return res.status(400).json({
      error: 'Faltan campos obligatorios. Asegúrate de enviar name, phone y role.'
    });
  }

  const phoneRegex = /^\(\d{3}\) \d{3}-\d{4}$/;
  if (!phoneRegex.test(phone)) {
    return res.status(400).json({
      error: 'El número de teléfono debe tener el formato (XXX) XXX-XXXX.'
    });
  }

  const { data, error } = await supabase
    .from('staff')
    .update({ name, phone, role, vehicle_info})
    .eq('id', id)
    .select('*');

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json({ message: 'Personal actualizado correctamente', data: data[0] });
});

module.exports = router;

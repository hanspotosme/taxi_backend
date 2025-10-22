// routes/reservations.js
const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');

// POST /api/reservations → Insertar una reservación
router.post('/', async (req, res) => {
  const { name, phone, address, notes, call_time, status, created_at } = req.body;

  if (!name || !phone || !address || !call_time || !status || !created_at) {
    return res.status(400).json({
      error: 'Faltan campos obligatorios. Asegúrate de enviar name, phone, address, call_time, status y created_at.'
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
    .from('reservations')
    .insert([{ name, phone, address, notes, call_time, status, created_at }])
    .select('*');

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.status(201).json({ message: 'Reservación registrada', data: data[0] });
});

// GET /api/reservations → Obtener todas las reservaciones
router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('reservations')
    .select('*')
    .order('call_time', { ascending: true });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
});

// DELETE /api/reservations/:id → Eliminar una reservación
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  const { error } = await supabase
    .from('reservations')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error al borrar reservación:', error.message);
    return res.status(500).json({ error: error.message });
  }

  res.json({ message: 'Reservación eliminada correctamente' });
});

// PATCH /api/reservations/:id → Actualizar una reservación
router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, phone, address, notes, call_time, status } = req.body;

  if (!name || !phone || !address || !call_time || !status) {
    return res.status(400).json({
      error: 'Faltan campos obligatorios. Asegúrate de enviar name, phone, address, call_time y status.'
    });
  }

  const phoneRegex = /^\(\d{3}\) \d{3}-\d{4}$/;
  if (!phoneRegex.test(phone)) {
    return res.status(400).json({
      error: 'El número de teléfono debe tener el formato (XXX) XXX-XXXX.'
    });
  }

  const { data, error } = await supabase
    .from('reservations')
    .update({ name, phone, address, notes, call_time, status })
    .eq('id', id)
    .select('*');

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json({ message: 'Reservación actualizada correctamente', data: data[0] });
});

module.exports = router;

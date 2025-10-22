// routes/calls.js
const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');

// POST /api/calls → Insertar una llamada
router.post('/', async (req, res) => {
  const { client_name, phone, address, call_time, driver, notes } = req.body;

  // Validaciones básicas
  if (!client_name || !phone || !address || !call_time || !driver) {
    return res.status(400).json({
      error: 'Faltan campos obligatorios. Asegúrate de enviar client_name, phone, address, call_time y driver.'
    });
  }

  // Validar formato de fecha
  if (isNaN(Date.parse(call_time))) {
    return res.status(400).json({
      error: 'El formato de call_time no es válido. Usa un formato tipo: "2025-07-16T09:00:00".'
    });
  }

  // Validación de número de teléfono (formato EE.UU.)
  const phoneRegex = /^\(\d{3}\) \d{3}-\d{4}$/;
  if (!phoneRegex.test(phone)) {
    return res.status(400).json({
      error: 'El número de teléfono debe tener el formato (XXX) XXX-XXXX, por ejemplo: (213) 589-8789.'
    });
  }
  
  const { data, error } = await supabase
    .from('calls')
    .insert([{ client_name, phone, address, call_time, driver, notes }])
    .select('*'); // ⬅️ Esto hace que devuelva el registro insertado

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.status(201).json({ message: 'Llamada registrada', data: data[0] }); // ⬅️ Devolvemos solo el objeto creado
});

// GET /api/calls → Obtener todas las llamadas
router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('calls')
    .select('*')
    .order('call_time', { ascending: false });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
});

// DELETE 
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  const { error } = await supabase
    .from('calls')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error al borrar:', error.message);
    return res.status(500).json({ error: error.message });
  }

  res.json({ message: 'Llamada eliminada correctamente' });
});

// PUT O UPDATE
router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const { client_name, phone, address, call_time, driver, notes } = req.body;

  if (!client_name || !phone || !address || !call_time || !driver) {
    return res.status(400).json({
      error: 'Faltan campos obligatorios. Asegúrate de enviar client_name, phone, address, call_time y driver.'
    });
  }

  if (isNaN(Date.parse(call_time))) {
    return res.status(400).json({
      error: 'El formato de call_time no es válido.'
    });
  }

  const phoneRegex = /^\(\d{3}\) \d{3}-\d{4}$/;
  if (!phoneRegex.test(phone)) {
    return res.status(400).json({
      error: 'El número de teléfono debe tener el formato (XXX) XXX-XXXX, por ejemplo: (213) 589-8789.'
    });
  }
  
  const { data, error } = await supabase
    .from('calls')
    .update({
      client_name,
      phone,
      address,
      call_time,
      driver,
      notes
    })
    .eq('id', id)
    .select('*'); // ⬅️ Devolver registro actualizado

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json({ message: 'Llamada actualizada correctamente', data: data[0] });
});

module.exports = router;

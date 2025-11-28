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

// NUEVA RUTA: GET /api/customers/search?name=... → Buscar clientes por nombre parcial
router.get('/search', async (req, res) => {
  const { name } = req.query;

  if (!name || name.length < 2) {
    // Si la búsqueda es muy corta o vacía, devolvemos un array vacío para no sobrecargar la DB.
    return res.json([]);
  }

  // Usamos 'ilike' para buscar la cadena de texto en el campo 'name', sin importar mayúsculas/minúsculas.
  // El '%' al inicio y final permite buscar la cadena en cualquier parte del nombre.
  const { data, error } = await supabase
    .from('customers')
    .select('id, name, phone, address') // Seleccionamos solo los campos necesarios
    .ilike('name', `%${name}%`)
    .limit(10); // Limitamos a 10 resultados para no sobrecargar el frontend

  if (error) {
    console.error('Error en la búsqueda de clientes:', error.message);
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
});

module.exports = router;

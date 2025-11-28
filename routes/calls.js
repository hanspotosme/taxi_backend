// routes/calls.js
const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');

// POST /api/calls → Insertar una llamada Y verificar/crear cliente
router.post('/', async (req, res) => {
    const { client_name, phone, address, call_time, driver, notes } = req.body;

    // --- 1. Validaciones originales ---

    if (!client_name || !phone || !address || !call_time || !driver) {
        return res.status(400).json({
            error: 'Faltan campos obligatorios. Asegúrate de enviar client_name, phone, address, call_time y driver.'
        });
    }

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

    // --- 2. Lógica de Verificación y Creación de Cliente (NUEVO) ---
    try {
        // A. Buscar cliente por número de teléfono
        const { data: existingCustomer, error: searchError } = await supabase
            .from('customers')
            .select('id')
            .eq('phone', phone)
            .limit(1);

        if (searchError) throw searchError;

        // B. Si el cliente NO existe (array vacío), agregarlo a la tabla 'customer'
        if (!existingCustomer || existingCustomer.length === 0) {
            const newCustomerData = {
                name: client_name,
                phone: phone,
                address: address,
                notes: '',
            };

            const { error: insertCustomerError } = await supabase
                .from('customers')
                .insert([newCustomerData]);

            if (insertCustomerError) {
                // Registra el error pero no detiene la llamada (priorizamos el registro de la llamada)
                console.error('⚠️ Error al insertar nuevo cliente:', insertCustomerError.message);
                // Aquí podrías añadir un mensaje de advertencia si lo deseas
            }
        }
        // Si ya existe, simplemente se omite la inserción del cliente.

        // --- 3. Insertar el registro de la llamada (Original) ---

        const { data: newCallData, error: callError } = await supabase
            .from('calls')
            .insert([{ client_name, phone, address, call_time, driver, notes }])
            .select('*'); 

        if (callError) throw callError;

        res.status(201).json({ 
            message: 'Llamada registrada y cliente verificado/creado.', 
            data: newCallData[0] 
        });

    } catch (error) {
        console.error('Error en el proceso de llamada:', error.message);
        res.status(500).json({ error: 'Fallo interno del servidor al registrar la llamada.' });
    }
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

// PUT O UPDATE (Se mantiene sin cambios, ya que solo aplica a 'calls')
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
        .select('*'); 

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    res.json({ message: 'Llamada actualizada correctamente', data: data[0] });
});

module.exports = router;
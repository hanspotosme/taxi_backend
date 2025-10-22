// index.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares globales
app.use(cors());
app.use(express.json());

// Rutas
const authRoutes = require('./routes/auth');
const callsRoutes = require('./routes/calls');
const customersRouter = require('./routes/customers');
const staffRouter = require('./routes/staff');
const reservationsRouter = require('./routes/reservations.js')

app.use('/api/auth', authRoutes);
app.use('/api/calls', callsRoutes);
app.use('/api/customers', customersRouter);
app.use('/api/staff', staffRouter);
app.use('/api/reservations', reservationsRouter)

// Ruta base para verificar que el servidor responde
app.get('/', (req, res) => {
  res.send('Taxi API está corriendo');
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
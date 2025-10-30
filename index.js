// index.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares globales
// Configuración de CORS
const allowedOrigins = [
  "http://localhost:3000",           // Para desarrollo local
  "https://taxi-frontend-oupw.onrender.com",
  "taxi-frontend-eta.vercel.app",   // Reemplaza con la URL real de tu frontend
  "https://taxi-frontend-wri4.vercel.app",
  "taxi-frontend-qstyb34ki-hans-potosmes-projects.vercel.app"
];

app.use(cors({
  origin: function(origin, callback){
    // Permitir requests sin origin (como desde Postman) o los que estén en la lista
    if(!origin || allowedOrigins.includes(origin)){
      callback(null, true);
    } else {
      callback(new Error("No permitido por CORS"));
    }
  },
  methods: ["GET", "POST", "PATCH", "DELETE"],
  credentials: true // solo si usas cookies/sesiones
}));

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
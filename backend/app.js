const path = require('path');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const clienteRoutes = require('./rotas/clientes');
const usuarioRoutes = require('./rotas/usuarios');
mongoose.connect('mongodb+srv://app_node:app_node@cluster0.dikzi.mongodb.net/teste_mean_vt?retryWrites=true&w=majority')
  .then(() => {
    console.log("Conexão OK")
  }).catch((e) => {
    console.log("Conexão NOK: " + e)
  });
app.use(bodyParser.json());
app.use('/imagens', express.static(path.join("backend/imagens")));
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', "*");
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE, OPTIONS ');
  next();
});
app.use('/api/clientes', clienteRoutes);
app.use('/api/usuario', usuarioRoutes);
module.exports = app;

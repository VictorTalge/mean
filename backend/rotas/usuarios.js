const express = require('express');
const router = express.Router();
const Usuario = require('../models/usuario');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

router.post('/login', (req, res, next) => {
  let user;
  Usuario.findOne({
      email: req.body.email
    }).then(u => {
      user = u;
      if (!u) {
        return res.status(401).json({
          mensagem: "email inválido"
        })
      }
      return bcrypt.compare(req.body.password, u.password);
    })
    .then(result => {
      if (!result) {
        return res.status(401).json({
          mensagem: "senha inválida"
        })
      }
      const token = jwt.sign({
          email: user.email,
          id: user._id
        },
        'minhasenha', {
          expiresIn: '1h'
        }
      )
      console.log("user: " + JSON.stringify(user));
      res.status(200).json({
        token: token,
        expiresIn: 3600, //unidade pode ser qualquer, aqui estamos usando segundos
        idUsuario: user._id
      })
    })
    .catch(err => {
      return res.status(401).json({
        mensagem: "Erro no login. Tente novamente mais tarde."
      })
    })
})

router.post('/signup', (req, res, next) => {
  bcrypt.hash(req.body.password, 10)
    .then(hash => {
      const usuario = new Usuario({
        email: req.body.email,
        password: hash
      })
      usuario.save()
        .then(result => {
          res.status(201).json({
            mensagem: "Usuario criado",
            resultado: result
          });
        })
        .catch(err => {
          res.status(500).json({
            mensagem: "Erro com as credenciais."
          })
        })
    })
})

module.exports = router;

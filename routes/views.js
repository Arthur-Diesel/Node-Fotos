var express = require('express')
var router = express.Router()
var path = require('path');
const mysql = require('sync-mysql')

require('dotenv/config')

var sql = new mysql({
    host: process.env.SQL_HOST,
    user: process.env.SQL_USER,
    password: process.env.SQL_PASSWORD,
    database: process.env.SQL_DATABASE
});


router.get('/', (req, res) =>
{
    res.status(200).sendFile(path.resolve('./public/views/index.html'))
})

router.get('/login', (req, res) =>
{
    if(req.session.loggedin != true)
    {
        res.status(200).sendFile(path.resolve('./public/views/login.html'))
    }
    else
    {
        res.status(200).redirect('/fotos')
    }
})

router.get('/register', (req, res) =>
{
    res.status(200).sendFile(path.resolve('./public/views/register.html'))
})

router.get('/fotos', (req, res) =>
{
    if (req.session.loggedin == undefined || req.session.loggedin == false)
    {
        res.status(401).redirect('/login')
    }
    else
    {
        var email = req.session.username
        var response_select_usuario = sql.query(` SELECT idUsuario FROM usuarios WHERE email = '${email}' `)
        var idUsuario = response_select_usuario[0]['idUsuario']
        var response_select_images = sql.query(` SELECT nome FROM imagens WHERE idUsuario = '${idUsuario}' `)
        let imagens = []
        for (contador_imagem in response_select_images)
        {
            imagens.push(idUsuario + "/" + response_select_images[contador_imagem].nome)
        }
        res.status(200).render('photos',
        {
            idUsuario: idUsuario,
            imagens: imagens
        })
    }
})

module.exports = router
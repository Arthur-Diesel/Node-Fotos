var express = require('express')
const multer = require('multer')
const mysql = require('sync-mysql')
const fs = require('fs')
var path = require('path');

var router = express.Router()

require('dotenv/config')

const upload = multer({ dest: 'uploads/' })

var sql = new mysql({
    host: process.env.SQL_HOST,
    user: process.env.SQL_USER,
    password: process.env.SQL_PASSWORD,
    database: process.env.SQL_DATABASE
});

router.post('/register', upload.none(), (req, res) =>
{

    let nome = req.body.nome
    let email = req.body.email
    email = email.toLowerCase()
    let senha = req.body.senha

    var response_select = sql.query(` SELECT idUsuario FROM usuarios WHERE email = '${email}'`)

    if (response_select[0] != undefined)
    {
        res.status(409).json({status: 'Email already registered!'})
        return
    }

    var response_insert = sql.query( `INSERT INTO usuarios(idUsuario, nome, email, senha) VALUES (default, '${nome}', '${email}', '${senha}' )` )

    if(response_insert['insertId'] != undefined)
    {
        fs.mkdirSync(path.resolve('./uploads') + '/' + response_insert['insertId'])
        res.status(201).redirect('/login')
    }
    else
    {
        res.status(500).json({ status: 'Server error, please contact us!' })
    }
})

router.post('/login', upload.none(), (req, res) =>
{
    let email = req.body.email
    email = email.toLowerCase()
    let senha = req.body.senha
   
    var response_select = sql.query(` SELECT idUsuario FROM usuarios WHERE email = '${email}' AND senha = '${senha}' `)

    if (response_select[0] != undefined)
    {
        // Login efetuado com sucesso!
        req.session.loggedin = true;
		req.session.username = email;
        res.status(200).redirect('/fotos')
    }
    else
    {
        // Senha ou email inválido!
        res.status(403).json({status: 'Invalid email or password!'})
    }
})

router.post('/logout', upload.none(), (req, res) =>
{
    req.session.loggedin = false
    req.session.username = ""
    res.status(200).redirect('/')
})

router.post('/upload', upload.single('image'), (req, res) =>
{
    var idUsuario = req.body.idUsuario
    var file = req.file

    check_jpg = file['originalname'].includes('.jpg') 
    check_png = file['originalname'].includes('.png') 
    check_gif = file['originalname'].includes('.gif')
    
    if(check_jpg || check_gif || check_png)
    {
        fs.renameSync(`${file['destination']}${file['filename']}`, `${file['destination']}${idUsuario}/${file['originalname']}`);
        sql.query(` INSERT INTO imagens (idImagem, idUsuario, nome) VALUES (default, '${idUsuario}', '${file['originalname']}') `)
        res.status(201).redirect('/fotos')
    }
    else
    {
        fs.unlinkSync(file['destination'] + file['filename'])
        res.status(400).json({status: 'File is not a image or a gif!'})
    }

})

router.post('/delete', upload.none(), (req, res) =>
{
    var imagem = req.body.idImagem
    var arrayImagem = imagem.split('/')
    var idUsuario = arrayImagem[0]
    var nomeImagem = arrayImagem[1]
    
    fs.unlinkSync(path.resolve('./uploads') + '/' + imagem)
    sql.query(` DELETE FROM imagens WHERE nome = '${nomeImagem}' and idUsuario = '${idUsuario}' `)
    res.status(204).redirect('/fotos')
})

module.exports = router
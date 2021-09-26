const express = require('express')
const bodyParser = require('body-parser')
const hbs = require('hbs')
const mysql = require('sync-mysql')
var session = require('express-session');
require('dotenv/config')

var sql = new mysql({
    host: process.env.SQL_HOST,
    user: process.env.SQL_USER,
    password: process.env.SQL_PASSWORD,
    database: process.env.SQL_DATABASE
});

var app = express()

var views = require('./routes/views')
var forms = require('./routes/forms')

const port = 3000

app.set('view engine', 'hbs');
app.set('views', __dirname + '/public/templates');

app.use(bodyParser.urlencoded({extended: false}))

app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));


function ensureAuthenticated(req, res, next)
{
	if(req.session.loggedin != true)
	{
		res.redirect('/login')
	}
	else
	{
		var email = req.session.username
		var url = req.url.split('/')
		var idUsuario = url[1]
		var response_select_usuario = sql.query(` SELECT idUsuario FROM usuarios WHERE email = '${email}' `)
		if(response_select_usuario[0]['idUsuario'] == idUsuario)
		{
			next()
		}
		else
		{
			res.status(401).json({status: 'Unauthorized access!'})
		}
	}
}

app.use('/uploads', ensureAuthenticated)
app.use('/uploads', express.static('uploads'))


app.use('/', views)
app.use('/', forms)

app.listen(port, () =>
{
    console.log('ON: ' + 'localhost:' + port)
})
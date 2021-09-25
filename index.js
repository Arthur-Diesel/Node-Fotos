const express = require('express')
const bodyParser = require('body-parser')
const hbs = require('hbs')

var session = require('express-session');

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
		next()
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
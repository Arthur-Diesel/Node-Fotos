const express = require('express')
const bodyParser = require('body-parser')
const hbs = require('hbs')

var session = require('express-session');

var app = express()

var views = require('./routes/views')
var forms = require('./routes/forms')

app.use(express.static('uploads')); 

const port = 3000

app.set('view engine', 'hbs');
app.set('views', __dirname + '/public/templates');

app.use(bodyParser.urlencoded({extended: false}))

app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));

app.use('/', views)
app.use('/', forms)

app.listen(port, () =>
{
    console.log('ON: ' + 'localhost:' + port)
})
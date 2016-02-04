/* jshint node: true, browser: false */
'use strict';

// CREATE HTTP SERVER AND PROXY

var app = require('express')();
var proxy   = require('http-proxy').createProxyServer({});

app.set('views', __dirname + '/app');
app.set('view engine', 'ejs');

app.use(require('morgan')('dev'));

// LOAD CONFIGURATION

app.set('port', process.env.PORT || 2050);

// CONFIGURE /APP/* ROUTES

app.use('/app',   require('serve-static')(__dirname + '/app_build'));
app.use('/app',   require('serve-static')(__dirname + '/app'));
app.all('/api/*', function(req, res) { proxy.web(req, res, { target: 'https://api.cbd.int:443', secure: false } ); } );
app.all('/app/*', function(req, res) { res.status(404).send(); } );

// CONFIGURE TEMPLATE

app.get('/*', function (req, res) { res.render('template', { baseUrl: req.headers.base_url || '/' }); });

// START SERVER

app.listen(app.get('port'), function () {
	console.log('Server listening on %j', this.address());
});
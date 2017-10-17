/* jshint node: true, browser: false, esnext: true */
'use strict';

process.on('SIGTERM', ()=>process.exit());

// CREATE HTTP SERVER AND PROXY

var app = require('express')();
var proxy   = require('http-proxy').createProxyServer({});

app.set('views', __dirname + '/app');
app.set('view engine', 'ejs');

app.use(require('morgan')('dev'));

// LOAD CONFIGURATION

app.set('port', process.env.PORT || 2050);

// CONFIGURE /APP/* ROUTES
if(!process.env.API_URL) {
    console.warn('warning: evironment API_URL not set. USING default (https://api.cbd.int:443)');
}

var apiUrl = process.env.API_URL || 'https://api.cbd.int:443';
var gitVersion = (process.env.COMMIT || 'UNKNOWN').substr(0, 7);

console.info(`info: www.cbd.int/side-events`);
console.info(`info: Git version: ${gitVersion}`);
console.info(`info: API address: ${apiUrl}`);


app.use('/app',           app.static(__dirname + '/app', { setHeaders: setCustomCacheControl }));
app.all('/api/*', (req, res) => proxy.web(req, res, { target: apiUrl, changeOrigin: true, secure:false }));

app.all('/app/*', function(req, res) { res.status(404).send(); } );

// CONFIGURE TEMPLATE
app.get('/*', function (req, res) {
	res.cookie('VERSION', process.env.VERSION);
	res.setHeader('Cache-Control', 'public, max-age=0');
	res.render('template', { baseUrl: req.headers.base_url || '/' });
});

// START SERVER

app.listen(app.get('port'), function () {
	console.log('Server listening on %j', this.address());
});

// Handle proxy errors ignore

proxy.on('error', function (e,req, res) {
    console.error('proxy error:', e);
    res.status(502).send();
});
process.on('SIGTERM', ()=>process.exit());
//============================================================
//
//
//============================================================
function setCustomCacheControl(res, path) {

	if(res.req.query && res.req.query.v && res.req.query.v==gitVersion && gitVersion!='UNKNOWN')
        return res.setHeader('Cache-Control', 'public, max-age=86400000'); // one day

    res.setHeader('Cache-Control', 'public, max-age=0');
}

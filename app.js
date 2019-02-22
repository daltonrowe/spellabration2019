var config = require("./config.json");
var path = require('path');
var fs = require('fs');


/* ------------------------------------------------------------------------ */
/* Populate Media Items on Reload */
/* ------------------------------------------------------------------------ */

var text = fs.readFileSync( path.join( __dirname, 'word-list.txt' ) ).toString('utf-8');
var wordBank = text.split('\n');

if( wordBank[ wordBank.length - 1 ] == '' ) {
	wordBank.splice(wordBank.length - 1, 1);
}

var videoDir = config.video_directory;
var imagesDir = config.images_directory;

function listMedia(array, dir, prefix, ext) {
	fs.readdirSync( path.join( __dirname, dir ) ).forEach(file => {
		if ( file.includes(prefix, 0) && file.includes(ext, ext.length * -1) ) {
			array.push( file.replace(prefix,'').replace(ext,'') );
		}
	})
};

var media = {};
media.trans = [];
media.background = [];
media.square = [];
media.sponsor = [];

listMedia(media.trans, videoDir, 'trans-', '.webm');
listMedia(media.background, videoDir, 'bg-', '.webm');
listMedia(media.square, imagesDir, 'square-', '.png');
listMedia(media.sponsor, imagesDir, 'sponsor-', '.png');

/* ------------------------------------------------------------------------ */
/* Websocket Connection */
/* ------------------------------------------------------------------------ */

var server = require('http').createServer(app);
var io = require('socket.io')(server);

/* ------------------------------------------------------------------------ */
/* Static Server and Websocket Connection */
/* ------------------------------------------------------------------------ */

var express = require('express');
var bodyParser = require('body-parser');
var app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.set('view engine', 'pug');
app.set('views', path.join( __dirname, 'views'));

/* Homepage */
app.use( '/', express.static( path.join( __dirname, 'public' ) ) );


/* Streaming Dashboard*/
app.get( '/dashboard/', function(req, res) {

	var dashInfo = {
		secret: config.dashboard_secret,
		trans: media.trans,
		background: media.background,
		square: media.square,
		words: JSON.stringify( wordBank )
	};

	/* Require login */
	const auth = { login: config.dashboard_user, password: config.dashboard_password };
	const b64auth = (req.headers.authorization || '').split(' ')[1] || '';
	const [login, password] = new Buffer(b64auth, 'base64').toString().split(':');

	if ( !login || !password || login !== auth.login || password !== auth.password ) {
		res.set( 'WWW-Authenticate', 'Basic realm="YBGamingStreamControls"' );
		res.status(401).send( 'Username / Password Required' );
		return;
	}
	else {
		res.render( 'dashboard', dashInfo );
	}

} );

/* Load stream layout view */
app.post( '/update/:command/', function(req, res) {

	if ( req.body.secret !== config.dashboard_secret ) {
		res.status(404).render('404.pug');
		return;
	} else {
		delete req.body.secret;
	}

	if ( typeof req.body.trans !== 'undefined' ) {
		io.emit( 'trans_play', { trans: req.body.trans });
	}

	io.emit( req.params.command, req.body);
	res.send('Got it!');

} );

/* Load stream layout view */
app.get( '/:view/', function(req, res) {

	req.params.socket_port = config.proxy_socket_port;
	req.params.socket_host = config.proxy_socket_host;
	req.params.trans = media.trans;
	req.params.background = media.background;
	req.params.square = media.square;
	req.params.sponsor = media.sponsor;

	res.render(req.params.view, req.params);
} );

/* Respond with 404 if not found */
app.use(function (err, req, res, next) {
	console.error(err.stack)
	res.status(404).render('404.pug')
})

/* ------------------------------------------------------------------------ */
/* Server Listen */
/* ------------------------------------------------------------------------ */

app.listen( config.http_port, config.http_host );
server.listen( config.socket_port, config.socket_host );

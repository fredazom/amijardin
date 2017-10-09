/*jslint node: true */

var express = require('express'),
    path = require('path'),
    favicon = require('serve-favicon'),
    logger = require('morgan'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    routes = require('./routes/index'),
    pagesHtml = require('./routes/pagesHtml'),
    map = require('./routes/map'),
    pageByUrl = require('./routes/pageByUrl'),
    gvaBounderies = require('./routes/genevaBounderies'),
    gardens = require('./routes/gardens'),
    cors = require('./routes/cors'),
    fileStorage = require('./models/fileStorage'),
    forum = require('./routes/forum'),
    nouvelles = require('./routes/nouvelles'),
    login = require('./routes/login'),
    authorizationRouter = require('./routes/authRouter'),
    app = express();

// placed before app.use(bodyParser...) to execute this rule first
app.get('/forum/question/*', bodyParser.urlencoded({ extended: false}));
app.post('/forum/question/add', bodyParser.urlencoded({ extended: false, limit: 2000000}));// limit in byte, 2mB; 1mB = 1000 Bytes, 1MB = 1024 Bytes by convention
app.post('/forum/question/response/add', bodyParser.urlencoded({ extended: false, limit: 2000000}));
app.post('/nouvelles/authaa/nouvelle/add', bodyParser.urlencoded({ extended: false, limit: 2000000}));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);
app.use(cors);
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/', authorizationRouter);
app.use('/map', map);
//app.use('/gvaBounderies', gvaBounderies);
app.use('/gardens', gardens);
//app.get('/:page', pagesHtml);
app.get('/pagecount', function (req, res) {
    res.send('{ pageCount: simulating}');
});
app.get('/nous-sommes', pageByUrl);
app.get('/buts', pageByUrl);
app.get('/classification', pageByUrl);
app.get('/experts', pageByUrl);
app.use('/nouvelles', nouvelles);
// app.post('/forum/question/add' above)
app.use('/forum', forum);
app.get('/chiffres', pageByUrl);
app.get('/contact', pageByUrl);
app.get('/soutenez-nous', pageByUrl);
app.get('/galerie', pageByUrl);
app.get('/premiere-rencontre-geneve-cultive', pageByUrl);
app.get('/deuxieme-rencontre-geneve-cultive', pageByUrl);
app.get('/troisieme-rencontre-geneve-cultive', pageByUrl);
app.get('/alternatiba-geneve-cultive', pageByUrl);
app.get('/aperos-decouvertes-jardins-urbains-geneve', pageByUrl);
app.get('/aperos-decouvertes-jardins-urbains-geneve-troinex', pageByUrl);
app.get('/aperos-decouvertes-jardins-urbains-geneve-pieds-verts', pageByUrl);
app.get('/aperos-decouvertes-ferme-lignon', pageByUrl);
app.use('/login', login);


fileStorage.on("finish", function(){
    fileStorage.currentRes.send(fileStorage.currentReq.body);
});

fileStorage.on("error", function(err){
        sendInternalErrorResponse(fileStorage.currentRes);
        throw err;
    }
);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
//if (app.get('env') === 'development') {

  app.use(function(err, req, res, next) {
    res.status(err.status || 500)
    //originally see production
    .send({
      message: err.message,
      code: err.code,
      status: err.status,
      error: err
    });
  });

//}

//// production error handler
//// no stacktraces leaked to user
//app.use(function(err, req, res, next) {
//  res.status(err.status || 500);
//  res.render('error', {
//    message: err.message,
//    error: {}
//  });
//});



function sendInternalErrorResponse(res) {
    res.statusCode = 500;
    res.setHeader('content-type', 'text/plain');
    res.end('Oops, there was a problem!\n');
}

module.exports = app;
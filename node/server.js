var express = require('express'),
    recept = require('./routes/recept'),
    blog = require('./routes/blog'),
    styrelse = require("./routes/styrelse"),
    config = require('./routes/conf');

var app = express();

var allowCrossDomain = function(req, res, next) {
    var ref = req.headers.origin;
    console.log(req.path + ": origin: " + ref);
    if (ref != null && ref != undefined) {
        for (var i = 0; i < config.allowedDomains.length; i++) {
            if(ref.match(config.allowedDomains[i])) {
                console.log("Approved origin");
                res.header('Access-Control-Allow-Origin', ref);
                break;
            }
        }
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
        res.header('Access-Control-Allow-Headers', 'Content-Type');
    }
    next();
}

app.configure(function () {
    app.use(express.logger('dev'));     /* 'default', 'short', 'tiny', 'dev' */
    app.use(express.bodyParser());
    app.use(allowCrossDomain);
});

app.get('/recept-types', recept.findAllTypes);
app.get('/recept-types/:id', recept.findTypeById);
app.get('/recept-types/:id/recept', recept.findByTypeId);
app.get('/recept', recept.findAll);
app.get('/recept/:id', recept.findById);
app.get('/recept/:id/types', recept.findTypesByReceptId);
app.get('/blog', blog.getBlog);
app.get('/styrelse', styrelse.get);

app.listen(3000);
console.log(new Date() + ' Listening on port 3000...');
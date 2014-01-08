/*
The MIT License

Copyright (c) 2013,2014 Föreningen Ambrosiasorden, Robert Sandell. All rights reserved.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
 */
var express = require('express'),
    recept = require('./routes/recept'),
    styrelse = require("./routes/styrelse"),
    album = require("./routes/album"),
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
app.get('/styrelse', styrelse.get);
app.get('/album/categories', album.categories);
app.get('/album/categories/:id', album.subcategories);
app.get('/album/categories/:category/:subcategory', album.listAlbums);
app.get('/album/:id', album.album);

app.listen(3000);
console.log(new Date() + ' Listening on port 3000...');
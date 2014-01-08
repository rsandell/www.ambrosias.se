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
var conf = require("./conf"),
    mysql = require("mysql");

var connection = mysql.createConnection(conf.mysql_conn);

var sql_types = "SELECT t.id, t.name, (SELECT COUNT(recept_id) FROM recept_types WHERE type_id=t.id) AS total FROM `type` t ORDER BY t.name";
var sql_type_recept = "SELECT id, name FROM recept WHERE id IN (SELECT recept_id FROM recept_types WHERE type_id=?) ORDER BY name";
var sql_recept_types = "SELECT id, name FROM type WHERE id IN (SELECT type_id FROM recept_types WHERE recept_id=?) ORDER BY name";
var sql_recept_type = "SELECT id, name FROM type WHERE id=?";

exports.findAllTypes = function(req, res) {
    connection.query(sql_types, function (error, rows, fields) {
        if (error) {
            throw error;
        } else {
            res.send(rows);
        }
    });
};

exports.findTypeById = function(req, res) {
  connection.query(sql_recept_type, [req.params.id] , function (error, rows, fields) {
        if (error) {
            throw error;
        } else {
            if(rows.length === 1) {
                res.send(rows[0]);
            } else {
                res.send(404);
            }
        }
    });
};

exports.findByTypeId = function(req, res) {
    connection.query(sql_type_recept, [req.params.id] ,function (error, rows, fields) {
        if (error) {
            throw error;
        } else if(rows.length <= 0) {
            res.send(404);
        } else {
            res.send(rows);
        }
    });
};

exports.findAll = function(req, res) {
  connection.query("SELECT * FROM recept", function (error, rows, fields) {
        if (error) {
            throw error;
        } else {
            res.send(rows);
        }
    });
};

exports.findTypesByReceptId = function(req, res) {
    connection.query(sql_recept_types, [req.params.id] ,function (error, rows, fields) {
        if (error) {
            throw error;
        } else if(rows.length <= 0) {
            res.send(404);
        } else {
            res.send(rows);
        }
    });
};


exports.findById = function(req, res) {
  connection.query("SELECT * FROM recept WHERE id=?", [req.params.id] , function (error, rows, fields) {
        if (error) {
            throw error;
        } else {
            if(rows.length === 1) {
                res.send(rows[0]);
            } else {
                res.send(404);
            }
        }
    });
};
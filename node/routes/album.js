var http  = require("http");
var conf  = require("./conf").album;
var mysql = require("mysql");
var urlLib = require("url");

var PICASA_ALBUMS_URL = 'http://picasaweb.google.com/data/feed/api/user/:userId:/albumid/:albumId:?alt=json&authkey=:authkey:';

var connection = mysql.createConnection(conf.mysql_conn);

function genAlbumUrl(userId, albumId, authKey) {
	var temp = PICASA_ALBUMS_URL.replace(":userId:", userId);
	temp = temp.replace(":albumId:", albumId);
	temp = temp.replace(":authkey:", authKey);
	return temp;
}

function parseAlbum(content) {
	var album = {};
	album.id = content.feed.id.$t;
    album.title = content.feed.title.$t;
    album.subtitle = content.feed.subtitle.$t;
    album.updated = content.feed.updated.$t;
    album.author = {
    	name: content.feed.author[0].name.$t, 
    	uri: content.feed.author[0].uri.$t
    };
    album.icon = content.feed.icon.$t;
    album.gphoto = {
        id: content.feed.gphoto$id.$t,
        name: content.feed.gphoto$name.$t,
        location: content.feed.gphoto$location.$t,
        access: content.feed.gphoto$access.$t,
        timestamp: content.feed.gphoto$timestamp.$t,
        numphotos: content.feed.gphoto$numphotos.$t,
        user: content.feed.gphoto$user.$t,
        nickname: content.feed.gphoto$nickname.$t,
        commentingEnabled: content.feed.gphoto$commentingEnabled.$t,
        commentCount: content.feed.gphoto$commentCount.$t,
        allowPrints: content.feed.gphoto$allowPrints.$t,
        allowDownloads: content.feed.gphoto$allowDownloads.$t
    };
    album.entries = [];
    for (var i = 0; i < content.feed.entry.length; i++) {
    	var entry = content.feed.entry[i];
    	var photo = {};
    	photo.id = entry.id.$t;
    	photo.published = entry.published.$t;
    	photo.updated = entry.updated.$t;
    	photo.title = entry.title.$t;
    	photo.summary = entry.summary.$t;
    	photo.content = entry.content;
    	photo.gphoto = {
    		id: entry.gphoto$id.$t,
    		position: entry.gphoto$position.$t,
    		albumid: entry.gphoto$albumid.$t,
    		access: entry.gphoto$access.$t,
    		width: entry.gphoto$width.$t,
    		height: entry.gphoto$height.$t,
    		size: entry.gphoto$size.$t,
    		timestamp: entry.gphoto$timestamp.$t,
    		commentingEnabled: entry.gphoto$commentingEnabled.$t,
    		commentCount: entry.gphoto$commentCount.$t,
    		license: entry.gphoto$license
    	};
        if(entry.gphoto$streamId) {
            photo.gphoto.streamId = entry.gphoto$streamId.$t;
        }
    	photo.media = {
    		content: entry.media$group.media$content[0],
    		credit: entry.media$group.media$credit.$t,
    		description: entry.media$group.media$description.$t,
    		keywords: entry.media$group.media$keywords,
    		thumbnails: entry.media$group.media$thumbnail,
    		title: entry.media$group.media$title.$t
    	};
    	album.entries.push(photo);
    }
    return album;
}

function getAlbum(userId, albumId, authKey, callback) {
	http.get(genAlbumUrl(userId, albumId, authKey), function(res) {
	    var body = '';

	    res.on('data', function(chunk) {
	        body += chunk;
	    });

	    res.on('end', function() {
	    	var content = JSON.parse(body);
            //console.log("################RETRIEVED#################");
            //console.log(content);
	    	var album = parseAlbum(content);
	    	callback(null, album);
	    });
	}).on('error', function(e) {
		console.log("Got error from picasa feed: ", e);
		callback(e, null);
	});
}

function parseRssUrl(url) {
    var regexp = /http(s){0,1}\:\/\/picasaweb\.google\.com\/data\/feed\/base\/user\/(\d+)\/albumid\/(\d+)\?.*/i;
    var arr = url.match(regexp);
    if (arr != null && arr.length >= 4) {
        var uo = urlLib.parse(url, true);
        if(uo.query && uo.query["authkey"]) {
            return {userId: arr[2], albumId: arr[3], authkey: uo.query["authkey"]};
        } else {
            console.log("Could not find the authkey query parameter in the url.");
            return null;
        }        
    } else {
        return null;
    }
}

function findYearInAlbumTitle(title) {
    var reg = /.*(\d{4}).*/i;
    var arr = title.match(reg);
    if(arr && arr.length >= 2) {
        return arr[1];
    } else {
        return null;
    }
}

function findAuthorInAlbumTitle(title) {
    var reg = /.*(\d{4})\s+(.+)$/i;
    var arr = title.match(reg);
    if(arr && arr.length >= 3) {
        return arr[2];
    } else {
        return null;
    }
}

var ALBUM_TITLE_CATEGORY_RULES = [
    {
        terms: ["nyårsafton", "nyårsbankett", "nyårs", "nyår"], //order is important
        category: "Nyår",
        subcategory: findYearInAlbumTitle,
        author: findAuthorInAlbumTitle
    },
    {
        terms: ["valborgsmässoafton", "valborgs", "valborg"], //order is important
        category: "Valborg",
        subcategory: findYearInAlbumTitle,
        author: findAuthorInAlbumTitle
    },
    {
        terms: ["midsommarafton", "midsommar"], //order is important
        category: "Valborg",
        subcategory: findYearInAlbumTitle,
        author: findAuthorInAlbumTitle
    }
];

function parseAlbumTitle(album) {
    lcTitle = album.title.toLowerCase();
    for (var i = 0; i < ALBUM_TITLE_CATEGORY_RULES.length; i++) {
        var rule = ALBUM_TITLE_CATEGORY_RULES[i];
        for (var k = 0; k < rule.terms.length; k++) {
            if(lcTitle.indexOf(rule.terms[k]) >= 0) {
                var sub = rule.subcategory(album.title);
                if(sub != null) {
                    //console.log("GPhoto User: ", album.gphoto.user);
                    //console.log("Self Id: ", conf.picasaSelfUserId);
                    if(album.gphoto.user == conf.picasaSelfUserId) {
                        //We need to parse the author as well since the photo is "self hosted".
                        console.log("Self hosted, getting author from title...");
                        var authorName = rule.author(album.title);
                        if(authorName) {
                            return {category: rule.category, subcategory: sub, author: {name: authorName, uri: null}};
                        } else {
                            console.log("Could not find author name of ", album.title);
                            return null;
                        }
                    } else {
                        return {category: rule.category, subcategory: sub};
                    }
                } else {
                    console.log("Could not find subcategory of ", album.title);
                    return null;
                }
            }
        }
    }
    console.log("Could not find any category rule matching ", album.title);
    return null;
}

var SQL_INSERT_ALBUM = "INSERT INTO album(picasa_userId, picasa_albumId, picasa_authKey, category, subcategory, authorname, authoruri, title, icon, summary) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

exports.addAlbumFromRss = function(rssUrl) {
    console.log("Attempting to get album from RSS URL: ", rssUrl);
    var info = parseRssUrl(rssUrl);
    if(info) {
        getAlbum(info.userId, info.albumId, info.authkey, function(err, album) {
            if(err) {
                throw err;
            }
            var categories = parseAlbumTitle(album);
            if(categories) {
                console.log("Categories: ", categories);
                var author = album.author;
                if (categories.author) {
                    author = categories.author;
                }
                var parameters = [info.userId, info.albumId, info.authkey, categories.category, categories.subcategory, author.name, author.uri, 
                                  album.title, album.icon, album.summary != null ? summary: ""];
                console.log("Inserting: ", parameters);
                connection.query(SQL_INSERT_ALBUM, parameters, function(err, res) {
                    if(err) {
                        throw err;
                    }
                    console.log("Result: ", res);
                    connection.end();
                });
            }
        });
    } else {
        console.log("ERROR! Unable to get info from rss url: ", rssUrl);
    }
};

var SQL_GET_CATEGORIES = "SELECT DISTINCT(category) AS category, (SELECT icon FROM album AS b WHERE b.category=a.category LIMIT 1) AS icon FROM album AS a ORDER BY category";
var SQL_GET_SUBCATEGORIES = "SELECT DISTINCT(subcategory) AS subcategory, (SELECT icon FROM album AS b WHERE b.category=a.category AND a.subcategory=b.subcategory LIMIT 1) AS icon FROM album AS a WHERE category=? ORDER BY subcategory";
var SQL_LIST_ALBUMS = "SELECT id, authorname, authoruri, title, icon, summary FROM album WHERE category=? AND subcategory=?";
var SQL_GET_ALBUM = "SELECT id, picasa_userId, picasa_albumId, picasa_authKey FROM album WHERE id=?";

exports.categories = function(req, res) {
    connection.query(SQL_GET_CATEGORIES, function (error, rows, fields) {
        if (error) {
            throw error;
        } else {            
            res.send(rows);
        }
    });
};

exports.subcategories = function(req, res) {
    connection.query(SQL_GET_SUBCATEGORIES, [req.params.id], function (error, rows, fields) {
        if (error) {
            throw error;
        } else {
            if(rows.length > 0) {
                res.send(rows);
            } else {
                res.send(404);
            }
        }
    });
};

exports.listAlbums = function(req, res) {
    connection.query(SQL_LIST_ALBUMS, [req.params.category, req.params.subcategory], function (error, rows, fields) {
        if (error) {
            throw error;
        } else {
            if(rows.length > 0) {
                res.send(rows);
            } else {
                res.send(404);
            }
        }
    });
};

exports.album = function(req, res) {
    connection.query(SQL_GET_ALBUM, [req.params.id], function (error, rows, fields) {
        if (error) {
            throw error;
        } else {
            if(rows.length === 1) {
                var data = rows[0];
                getAlbum(data.picasa_userId, data.picasa_albumId, data.picasa_authKey, function(err, album) {
                    if(err) {
                        throw err;
                    }
                    res.send(album);
                });
            } else {
                res.send(404);
            }
        }
    });
};

/*getAlbum("u", "a","k", function(err, album){
    
    console.log("################PARSED#################");
    console.log(album);
    console.log("################AlbumTitle#################");
    console.log(parseAlbumTitle(album));
});*/
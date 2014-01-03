var http  = require("http");
var conf  = require("./conf").album;
var mysql = require("mysql");

var PICASA_ALBUMS_URL = 'http://picasaweb.google.com/data/feed/api/user/:userId:/albumid/:albumId:?alt=json&authkey=:authkey:';

var connection = mysql.createConnection(conf.mysql_conn);

function genAlbumUrl(userId, albumId) {
	var temp = PICASA_ALBUMS_URL.replace(":userId:", userId);
	temp = temp.replace(":albumId:", albumId);
	temp = temp.replace(":authkey:", conf.picasaAuthKey);
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
    		streamId: entry.gphoto$streamId.$t,
    		license: entry.gphoto$license
    	};
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

function getAlbum(userId, albumId, callback) {
	http.get(genAlbumUrl(userId, albumId), function(res) {
	    var body = '';

	    res.on('data', function(chunk) {
	        body += chunk;
	    });

	    res.on('end', function() {
	    	var content = JSON.parse(body);
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
        return {userId: arr[2], albumId: arr[3]};
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

var ALBUM_TITLE_CATEGORY_RULES = [
    {
        terms: ["nyårsafton", "nyårsbankett", "nyårs", "nyår"], //order is important
        category: "Nyår",
        subcategory: findYearInAlbumTitle
    },
    {
        terms: ["valborgsmässoafton", "valborgs", "valborg"], //order is important
        category: "Valborg",
        subcategory: findYearInAlbumTitle
    },
    {
        terms: ["midsommarafton", "midsommar"], //order is important
        category: "Valborg",
        subcategory: findYearInAlbumTitle
    },
    {
        terms: ["sardinia", "vacation", "semester"], //TODO REMOVE
        category: "Semester",
        subcategory: findYearInAlbumTitle
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
                    return {category: rule.category, subcategory: sub};
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

var SQL_INSERT_ALBUM = "INSERT INTO album(picasa_userId, picasa_albumId, category, subcategory, authorname, authoruri, title, icon, summary) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)";

exports.addAlbumFromRss = function(rssUrl) {
    console.log("Attempting to get album from RSS URL: ", rssUrl);
    var info = parseRssUrl(rssUrl);
    if(info) {
        getAlbum(info.userId, info.albumId, function(err, album) {
            if(err) {
                throw err;
            }
            var categories = parseAlbumTitle(album);
            if(categories) {
                console.log("Categories: ", categories);
                var parameters = [info.userId, info.albumId, categories.category, categories.subcategory, album.author.name, album.author.uri, 
                                  album.title, album.icon, album.summary != null ? summary: ""];
                console.log("Inserting: ", parameters);
                connection.query(SQL_INSERT_ALBUM, parameters, function(err, res) {
                    if(err) {
                        throw err;
                    }
                    console.log("Result: ", res);
                });
            }
        });
    } else {
        console.log("ERROR! Unable to get info from rss url: ", rssUrl);
    }
};
var http = require("http");
var conf = require("./conf");

var PICASA_ALBUMS_URL = 'http://picasaweb.google.com/data/feed/api/user/:userId:/albumid/:albumId:?alt=json&authkey=:authkey:';

function genAlbumUrl(userId, albumId) {
	var temp = PICASA_ALBUMS_URL.replace(":userId:", userId);
	temp = temp.replace(":albumId:", albumId);
	temp = temp.replace(":authkey:", conf.album.picasaAuthKey);
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

//console.log(genAlbumUrl("118338193350288131454", "5894180450508044097"));
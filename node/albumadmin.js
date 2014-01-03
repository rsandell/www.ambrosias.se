
var album = require("./routes/album");

//If operations gets out of hand look for something more useable here
//https://github.com/joyent/node/wiki/modules#wiki-parsers-commandline

if(process.argv.length > 2) {
	if(process.argv[2] == "add") {
		if(process.argv.length > 3) {
			album.addAlbumFromRss(process.argv[3]);
		} else {
			console.log("Missing rssUrl!");
		}
	} else {
		console.log("Unknown command ", process.argv[2]);
	}
} else {
	console.log("Missing arguments!");
}
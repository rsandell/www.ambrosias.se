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
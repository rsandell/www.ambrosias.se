
var FeedParser = require('feedparser')
    , request = require('request');

exports.getBlog = function(req, res) {
    request('http://ambrosiasorden.blogspot.com/feeds/posts/default')
        .pipe(new FeedParser())
        .on('error', function(error) {
            throw error;
        })
        .on('readable', function () {
            var stream = this, item;
            var entries = [];
            while (item = stream.read()) {
                entries.push(item);
            }
            res.send(entries);
        })
}
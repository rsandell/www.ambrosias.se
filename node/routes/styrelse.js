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
var styrelsen = { people: [
    {
        name: "Matthias Svensson",
        title: "Ordförande",
        phone: "+46 706 90 32 07",
        mail: "matthias.svensson@ambrosias.se".split(''),
        replacer: null
    },
    {
        name: "Robert Sandell",
        title: "Sekreterare, Webmästare",
        phone: "+46 708 12 72 09",
        mail: "robert.sandell@ambrosias.se".split(''),
        replacer: {
            name: "Henrik Karlsson",
            mail: "henrik.karlsson@ambrosias.se".split('')
        }
    },
    {
        name: "Sara Thörnström",
        title: "Vice Ordförande",
        phone: "+46 708 99 09 97",
        mail: "sara.thornstrom@ambrosias.se".split(''),
        replacer: {
            name: "Maria Lindquist",
            mail: "maria.lindquist@ambrosias.se".split('')
        }
    },
    {
        name: "Thomas Lindh",
        title: "Kassör",
        phone: "+46 706 02 36 16",
        mail: "thomas.lindh@ambrosias.se".split(''),
        replacer: {
            name: "Amanda Karlsson",
            mail: "amanda.karlsson@ambrosias.se".split('')
        }
    }
]};


exports.get = function(req, res) {
    //res.header('Access-Control-Allow-Origin', "*");
    res.send(styrelsen);
};
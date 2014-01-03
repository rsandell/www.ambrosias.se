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
const m = require("mithril")
const archive = require('./archiveResolver.js');

m.render(document.body,
    m('div', [
        m('img', {src: archive.getUserAvatarLocationByName("ChrisClark13")})
    ])
);
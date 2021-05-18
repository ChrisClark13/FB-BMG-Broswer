const m = require("mithril")
const archive = require('./archiveResolver.js');
const $ = require("jquery");

m.render(document.body,
    m('div', [
        m('img', {src: archive.getUserAvatarLocationByName("Litwick")})
    ])
);

archive.$getXHRThreadPageByID(281788, 1).then( $body => {
    console.log($body);
    m.render(document.body,
        m.trust($body.html())
    );
});
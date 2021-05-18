const sanitize = require('sanitize-filename');
const $ = require('jquery');

const threadIndex = require('./indexes/threadIndex.json');
const postIndex = require('./indexes/postIndex.json');
const imageIndex = require('./indexes/imageIndex.json');
const PATH_HEADER = '.\\bmgArchive\\';

function prependPath(path) {
    return `${PATH_HEADER}${path}`
}

function getUserAvatarLocationByID(id) {
    return prependPath(imageIndex.userAvatarIndex[id]);
}

function getUserAvatarLocationByName(name) {
    let santizedName = sanitize(name).replace(' ', '_');
    for (let id in imageIndex.userAvatarIndex) {
        let path = imageIndex.userAvatarIndex[id];
        if (path.includes(santizedName)) {
            return prependPath(path);
        }
    }

    return '.\\imageMissing.png';
}

function $getXHRThreadPageByID(threadID, pageNum) {
    return $.get(prependPath(`${threadIndex[threadID].path}\\page-${pageNum}.html`))
        .then(data => {
            console.log($('<div></div>').append($.parseHTML(data)));
            let $body = $('<div></div>').append($.parseHTML(data)).find('.p-body-inner');
            $body.find('.notices').remove();
            return $body;
        });
}

function getPostByID(postID) {

}

module.exports = {
    prependPath,
    getUserAvatarLocationByID,
    getUserAvatarLocationByName,
    $getXHRThreadPageByID
}
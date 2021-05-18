const sanitize = require('sanitize-filename');

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

    return '';
}

module.exports = {
    prependPath,
    getUserAvatarLocationByID,
    getUserAvatarLocationByName,
}
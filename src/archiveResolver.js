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
    return prependPath(imageIndex.userAvatarIndex[id]) || '.\\imageMissing.png';
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
            //console.log($('<div></div>').append($.parseHTML(data)));
            let $body = $('<div></div>').append($.parseHTML(data)).find('.p-body-inner');
            
            //It's time for clean up!
            //Remove crap that's cluttering or just doesn't work.
            $body.find('.notices').remove();
            $body.find('.shareButtons').remove();
            $body.find('i.fal').remove();
            $body.find('li').has('a[data-xf-init="share-tooltip"').remove();
            $body.find('div.block-outer-opposite').remove();
            $body.find('img[src^="\/styles"]').remove();

            //Fix links
            $body.find('a').each((i, e) => {
                let $a = $(e);
                let href = $a.attr('href');
                //We only care about internal links
                if (href && (href.match(/^\/index\.php\??|^https:\/\/forums\.bulba/))) {
                    //console.log(href);
                    //Keep these ones
                    //TODO: Do some fancy routing to fix these too
                    if (href.match(/\?threads\/.+?\.(?<threadID>\d+)\/|post-(?<postID>\d+)$/)) {

                    } else {
                        $a.removeAttr('href');
                    }
                }
            })

            //Fix user avatars
            $body.find('img[class^="avatar"').each((i, e) => {
                $img = $(e);
                let userID = $img.parent().attr('data-user-id');
                $img.attr('src', getUserAvatarLocationByID(userID));
            });

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
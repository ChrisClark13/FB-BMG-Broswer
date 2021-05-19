const m = require("mithril")
const archive = require('./archiveResolver.js');
const $ = require("jquery");

let $pageBody = null;
let threadID = 0;
let pageNum = 1;
let postID = null;
let errorMessage = "";

let subforumID = 0;

const ThreadResolver = {
    onmatch: function(args, requestedPath) {
        return new Promise((resolve, reject) => {
            $pageBody = null;
            threadID = 0;
            pageNum = 1;
            postID = null;

            if (args.threadID) {
                threadID = args.threadID.match(/\d+$/)[0];
            } else if (args.postID) {
                postID = args.postID.match(/\d+$/)[0];
                [threadID, pageNum] = archive.getPostInfoByID(postID);
            } else {
                errorMessage = "Invalid URL";
            }
            
            if (args.pageNum) {
                if (args.pageNum.includes('post')) {
                    postID = args.pageNum.match(/\d+$/)[0]
                    pageNum = archive.getPostInfoByID(postID)[1];
                } else {
                    pageNum = args.pageNum.match(/\d+$/)[0];
                }
            }

            if (requestedPath.includes("#post")) {
                postID = requestedPath.match(/#post-(\d+)/)[1];
            }

            console.log(`Loading Path ${requestedPath}\nLoading thread/page: ${threadID}/${pageNum}` + (postID == null ? '' : ` Pointing at postID ${postID}`));

            archive.$getXHRThreadPageByID(threadID, pageNum)
                .then( $body => {
                    $pageBody = $body;
                    resolve();
                }).catch(err => {
                    errorMessage = err;
                    console.log(err);
                }
            )
        }).catch(err => {
            errorMessage = err;
            console.log(err);
        });
    },
    render: function() {
        let threadBody = ($pageBody != null) ? m.trust($pageBody.html()) : m('div', `Something went wrong, check the console...\nERROR\n${errorMessage}`);

        if ($pageBody != null) {
            document.title = `FB BMG Broswer - ${$pageBody.find(".p-title-value").text()} - Page ${pageNum}` + (postID == null ? "" : ` Post ${$pageBody.find(`header li a[href$="${postID}"]`).text().trim()}`);
        } else {
            document.title = 'FB BMG Broswer - ERROR'
        }

        return (postID == null) ? 
            m('div.archivedContent', threadBody) :
            m('div.archivedContent', {
                oncreate: () => document.getElementById(`post-${postID}`).scrollIntoView(true),
                onupdate: () => document.getElementById(`post-${postID}`).scrollIntoView(true) 
            }, threadBody);
    }
}

const ForumResolver = {
    onmatch: function(args, requestedPath) {
        return new Promise((resolve, reject) => {
            $pageBody = null;
            subforumID = 0;
            pageNum = 1;

            subforumID = args.subforumID.match(/\d+$/)[0];
            
            if (args.pageNum) {
                pageNum = args.pageNum.match(/\d+$/)[0];
            }

            console.log(`Loading Path ${requestedPath}\nLoading subforum/page: ${subforumID}/${pageNum}`);

            archive.$getXHRSubforumByID(subforumID, pageNum)
                .then( $body => {
                    $body.find('div.node--unread').removeClass('node--unread');
                    $body.find('span.node-icon').remove();
                    $pageBody = $body;
                    resolve();
                }).catch(err => {
                    errorMessage = err;
                    console.log(err);
                }
            )
        }).catch(err => {
            errorMessage = err;
            console.log(err);
        });
    },
    render: function() {
        let content = ($pageBody != null) ? m.trust($pageBody.html()) : m('div', `Something went wrong, check the console...\nERROR\n${errorMessage}`);

        if ($pageBody != null) {
            document.title = `FB BMG Broswer - ${$pageBody.find(".p-title-value").text()} - Page ${pageNum}`;
        } else {
            document.title = 'FB BMG Broswer - ERROR'
        }

        return m('div.archivedContent', content);
    }
}

m.route(document.getElementById("dynamicContent"), "/forums/fizzy-bubbles.252",
    {
        "/forums/:subforumID": ForumResolver,
        "/forums/:subforumID/:pageNum": ForumResolver,
        "/post/:postID": ThreadResolver,
        "/threads/:threadID": ThreadResolver,
        "/threads/:threadID/:pageNum": ThreadResolver
    }
);
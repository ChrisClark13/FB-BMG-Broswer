const m = require("mithril")
const archive = require('./archiveResolver.js');
const $ = require("jquery");

let $threadBody = null;
let postID = null;
let errorMessage = "";

const ThreadResolver = {
    onmatch: function(args, requestedPath) {
        return new Promise((resolve, reject) => {
            let threadID = 0;
            let pageNum = 1;

            $threadBody = null;
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
                    pageNum = args.pageNum ? args.pageNum.match(/\d+$/)[0] : 1;
                }
            }

            if (requestedPath.includes("#post")) {
                postID = requestedPath.match(/#post-(\d+)/)[1];
            }

            console.log(`Loading Path ${requestedPath}\nLoading thread/page: ${threadID}/${pageNum}` + (postID == null ? '' : ` Pointing at postID ${postID}`));

            archive.$getXHRThreadPageByID(threadID, pageNum)
                .then( $body => {
                    $threadBody = $body;
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
    render: function(vnode) {
        //console.log(vnode);
        let content = ($threadBody != null) ? m.trust($threadBody.html()) : m('div', `Something went wrong, check the console...\nERROR\n${errorMessage}`);
        return (postID == null) ? 
            m('div', content) :
            m('div', {
                oncreate: () => document.getElementById(`post-${postID}`).scrollIntoView(true),
                onupdate: () => document.getElementById(`post-${postID}`).scrollIntoView(true) 
            }, content);
    }
}

m.route(document.body, "/threads/281788/1",
    {
        "/post/:postID": ThreadResolver,
        "/threads/:threadID": ThreadResolver,
        "/threads/:threadID/:pageNum": ThreadResolver
    }
);
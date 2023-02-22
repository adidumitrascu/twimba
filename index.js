import { data } from './data.js'
import { v4 as uuidv4 } from 'https://jspm.dev/uuid';

let tweetsData = data

let tweetsDataFromLocalStorage = JSON.parse(localStorage.getItem("tweetsData"))

if (tweetsDataFromLocalStorage) {
    tweetsData = tweetsDataFromLocalStorage
    render()
}

document.addEventListener('click', function(e){
    if(e.target.dataset.like){
       handleLikeClick(e.target.dataset.like) 
    }
    else if(e.target.dataset.retweet){
        handleRetweetClick(e.target.dataset.retweet)
    }
    else if(e.target.dataset.reply){
        handleReplyClick(e.target.dataset.reply)
    }
    else if(e.target.id === 'tweet-btn'){
        handleTweetBtnClick()
    }
    else if(e.target.dataset.replyTweet) {
        handleReplyTweet(e.target.dataset.replyTweet)
    }
    else if(e.target.id === 'close-btn'){
        document.getElementById('reply').style.display = 'none'
    }
    else if(e.target.dataset.tweetReplyBtn) {
        handleTweetReplyBtn(e.target.dataset.tweetReplyBtn)
    }
    else if(e.target.dataset.deleteReply) {
        removeTweetReply(e.target.dataset.deleteReply)
    }
    
})

 
function handleLikeClick(tweetId){ 
    const targetTweetObj = tweetsData.filter(function(tweet){
        return tweet.uuid === tweetId
    })[0]

    if (targetTweetObj.isLiked){
        targetTweetObj.likes--
    }
    else{
        targetTweetObj.likes++ 
    }
    targetTweetObj.isLiked = !targetTweetObj.isLiked
    render()
}

function handleRetweetClick(tweetId){
    const targetTweetObj = tweetsData.filter(function(tweet){
        return tweet.uuid === tweetId
    })[0]
    
    if(targetTweetObj.isRetweeted){
        targetTweetObj.retweets--
    }
    else{
        targetTweetObj.retweets++
    }
    targetTweetObj.isRetweeted = !targetTweetObj.isRetweeted
    render() 
}

function handleReplyClick(replyId){
    document.getElementById(`replies-${replyId}`).classList.toggle('hidden')
}

function handleTweetBtnClick(){
    const tweetInput = document.getElementById('tweet-input')

    if(tweetInput.value){
        tweetsData.unshift({
            handle: `@Scrimba`,
            profilePic: `images/scrimbalogo.png`,
            likes: 0,
            retweets: 0,
            tweetText: tweetInput.value,
            replies: [],
            isLiked: false,
            isRetweeted: false,
            uuid: uuidv4()
        })
    render()
    tweetInput.value = ''
    }

}


function handleReplyTweet(tweetId){
    const targetTweetObj = tweetsData.filter(function(tweet){
        return tweet.uuid === tweetId
    })[0]
    const tweetText = targetTweetObj.tweetText
    const handle = targetTweetObj.handle 
    const uuid = targetTweetObj.uuid

    document.getElementById('reply').innerHTML = getReplyHtml(tweetText, handle, uuid)
    document.getElementById('reply').style.display = 'block'

}

function handleTweetReplyBtn(tweetId) {
    const tweetReply = document.getElementById('reply-input-area')

    if (tweetReply.value) {
        const targetTweetObj = tweetsData.filter(function(tweet){
        return tweet.uuid === tweetId
        })[0]

        targetTweetObj.replies.unshift({
            handle: `@Scrimba`,
            profilePic: `images/scrimbalogo.png`,
            tweetText: tweetReply.value,
            uuid: uuidv4()
        })

        document.getElementById('reply').style.display = 'none' 
    }
    render()
}


function removeTweetReply(replyId) {
    const removeById = (tweetsData, replyId) => tweetsData.reduce((acc, obj) => 
        (obj.uuid === replyId) 
            ? acc 
            : [ ...acc, 
                {
                ...obj, 
                ...(obj.replies && { replies: removeById(obj.replies, replyId) }) 
                }
            ]
        , []);

        
        tweetsData = removeById(tweetsData, replyId)
        render()

}


function getFeedHtml(){
    let feedHtml = ``
    
    tweetsData.forEach(function(tweet){
        
        let likeIconClass = ''
        
        if (tweet.isLiked){
            likeIconClass = 'liked'
        }
        
        let retweetIconClass = ''
        
        if (tweet.isRetweeted){
            retweetIconClass = 'retweeted'
        }
        
        let repliesHtml = ''
        
        if(tweet.replies.length > 0){
            tweet.replies.forEach(function(reply){
                repliesHtml+=`
<div class="tweet-reply">
    <div class="tweet-inner">
        <img src="${reply.profilePic}" class="profile-pic">
        <div>
            <p class="handle">${reply.handle}</p>
            <p class="tweet-text">${reply.tweetText}</p>
            <button class="delete-btn" 
            data-delete-reply="${reply.uuid}">&times</button>
        </div>
    </div>
</div>
`
            })
        }
        
          
        feedHtml += `
<div class="tweet">
    <div class="tweet-inner">
        <img src="${tweet.profilePic}" class="profile-pic">
        <div>
            <p class="handle">${tweet.handle}</p>
            <p class="tweet-text">${tweet.tweetText}</p>
            <div class="tweet-details">
                <span class="tweet-detail">
                    <i class="fa-regular fa-comment-dots"
                    data-reply="${tweet.uuid}"
                    ></i>
                    ${tweet.replies.length}
                </span>
                <span class="tweet-detail">
                    <i class="fa-solid fa-heart ${likeIconClass}"
                    data-like="${tweet.uuid}"
                    ></i>
                    ${tweet.likes}
                </span>
                <span class="tweet-detail">
                    <i class="fa-solid fa-retweet ${retweetIconClass}"
                    data-retweet="${tweet.uuid}"
                    ></i>
                    ${tweet.retweets}
                </span>
                <span class="tweet-detail">
                    <i class="fa-solid fa-reply"></i>
                    <a class="reply-btn" data-reply-tweet="${tweet.uuid}"
                    >Reply</a>
                </span>
            </div>   
        </div>            
    </div>
    <div class="hidden" id="replies-${tweet.uuid}">
        ${repliesHtml}
    </div>   
</div>
`
   })
   return feedHtml
}

function getReplyHtml(text, handle, uuid) {
    let replyHtml = `` 

    replyHtml = `
<h3>${handle}</h3>
<button id="close-btn">&times</button>
<div id="reply-area" class="reply-area">
    <textarea 
    placeholder="Tweet your reply" 
    id="reply-input-area"></textarea>
    <div id="tweet-reply">
        <button id="tweet-reply-btn" 
        data-tweet-reply-btn="${uuid}">Tweet</button>
        <div>
            <i class="fa-solid fa-camera reply-icon"></i>
            <i class="fa-solid fa-list reply-icon"></i>
            <i class="fa-solid fa-location-dot reply-icon"></i>
        </div>
    </div>
    <div class="reply-msg">
        <p><span class="reply-handle">
        ${handle}</span>\u00A0\u00A0${text}</p>
    </div>
</div>
`

    return replyHtml
}

function render(){
    document.getElementById('feed').innerHTML = getFeedHtml()
    localStorage.setItem("tweetsData", JSON.stringify(tweetsData))
}

render()






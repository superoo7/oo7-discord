import * as Discord from 'discord.js';
import * as logger from 'winston';
import * as dotenv from 'dotenv';
import * as steem from 'steem';
import * as http from 'http';
import { main, upvote } from 'steem-upvote-util';
import convert from 'convert-seconds';

import 'babel-polyfill';

dotenv.config();

// Database
import db from './db';
db();

// Controller
import {
    checkRegisteredUser,
    checkLastPost,
    updateTime
} from './controller/user';

import {
    getDateTimeFromTimestamp,
    timeConvertMessage
} from './util';

// json
import config from './config.json';

const postConfig = {
    maximumPostAge: 302400000, // 3.5 days
    minimumPostAge: 1800000, // 30 minutes
    minimumLength: 120, // 120 words
    optimumLength: 4000, // 4000 words
    unwantedTags: [
        'steepshot',
        'dmania',
        'decentmeme',
        'nsfw'
    ],
    requiredTags: ['teammalaysia']
};

let timeDiff;

// start client
const client = new Discord.Client();

client.on('ready', () => {
    logger.info(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
    if (msg.channel.id !== config.channelId) {
        return;
    } else {
        // If the bot is at maintenance

        // GET INFO FOR MESSAGE
        let {
            id: currentMessageId,
            author: {
                username: currentUsername,
                id: currentUserId
            },
            content: currentContent,
            createdTimestamp: currentCreatedTimestamp
        } = msg;

        if (currentUserId === config.botId) {
            logger.info('BOT MESSAGE:', currentContent);
        } else if (
            !!require('/root/moderator.json').maintenance
        ) {
            msg.delete();
            msg.reply('The bot is under maintenance');
            return;
        } else {
            let currentCreatedTime = getDateTimeFromTimestamp(
                currentCreatedTimestamp
            );

            logger.info(
                `${currentUsername} (${currentUserId}) created "${currentContent}" on ${currentCreatedTime} (msg_id: ${currentMessageId})`
            );
            logger.info(currentContent);

            let result = new Promise((resolve, reject) => {
                // Check Registered User
                checkRegisteredUser(currentUserId).then(
                    isRegistered => {
                        console.log(isRegistered);
                        if (isRegistered) {
                            resolve('');
                        } else {
                            reject('NOT_REGISTERED');
                        }
                    }
                );
            })
                .then(() => {
                    // Check Post Validity with Regex (/(http|https):\/\/(www\.steemit\.com\/|steemit\.com\/|busy\.org\/|www\.busy\.org\/)/g)
                    let isPostValid = !!currentContent.match(
                        /(http|https):\/\/(www\.steemit\.com\/|steemit\.com\/)/g
                    );
                    if (isPostValid) {
                        return;
                    } else {
                        throw 'NOT_VALID_LINK';
                    }
                })
                .then(() => {
                    console.log(
                        currentContent.match(
                            /[\u00ff-\uffff]|\S+/g
                        ).length
                    );
                    if (
                        currentContent.match(
                            /[\u00ff-\uffff]|\S+/g
                        ).length < 10
                    ) {
                        throw 'NO_SYPNOPSIS';
                    }
                    return;
                })
                .then(() => {
                    // Check Last Post Time
                    return checkLastPost(currentUserId)
                        .then(data => {
                            if (!!data) {
                                timeDiff = Math.floor(
                                    (currentCreatedTimestamp -
                                        data) /
                                        1000
                                );
                                console.log(timeDiff);
                                // CHECK TIME
                                if (
                                    timeDiff >
                                    config.timeAllowed
                                ) {
                                    // Proceed
                                } else {
                                    throw 'NOT_YET_TIME';
                                    return;
                                }
                            } else {
                                // First Time
                                msg.reply(
                                    `seems like it is the first time you post here.`
                                );
                            }

                            // Quality Check
                            // ============================================================
                            // Parse link (asd https://steemit.com/ asd => https://steemit.com)
                            let link = currentContent.match(
                                /(https?:\/\/[^\s]+)/g
                            );

                            if (link.length === 1) {
                                let authorName = link[0].split(
                                    /[\/#]/
                                )[4];
                                let permlinkName = link[0].split(
                                    /[\/#]/
                                )[5];
                                // ============================================================
                                // parse out author and permlink and check wether is correct
                                if (
                                    authorName.charAt(0) ===
                                        '@' &&
                                    !!permlinkName
                                ) {
                                    return main(
                                        authorName.substr(
                                            1
                                        ),
                                        permlinkName,
                                        postConfig
                                    )
                                        .then(postData => {
                                            console.log(
                                                '--------------------'
                                            );
                                            console.log(
                                                postData
                                            );
                                            if (
                                                postData.msg ===
                                                    'CHEETAH' ||
                                                postData.msg ===
                                                    'OLD_POST' ||
                                                postData.msg ==
                                                    'POST_NOT_FOUND' ||
                                                postData.msg ==
                                                    'UNWANTED_TAGS' ||
                                                postData.msg ==
                                                    'REQUIRED_TAGS'
                                            ) {
                                                throw postData.msg;
                                            } else if (
                                                postData.weightage ===
                                                1000
                                            ) {
                                                throw 'NOT_ENOUGH_LENGTH';
                                            }
                                            return postData;
                                        })
                                        .catch(err => {
                                            throw err;
                                        });
                                } else {
                                    return 'NOT_VALID_LINK';
                                }
                            } else {
                                return 'NOT_VALID_LINK';
                            }
                        })
                        .then(postData => {
                            return upvote(
                                process.env.STEEM_POSTING,
                                process.env.STEEM_USERNAME,
                                postData.author,
                                postData.permlink,
                                postData.weightage
                            )
                                .then(upvoteData => {
                                    if (
                                        upvoteData ===
                                        'ERROR'
                                    ) {
                                        throw 'NO_UPVOTE';
                                    } else {
                                        console.log(
                                            postData.msg
                                        );
                                        msg.reply(
                                            `post created ${
                                                postData.time
                                            }, you may have a 🍪 coming to you soon!`
                                        );
                                        return;
                                    }
                                })
                                .then(() => {
                                    console.log(
                                        `--------------------------------------------------------------------------------`
                                    );
                                    console.log(postData);
                                    testingPost(
                                        postData.author,
                                        postData.permlink
                                    );
                                })
                                .catch(err => {
                                    throw err;
                                });
                        })
                        .then(() => {
                            // UPDATE TIME QUERY
                            return updateTime(
                                currentUserId,
                                currentCreatedTimestamp
                            );
                        })
                        .catch(err => {
                            throw err;
                        });
                })
                .catch(err => {
                    console.log(err);
                    msg.delete();
                    switch (err) {
                        case 'NOT_REGISTERED':
                            msg.reply(
                                'You are not yet registered'
                            );
                            break;
                        case 'NOT_VALID_LINK':
                            msg.reply(
                                'You did not include link to steemit.com'
                            );
                            break;
                        case 'NOT_YET_TIME':
                            msg.reply(
                                `Please wait for ${timeConvertMessage(
                                    convert(
                                        config.timeAllowed -
                                            timeDiff
                                    )
                                )}`
                            );
                            break;
                        case 'CHEETAH':
                            msg.reply(
                                'Your post is voted by @cheetah'
                            );
                            break;
                        case 'OLD_POST':
                            msg.reply(
                                'Your post is too new / old to be shared (Please only share post that are > 30 minutes old and < 3.5 days old)'
                            );
                            break;
                        case 'POST_NOT_FOUND':
                            msg.reply('Post not found');
                            break;
                        case 'NO_UPVOTE':
                            msg.reply(
                                "Can't upvote, it could be upvoted already"
                            );
                            break;
                        case 'NOT_ENOUGH_LENGTH':
                            msg.reply(
                                `Post is too short for us to reward you a 🍪 . Trying writing more."`
                            );
                            break;
                        case 'NO_SYPNOPSIS':
                            msg.reply(
                                `Please first write short description before posting URL. (10-50 words). 简解就好，不需长篇大论。`
                            );
                            break;
                        case 'REQUIRED_TAGS':
                            let t1 = postConfig.requiredTags.join(
                                ', '
                            );
                            msg.reply(
                                `To use this bot, you required to use the following tags: ${t1}`
                            );
                            break;
                        case 'UNWANTED_TAGS':
                            let t2 = postConfig.unwantedTags.join(
                                ', '
                            );
                            msg.reply(
                                `This bot does not support following tags: ${t2}`
                            );
                            break;
                        default:
                            msg.reply('ERROR');
                            break;
                    }
                });
        }
    }
});
client.login(process.env.DISCORD_TOKEN); // Start server
http
    .createServer(function(request, response) {
        response.writeHead(200, {
            'Content-Type': 'text/html'
        });
        response.end('superoo7 bot still alive', 'utf-8');
    })
    .listen(process.env.PORT || 5000);
function testingPost(author, permlink) {
    let randomMsg = Math.floor(
        Math.random() * config.msgList.length
    );
    console.log(randomMsg);
    let postMessage = config.msgList[randomMsg];
    console.log(postMessage);
    steem.broadcast.comment(
        process.env.TEAMMALAYSIA_POSTING, // posting wif
        author, // author, leave blank for new post
        permlink, // first tag or permlink
        process.env.TEAMMALAYSIA, // username
        permlink, // permlink
        '', // Title,
        postMessage,
        {
            tags: ['teammalaysiadevtest', 'teammalaysia'],
            app: 'stephard/0.1'
        }, // json metadata (additional tags, app name, etc)
        function(err, result) {
            console.log(err, result);
        }
    );
}

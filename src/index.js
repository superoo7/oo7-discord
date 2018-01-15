import * as Discord from 'discord.js';
import * as logger from 'winston';
import * as dotenv from 'dotenv';
// import * as steem from 'steem';
import * as http from 'http';
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

import { getDateTimeFromTimestamp, timeConvertMessage } from './util';

import config from './config.json';

let timeDiff;

// start client
const client = new Discord.Client();

client.on('ready', () => {
    logger.info(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
    // GET INFO FOR MESSAGE
    let {
        id: currentMessageId,
        author: { username: currentUsername, id: currentUserId },
        content: currentContent,
        createdTimestamp: currentCreatedTimestamp
    } = msg;

    if (currentUserId === config.botId) {
        logger.info('BOT MESSAGE:', currentContent);
    } else if (config.whitelistId.indexOf(currentUserId) !== -1) {
        logger.info('ADMIN MESSAGE', currentContent);
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
            checkRegisteredUser(currentUserId).then(isRegistered => {
                console.log(isRegistered);
                if (isRegistered) {
                    resolve('');
                } else {
                    reject('NOT_REGISTERED');
                }
            });
        })
            .then(() => {
                // Check Post Validity with Regex (/(http|https):\/\/(www\.steemit\.com\/|steemit\.com\/|busy\.org\/|www\.busy\.org\/)/g)
                let isPostValid = !!currentContent.match(
                    /(http|https):\/\/(www\.steemit\.com\/|steemit\.com\/|busy\.org\/|www\.busy\.org\/)/g
                );
                if (isPostValid) {
                    return;
                } else {
                    throw 'NOT_VALID_LINK';
                }
            })
            .then(() => {
                // Check Last Post Time
                return checkLastPost(currentUserId)
                    .then(data => {
                        if (!!data) {
                            timeDiff = Math.floor(
                                (currentCreatedTimestamp - data) / 1000
                            );
                            console.log(timeDiff);
                            // CHECK TIME
                            if (timeDiff > config.timeAllowed) {
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
            .then(() => {
                msg.reply('POST APPROVED 👍');
            })
            .catch(err => {
                console.log(err);
                msg.delete();
                switch (err) {
                    case 'NOT_REGISTERED':
                        msg.reply('You are not yet registered');
                        break;
                    case 'NOT_VALID_LINK':
                        msg.reply(
                            'You did not include link to steemit.com or busy.org'
                        );
                        break;
                    case 'NOT_YET_TIME':
                        msg.reply(
                            `Please wait for ${timeConvertMessage(
                                convert(config.timeAllowed - timeDiff)
                            )}`
                        );
                        break;
                    default:
                        msg.reply('ERROR');
                        break;
                }
            });

        // msg.channel
        // .fetchMessages() //{ limit: 10000 }
        // .then(messages => {
        //     console.log(`Received ${messages.size} messages`);
        //     try {
        //         let {
        //             author: { username: lastUsername, id: lastUserId },
        //             content: lastContent,
        //             createdTimestamp: lastCreatedTimestamp,
        //             id: lastMessageId
        //         } = messages.find(m => {
        //             let {
        //                 author: { id: lastUserId },
        //                 id: lastMessageId
        //             } = m;

        //             if (lastMessageId === currentMessageId) {
        //                 return false;
        //             }
        //             return currentUserId === lastUserId;
        //         });
        //         let lastCreatedTime = getDateTimeFromTimestamp(
        //             lastCreatedTimestamp
        //         );
        //         let timeDiff = Math.floor(
        //             (Date.now() - lastCreatedTimestamp) / 1000
        //         );

        //         if (
        //             !!currentContent.match(
        //                 /(http|https):\/\/(www\.steemit\.com\/|steemit\.com\/|busy\.org\/|www\.busy\.org\/)/g
        //             )
        //         ) {
        //             if (timeDiff > config.timeAllowed) {
        //                 msg.reply(`POST APPROVED 👍`);
        //             } else {
        //                 msg
        //                     .delete()
        //                     .then(msg => {
        //                         msg.reply(
        //                             `\nDeleted message from ${
        //                                 msg.author
        //                             }\nbecause you have posted just posted **${timeConvertMessage(
        //                                 convert(timeDiff)
        //                             )} ago**, \nPlease wait for **${timeConvertMessage(
        //                                 convert(
        //                                     config.timeAllowed - timeDiff
        //                                 )
        //                             )}** for the new post\nYou can only post a link in ${
        //                                 convert(config.timeAllowed).hours
        //                             } hours \nPS: Your post is deleted and please don't do it again 😠`
        //                         );
        //                     })
        //                     .catch(console.error);
        //             }
        //         } else {
        //             msg.delete();
        //             msg.reply(
        //                 `Your post does not contain steemit.com link or busy.org link`
        //             );
        //         }
        //     } catch (e) {
        //         msg.reply(
        //             `\nWelcome @${currentUsername}, seems like this is the first time you posted here. Remember you can only post a link in ${
        //                 convert(config.timeAllowed).hours
        //             } hours`
        //         );
        //         return;
        //     }
        // })
        // .catch(console.error);
    }
});
client.login(process.env.DISCORD_TOKEN); // Start server
http
    .createServer(function(request, response) {
        response.writeHead(200, { 'Content-Type': 'text/html' });
        response.end('superoo7 bot still alive', 'utf-8');
    })
    .listen(process.env.PORT || 5000);

import * as Discord from 'discord.js';
import * as logger from 'winston';
import * as dotenv from 'dotenv';
// import * as steem from 'steem';
import * as http from 'http';

import 'babel-polyfill';

dotenv.config();

import { getDateTimeFromTimestamp } from './util';

import config from './config.json';

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
        // } else if (
        //     currentContent.toLowerCase() === 'what is the meaning of life?' ||
        //     currentContent.toLowerCase() === 'what is meaning of life?'
        // ) {
        //     msg.reply('42');
    } else {
        let currentCreatedTime = getDateTimeFromTimestamp(
            currentCreatedTimestamp
        );

        logger.info(
            `${currentUsername} (${currentUserId}) created "${currentContent}" on ${currentCreatedTime} (msg_id: ${currentMessageId})`
        );
        logger.info(currentContent);

        msg.channel
            .fetchMessages({ limit: 100 })
            .then(messages => {
                console.log(`Received ${messages.size} messages`);
                let {
                    author: { username: lastUsername, id: lastUserId },
                    content: lastContent,
                    createdTimestamp: lastCreatedTimestamp,
                    id: lastMessageId
                } = messages.find(m => {
                    let { author: { id: lastUserId }, id: lastMessageId } = m;
                    if (lastMessageId === currentMessageId) {
                        return false;
                    }
                    return currentUserId === lastUserId;
                });
                let lastCreatedTime = getDateTimeFromTimestamp(
                    lastCreatedTimestamp
                );
                let timeDiff = Math.floor(
                    (Date.now() - lastCreatedTimestamp) / 1000
                );
                if (timeDiff > config.timeAllowed) {
                    msg.reply(
                        `POST APPROVED\n${lastUsername} on ${lastCreatedTime} says that\n "${lastContent}" ${timeDiff} seconds ago`
                    );
                } else {
                    msg
                        .delete()
                        .then(msg => {
                            msg.reply(`Deleted message from ${msg.author}`);
                            msg.reply(
                                `YOU POSTED TOO FREQUENT. YOUR LAST POST IS JUST ${timeDiff} seconds ago, \nPlease wait for ${config.timeAllowed -
                                    timeDiff} seconds\nYou can only post a link in ${
                                    config.timeAllowed
                                } seconds \nPS: Your post is deleted`
                            );
                        })
                        .catch(console.error);
                }
            })
            .catch(console.error);
    }
});
client.login(process.env.DISCORD_TOKEN);
//
http
    .createServer(function(request, response) {
        response.writeHead(200, { 'Content-Type': contentType });
        response.end(content, 'utf-8');
    })
    .listen(process.env.PORT || 5000);

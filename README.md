# oo7-discord bot

The bot in production is called Stephard. [Blogpost about Stephard](https://steemit.com/utopian-io/@superoo7/stephard-discord-bot-that-prevents-abusing-of-post-promo)

# What is this?
A bot that deletes post-promotion links shared in #teammalaysia discord group when it being abused.

## How it works?
All message on discord will send through the bot. The bot act as a middleware after a user send a message. This bot will check the author's last message datetime, and then from there, calculate wether the user have posted any link in the past x hours. (x means you can set it in `src/config.json`)


# Developer Part

* Change `.env.sample` to `.env`
* Add your own [Discord Token](https://github.com/reactiflux/discord-irc/wiki/Creating-a-discord-bot-&-getting-a-token)

# Feel free to file issue and PR

# License

MIT

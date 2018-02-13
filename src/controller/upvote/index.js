import dotenv from 'dotenv';
import steem from 'steem';
import 'babel-polyfill';

import {
  imageParser,
  linkParser,
  divParser,
  breakLineParser
} from './regex';

dotenv.config();

// ABOUT THE POST

function aboutPost(author, permlink, weightage) {
  return new Promise(function(resolve, reject) {
    steem.api.getContent(author, permlink, function(
      err,
      result
    ) {
      if (err) {
        console.log('ERROR');
        reject('ERROR');
      }

      const isCheetah = !(
        result.active_votes.filter(data => {
          if (data.voter === 'cheetah') {
            return true;
          }
          return false;
        }).length === 0
      );

      const bodyParse1 = imageParser(result.body);
      const bodyParse2 = linkParser(bodyParse1);
      const articleLength = bodyParse2.length;

      resolve({
        author: result.author,
        created: result.created,
        isCheetah,
        articleLength
      });
    });
  });
}

// UPVOTE

function upvote(author, permlink, weightage) {
  steem.broadcast.vote(
    process.env.STEEM_POSTING,
    process.env.STEEM_USERNAME,
    author,
    permlink,
    weightage,
    function(err, result) {
      if (err) {
        console.log('ERROR');
        reject('ERROR');
      }
    }
  );
}

export { aboutPost, upvote };

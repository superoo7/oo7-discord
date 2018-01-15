import mongoose from 'mongoose';
import User from '../model/user';

let checkRegisteredUser = discordId => {
  return User.findOne({ discordid: discordId }, (err, user) => {
    if (err || !!user) {
      return false;
    }

    return true;
  })
    .then(data => (!!data ? true : false))
    .catch(err => false);
};

let checkLastPost = discordId => {
  return User.findOne({ discordid: discordId }, (err, user) => {
    if (err || !user) {
      console.log('error');
    }
    return;
  })
    .then(data => {
      if (!!data) {
        return data.lastpostdatetime;
      } else {
        throw 'ERROR';
        return;
      }
    })
    .catch(err => {
      console.log(err);
      return false;
    });
};

const updateTime = (discordId, time) => {
  return User.findOne({ discordid: discordId }, (err, user) => {
    if (err) {
      console.log(err);
      return;
    }
    console.log('success');
    user.lastpostdatetime = time;
    let result = user
      .save(err => {
        if (err) {
          console.log(err);
          return;
        }
        console.log('success');
        return;
      })
      .then(data => {
        return;
      })
      .catch(err => {
        return;
      });
    return result;
  }).catch(err => 'Error');
};

export { checkRegisteredUser, checkLastPost, updateTime };

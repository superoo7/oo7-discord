import mongoose from 'mongoose';
import User from '../model/user';

let checkRegisteredUser = discordId => {
  return User.findOne(
    { discordid: discordId },
    (err, user) => {
      if (err || !!user) {
        return false;
      }

      return true;
    }
  )
    .then(data => (!!data ? data.roles : false))
    .catch(err => false);
};

let checkLastPost = discordId => {
  return User.findOne(
    { discordid: discordId },
    (err, user) => {
      if (err || !user) {
        console.log('error');
      }
      return;
    }
  )
    .then(data => {
      if (!!data) {
        return data.lastpostdatetime[0];
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

const updateUserTime = (discordId, time) => {
  return User.findOne(
    { discordid: discordId },
    (err, user) => {
      if (err) {
        console.log(err);
        return;
      }
      console.log('success');

      user.lastpostdatetime = [time];
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
    }
  ).catch(err => 'Error');
};

const updateSponsorTime = (discordId, time) => {
  return User.findOne(
    { discordid: discordId },
    (err, user) => {
      if (err) {
        console.log(err);
        return;
      }
      console.log('success');

      if (user.lastpostdatetime.length === 0) {
        user.lastpostdatetime = [0, time];
      } else if (user.lastpostdatetime.length === 1) {
        user.lastpostdatetime = [
          user.lastpostdatetime[0],
          time
        ];
      } else {
        user.lastpostdatetime = [
          user.lastpostdatetime[1],
          time
        ];
      }

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
    }
  ).catch(err => 'Error');
};

export {
  checkRegisteredUser,
  checkLastPost,
  updateUserTime,
  updateSponsorTime
};

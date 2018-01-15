import mongoose from 'mongoose';
import User from '../model/user';

let checkRegisteredUser = discordId => {
  return User.findOne({ discordid: discordId }, (err, user) => {
    if (err) {
      return false;
    }
    if (!user) {
      return false;
    }

    return true;
  }).then(data => (!!data ? true : false));
};

export { checkRegisteredUser };

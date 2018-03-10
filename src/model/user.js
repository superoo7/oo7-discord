import mongoose from 'mongoose';

let Schema = mongoose.Schema;

let userSchema = new Schema({
  name: { type: String, required: true },
  discordid: { type: String, required: true, unique: true },
  steemname: { type: String, required: true },
  lastpostdatetime: [Number],
  roles: { type: String }
  // timestamp: true
});

module.exports = mongoose.model('User', userSchema);

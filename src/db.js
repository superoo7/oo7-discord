import mongoose from 'mongoose';
import config from './config.json';

export default () => {
  mongoose.Promise = global.Promise;
  let db = mongoose.connect(config.mongoUrl, { useMongoClient: true });
  return db;
};

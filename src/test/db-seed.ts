import mongoose = require('mongoose');
import Promise = require('bluebird');

import User from '../models/user';
import Event from '../models/event';
import Comment from '../models/comment';

let config: any;

if (process.env.NODE_ENV === 'test') {
  config = require('../test-config.json');
}

mongoose.Promise = Promise;
mongoose.connect(config.db);

Promise.all([User.remove({}), Event.remove({}), Comment.remove({})]).then((res) => {
  mongoose.disconnect();
});

import * as mongoose from 'mongoose';
import bcrypt = require('bcryptjs');
import Promise = require('bluebird');
import dietRestrictionsList from '../diet-restriction';

const UserSchema = new mongoose.Schema({
  username: { type: String, index: { unique: true } },
  password: { type: String, minlength: 5, select: false },
  dietRestrictions: [{ type: String, enum: dietRestrictionsList }]
});

UserSchema.pre('save', function(next) {
  if (!this.isModified('password')) { return next(); }

  bcrypt.hash(this.password, 10, (err, hash) => {
    if (err) { return next(err); }
    this.password = hash;
    next();
  });
});

UserSchema.methods.comparePassword = function(password) {
  return new Promise((resolve, reject) => {
    bcrypt.compare(password, this.password, function(err, res) {
      if (err) { return reject(err); }
      return resolve(res);
    });
  });
};

UserSchema.post('save', (err, doc, next) => {
  if (err.name === 'ValidationError') {
    next(new Error(err.message));
  } else if (err.name === 'MongoError' && err.code === 11000) {
    next(new Error('This user already exists!'));
  } else {
    next(err);
  }
});

export default mongoose.model('User', UserSchema);
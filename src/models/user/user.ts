import * as mongoose from 'mongoose';
import bcrypt = require('bcryptjs');
import Promise = require('bluebird');
import dietPreferencesList from '../diet-preference';

const UserSchema = new mongoose.Schema({
  username: { type: String, index: { unique: true } },
  password: { type: String, minlength: 5, select: false },
  dietPreferences: [{ type: String, enum: dietPreferencesList }]
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
  var dietaryError = dietaryErrorExists(err);

  if (err.name === 'ValidationError' && !dietaryError) {
    next(new Error('User validation failed'));
  } else if (err.name === 'MongoError' && err.code === 11000) {
    next(new Error('This user already exists!'));
  } else if (dietaryError) {
    next(new Error('Diet preferences are invalid!'));
  } else {
    next(err);
  }
});

function dietaryErrorExists(err) {
  for (var prop in err.errors) {
    if (prop.indexOf('dietPreferences') >= 0) {
      return true;
    }
    return false;
  }
}

export default mongoose.model('User', UserSchema);

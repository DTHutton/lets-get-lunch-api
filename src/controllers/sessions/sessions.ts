import User from '../../models/user';
import jwt = require('jsonwebtoken');

let config: any;

if (process.env.NODE_ENV === 'test') {
  config = require('../../test-config.json');
} else if (process.env.NODE_ENV === 'development') {
  config = require('../../dev-config.json');
}

let SECRET = process.env.SESSION_SECRET || config.secret;

// TODO - Update 404 error to be message
function create(req, res) {
  User.findOne({ username: req.body.username }).select('username password')
    .then(function(user) {
      if (!user) { return res.status(404).json({ message: 'User could not be found.' }); }
      user.comparePassword(req.body.password)
        .then(function(result) {
          let isValidPassword = result;
          if (!isValidPassword) { return res.status(401).json({ message: 'Incorrect password.' }); }
          jwt.sign({ username: req.body.username, _id: user._id }, SECRET, { expiresIn: '2h' }, function(err, token) {
            if (err) { return res.status(500).json({ message: 'Could not create token.' }); }
            return res.status(200).json({ token: token });
          });
        })
        .catch(function(result) {
          return res.status(500).json({ message: 'Something went wrong. Please try again.' });
        });
    });
}

export default { create };

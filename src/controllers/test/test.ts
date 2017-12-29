import Comment from '../../models/comment';
import Event from '../../models/event';
import User from '../../models/user';
import Promise = require('bluebird');

function destroy(req, res) {
  Promise.all([User.remove({}), Event.remove({}), Comment.remove({})])
    .then((resp) => {
      res.status(200).json(resp);
    })
    .catch((err) => {
      res.status(500).json(err);
    });
}

export default { destroy };

import Comment from '../../models/comment';
import * as moment from 'moment';

function create(req, res) {
  const comment = new Comment({
    content: req.body.content,
    createdAt: moment.now(),
    _event: req.body._event,
    _creator: req.body._creator,
  });

  comment.save()
    .then((comment) => {
      res.status(200).json(comment);
    })
    .catch((err) => {
      res.status(500).json({ message: 'Comment could not be created!' });
    });
}

function get(req, res) {
  Comment
    .find({})
    .where('_event').equals(req.params.id)
    .populate('_creator')
    .exec()
    .then((comments) => {
      if (!comments.length) {
        res.status(204).json({ resource: 'comments', message: 'No comments exist for this event.' });
      } else {
        res.status(200).json(comments);
      }
    })
    .catch((err) => {
      res.status(500).json({ message: 'Something went wrong!' });
    });
}

export default { create, get };

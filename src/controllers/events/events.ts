import Event from '../../models/event';
import * as moment from 'moment';

function create(req, res) {
  const start = moment(req.body.startTime, moment.ISO_8601);
  const end = moment(req.body.endTime, moment.ISO_8601);

  const event = new Event({
    _creator: req.body._creator,
    title: req.body.title,
    description: req.body.description,
    city: req.body.city,
    state: req.body.state,
    startTime: start,
    endTime: end,
    suggestLocations: req.body.suggestLocations,
    members: [req.body._creator]
  });

  event.save()
    .then((event) => {
      res.status(200).json(event);
    })
    .catch((err) => {
      res.status(500).json({ message: 'Event could not be created!' });
    });
}

function get(req, res) {
  Event.findOne({ _id: req.params.id })
    .exec()
    .then((event) => {
      res.status(200).json(event);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        res.status(404).json({ message: 'This event does not exist!' });
      } else {
        res.status(404).json(err);
      }
    });
}

function subscribe(req, res) {
  Event.findOne({ _id: req.body.event })
    .exec()
    .then((event) => {
      if (event.members.indexOf(req.body.user) === -1) {
        event.members.push(req.body.user);
        event.save()
          .then((updatedEvent) => {
            res.status(200).json(updatedEvent);
          });
      } else {
        res.status(400).json({ message: 'You are already a member of this event.' });
      }
    })
    .catch((err) => {
      res.status(404).json({ message: 'This event does not exist!' });
    })
}

export default { get, create, subscribe };

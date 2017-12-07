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
    .populate('members')
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

function update(req, res) {
  Event.findOne({ _id: req.params.id })
    .exec()
    .then((event) => {
      event.title = req.body.title;
      event.description = req.body.description;
      event.city = req.body.city;
      event.state = req.body.state;
      event.startTime = req.body.startTime;
      event.endTime = req.body.endTime;
      event.save()
        .then((updatedEvent) => {
          res.status(200).json(updatedEvent);
        })
        .catch((err) => {
          res.status(500).json({ message: 'Event could not be updated!' });
        });
    })
    .catch((err) => {
      res.status(500).json({ message: 'Event does not exist!' });
    });
}

function getEventsForUser(req, res) {
  Event.find({ members: req.params.id })
    .exec()
    .then((events) => {
      if (!events.length) {
        res.status(404).json({ resource: 'events', message: 'This user is not a member of any events.' });
      } else {
        res.status(200).json(events);
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        res.status(404).json({ message: 'This user does not exist!' });
      } else {
        res.status(500).json({ message: 'Something went wrong!' });
      }
    });
}

export default { get, create, subscribe, update, getEventsForUser };

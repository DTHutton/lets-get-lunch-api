import Event from '../../models/event';
import User from '../../models/user';
import server from '../../index';
import Utils from '../utils';

describe('Event', () => {
  let eventCreator;
  let subscribingUser;
  let eventlessUser;
  let eventId;

  before(() => {
    return Promise.all([
      Event.remove({}),
      User.remove({})
    ]);
  });

  before(() => {
    return Utils.getUserAndToken().spread((user, session) => {
      eventCreator = user;
    });
  });

  before(() => {
    return Utils.createUserAndToken({ username: 'subscriber', password: 'foobar' }).spread((user) => {
      subscribingUser = user;
    });
  });

  before(() => {
    return Utils.createUserAndToken({ username: 'noevents', password: 'foobar' }).spread((user) => {
      eventlessUser = user;
    });
  });

  describe('POST Event', () => {
    it('should return an Event object with a valid payload', () => {
      let event = new Event({
        _creator: eventCreator._id,
        title: 'Test Title',
        city: 'Atlanta',
        state: 'GA',
        startTime: '2017-04-01T19:00:00.000Z',
        endTime: '2017-04-01T20:00:00.000Z'
      });

      return chai.request(server)
        .post('/api/events')
        .send(event)
        .then((res) => {
          res.should.have.status(200);
          res.body._creator.should.equal(eventCreator._id);
          res.body.members.should.contain(eventCreator._id);
          eventId = res.body._id;
        });
    });

    it('should return a 500 with an invalid payload', () => {
      let event = new Event({});

      return chai.request(server)
        .post('/api/events')
        .send(event)
        .catch((err) => {
          err.should.have.status(500);
          err.response.body.message.should.equal('Event could not be created!');
        });
    });
  });

  describe('GET Event', () => {
    it('should return an event object with a valid id', () => {
      return chai.request(server)
        .get('/api/events/' + eventId)
        .then((res) => {
          res.should.have.status(200);
          res.body._id.should.equal(eventId);
        });
    });

    it('should return a 404 if an event cannot be found', () => {
      return chai.request(server)
        .get('/api/events/' + 12345)
        .catch((err) => {
          err.should.have.status(404);
          err.response.body.message.should.equal('This event does not exist!');
        });
    })
  });

  describe('PATCH Event', () => {
    it('should return a 404 if an event cannot be found', () => {
      let payload = { event: 12345 };

      return chai.request(server)
        .patch('/api/events')
        .send(payload)
        .catch((err) => {
          err.should.have.status(404);
          err.response.body.message.should.equal('This event does not exist!');
        });
    });

    it('should return a 400 if the user is already subscribed to the event', () => {
      let payload = { event: eventId, user: eventCreator._id };

      return chai.request(server)
        .patch('/api/events')
        .send(payload)
        .catch((err) => {
          err.should.have.status(400);
          err.response.body.message.should.equal('You are already a member of this event.');
        });
    });

    it('should return a 200 if the user is successfully subscribed to the event', () => {
      let payload = { event: eventId, user: subscribingUser._id };

      return chai.request(server)
        .patch('/api/events')
        .send(payload)
        .then((res) => {
          res.should.have.status(200);
          res.body.members.should.contain(subscribingUser._id);
        });
    });
  });

  describe('GET Events for User', () => {
    it('should return a collection of events for a user who is subscribed to events', () => {
      return chai.request(server)
        .get('/api/events/user/' + eventCreator._id)
        .then((res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body[0].members.should.contain(eventCreator._id);
        });
    });

    it('should return a 404 for a user who isn\'t subscribed to events', () => {
      return chai.request(server)
        .get('/api/events/user/' + eventlessUser._id)
        .catch((err) => {
          err.should.have.status(404);
          err.response.body.should.have.property('resource');
          err.response.body.should.have.property('message');
        });
    });

    it('should return a 404 for a user that doesn\'t exist', () => {
      return chai.request(server)
        .get('/api/events/user/' + 12345)
        .catch((err) => {
          err.should.have.status(404);
          err.response.body.message.should.equal('This user does not exist!');
        });
    });
  });

  after(() => {
    return Promise.all([
      Event.remove({}),
      User.remove({})
    ]);
  });
});

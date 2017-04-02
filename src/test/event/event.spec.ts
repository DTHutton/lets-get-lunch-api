import Event from '../../models/event';
import User from '../../models/user';
import server from '../../index';
import Utils from '../utils';

describe('Event', () => {
  let myUser;
  let eventId;

  before(() => {
    return Promise.all([
      Event.remove({}),
      User.remove({})
    ]);
  });

  before(() => {
    return Utils.getUserAndToken().spread((user, session) => {
      myUser = user;
    });
  });

  describe('POST Event', () => {
    it('should return an Event object with a valid payload', () => {
      let event = new Event({
        _creator: myUser._id,
        title: 'Test Title',
        location: 'Atlanta, GA',
        startTime: '2017-04-01T19:00:00.000Z',
        endTime: '2017-04-01T20:00:00.000Z'
      });

      return chai.request(server)
        .post('/api/events')
        .send(event)
        .then((res) => {
          res.should.have.status(200);
          res.body._creator.should.equal(myUser._id);
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

  after(() => {
    return Promise.all([
      Event.remove({}),
      User.remove({})
    ]);
  });
});

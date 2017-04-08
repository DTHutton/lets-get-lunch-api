import Comment from '../../models/comment';
import User from '../../models/user';
import Event from '../../models/event';
import Utils from '../utils';
import server from '../../index';

describe('Comment', () => {
  let myUser;
  let myEvent;

  before(() => {
    return Promise.all([
      User.remove({}),
      Event.remove({}),
      Comment.remove({})
    ]);
  });

  before(() => {
    return Utils.getUserAndToken().spread((user, session) => {
      myUser = user;
    });
  });

  before(() => {
    let event = new Event({
      _creator: myUser._id,
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
        res.body._creator.should.equal(myUser._id);
        myEvent = res.body;
      });
  });

  describe('POST Comment', () => {
    it('should return a Comment object with a valid payload', () => {
      let comment = new Comment({
        content: 'First comment',
        _event: myEvent._id,
        _creator: myUser._id,
      });

      return chai.request(server)
        .post('/api/comments')
        .send(comment)
        .then((res) => {
          res.should.have.status(200);
          res.body._creator.should.equal(myUser._id);
          res.body._event.should.equal(myEvent._id);
        });
    });

    it('should return a 500 with an invalid payload', () => {
      let comment = new Comment({});

      return chai.request(server)
        .post('/api/comments')
        .send(comment)
        .catch((err) => {
          err.should.have.status(500);
          err.response.body.message.should.equal('Comment could not be created!');
        });
    });
  });

  after(() => {
    return Promise.all([
      User.remove({}),
      Event.remove({}),
      Comment.remove({})
    ]);
  });
});
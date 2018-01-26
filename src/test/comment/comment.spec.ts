import Comment from '../../models/comment';
import User from '../../models/user';
import Event from '../../models/event';
import Utils from '../utils';
import server from '../../index';

describe('Comment', () => {
  let myUser;
  let populatedEvent;
  let emptyEvent;
  let myComment;

  before(() => {
    return Promise.all([
      User.remove({}),
      Event.remove({}),
      Comment.remove({})
    ]);
  });

  before(() => {
    return Utils.getUserAndToken().spread((user, session: any) => {
      myUser = user;
      myUser._token = session.token;
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
      .set('Authorization', myUser._token)
      .send(event)
      .then((res) => {
        res.should.have.status(200);
        res.body._creator.should.equal(myUser._id);
        emptyEvent = res.body;
      });
  });

  before(() => {
    let event = new Event({
      _creator: myUser._id,
      title: 'Event with no Comments',
      city: 'Atlanta',
      state: 'GA',
      startTime: '2017-04-01T19:00:00.000Z',
      endTime: '2017-04-01T20:00:00.000Z'
    });

    return chai.request(server)
      .post('/api/events')
      .set('Authorization', myUser._token)
      .send(event)
      .then((res) => {
        res.should.have.status(200);
        res.body._creator.should.equal(myUser._id);
        populatedEvent = res.body;
      });
  });

  describe('POST Comment', () => {
    it('should return a Comment object with a valid payload', () => {
      let comment = new Comment({
        content: 'First comment',
        _event: populatedEvent._id,
        _creator: myUser._id
      });

      return chai.request(server)
        .post('/api/comments')
        .set('Authorization', myUser._token)
        .send(comment)
        .then((res) => {
          res.should.have.status(200);
          res.body._creator.should.equal(myUser._id);
          res.body._event.should.equal(populatedEvent._id);
          myComment = res.body;
        });
    });

    it('should return a 500 with an invalid payload', () => {
      let comment = new Comment({});

      return chai.request(server)
        .post('/api/comments')
        .set('Authorization', myUser._token)
        .send(comment)
        .catch((err) => {
          err.should.have.status(500);
          err.response.body.message.should.equal('Comment could not be created!');
        });
    });
  });

  describe('GET Comment', () => {
    it('should return a collection of Comment objects for a given Event', () => {
      return chai.request(server)
        .get('/api/comments/event/' + populatedEvent._id)
        .then((res) => {
          res.should.have.status(200);
          res.body[0]._event.should.equal(populatedEvent._id);
        });
    });

    it('should return a 404 for an Event with no comments', () => {
      return chai.request(server)
        .get('/api/comments/event/' + emptyEvent._id)
        .catch((err) => {
          err.should.have.status(204);
          err.response.body.should.have.property('resource');
          err.response.body.should.have.property('message');
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

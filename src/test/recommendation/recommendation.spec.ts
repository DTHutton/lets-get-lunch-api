import * as rp from 'request-promise';
import * as sinon from 'sinon';

import User from '../../models/user';
import Event from '../../models/event';
import Utils from '../utils';
import server from '../../index';
import MockZomato from '../mocks/zomato';

const ZomatoCitiesResponse = MockZomato.ZomatoCitiesResponse;
const ZomatoRestaurantsResponse = MockZomato.ZomatoRestaurantsResponse;
const ZomatoCuisinesResponse = MockZomato.ZomatoCuisinesResponse;
const ZomatoNoCitiesResponse = MockZomato.ZomatoNoCitiesResponse;

describe('Recommendation', () => {
  let user;
  let zomatoCityEvent;
  let noZomatoCityEvent;
  let zomatoSpy;

  before(() => {
    zomatoSpy = sinon.stub(rp, 'get');
  });

  before(() => {
    return Promise.all([
      User.remove({}),
      Event.remove({})
    ]);
  });

  before(() => {
    return Utils.getUserAndToken().spread((newUser, session) => {
      user = newUser;
      user._token = session.token;
    });
  });

  before(() => {
    let newEvent = new Event({
      _creator: user._id,
      title: 'Test Title',
      city: 'Atlanta',
      state: 'GA',
      startTime: '2017-04-01T19:00:00.000Z',
      endTime: '2017-04-01T20:00:00.000Z'
    });

    return chai.request(server)
      .post('/api/events')
      .set('Authorization', user._token)
      .send(newEvent)
      .then((res) => {
        res.should.have.status(200);
        res.body._creator.should.equal(user._id);
        zomatoCityEvent = res.body;
      });
  });

  before(() => {
    let newEvent = new Event({
      _creator: user._id,
      title: 'Test Title',
      city: 'Madison',
      state: 'GA',
      startTime: '2017-04-01T19:00:00.000Z',
      endTime: '2017-04-01T20:00:00.000Z'
    });

    return chai.request(server)
      .post('/api/events')
      .set('Authorization', user._token)
      .send(newEvent)
      .then((res) => {
        res.should.have.status(200);
        res.body._creator.should.equal(user._id);
        noZomatoCityEvent = res.body;
      });
  });

  describe('GET Recommendation', () => {
    it('should return locations with a valid event', () => {
      zomatoSpy.onFirstCall().returns(ZomatoCitiesResponse);
      zomatoSpy.onSecondCall().returns(ZomatoCuisinesResponse);
      zomatoSpy.onThirdCall().returns(ZomatoRestaurantsResponse);

      return chai.request(server)
        .get('/api/recommendations/' + zomatoCityEvent._id)
        .set('Authorization', user._token)
        .then((res) => {
          res.should.have.status(200);
          res.body.should.have.property('restaurants');
          sinon.assert.calledThrice(zomatoSpy);
          zomatoSpy.reset();
        });
    });

    it('should return an error message for an event with no associated Zomato locations', () => {
      zomatoSpy.onFirstCall().returns(ZomatoNoCitiesResponse);

      return chai.request(server)
        .get('/api/recommendations/' + noZomatoCityEvent._id)
        .set('Authorization', user._token)
        .catch((err) => {
          err.response.should.have.status(500);
          err.response.body.message.should.equal('No recommendations for this location exist.');
          sinon.assert.calledOnce(zomatoSpy);
          zomatoSpy.reset();
        });
    });

    it('should return a 500 with an invalid event', () => {
      return chai.request(server)
        .get('/api/recommendations/' + 1)
        .set('Authorization', user._token)
        .catch((err) => {
          err.response.should.have.status(500);
          sinon.assert.notCalled(zomatoSpy);
        });
    });
  });

  after(() => {
    return Promise.all([
      User.remove({}),
      Event.remove({})
    ]);
  });
});
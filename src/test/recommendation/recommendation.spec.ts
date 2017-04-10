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

describe('Recommendation', () => {
  let user;
  let event;
  let zomatoSpy;

  before(() => {
    zomatoSpy = sinon.stub(rp, 'get');
    zomatoSpy.onFirstCall().returns(ZomatoCitiesResponse);
    zomatoSpy.onSecondCall().returns(ZomatoCuisinesResponse);
    zomatoSpy.onThirdCall().returns(ZomatoRestaurantsResponse);
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
      .send(newEvent)
      .then((res) => {
        res.should.have.status(200);
        res.body._creator.should.equal(user._id);
        event = res.body;
      });
  });

  describe('GET Recommendation', () => {
    it('should return locations with a valid event', () => {
      return chai.request(server)
        .get('/api/recommendations/' + event._id)
        .then((res) => {
          res.should.have.status(200);
          res.body.should.have.property('restaurants');
          sinon.assert.calledThrice(zomatoSpy);
          zomatoSpy.reset();
        });
    });

    it('should return a 500 with an invalid event', () => {
      return chai.request(server)
        .get('/api/recommendations/' + 1)
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
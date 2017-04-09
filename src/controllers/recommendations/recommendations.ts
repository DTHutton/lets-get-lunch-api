import Event from '../../models/event';
import * as rp from 'request-promise';
import Promise = require('bluebird');
let config = require('../../dev.json');

let restaurantResults: any;

function get(req, res) {
  let myEvent: any;

  getEvent(req.params.id).then((event) => {
    myEvent = event;
    return createCityRequestOptions(event);
  })
  .then(getZomatoCitiesByName)
  .then((locations) => {
    let city = getZomatoCityForEvent(locations, myEvent);
    return createRestaurantsRequestOptions(city);
  })
  .then(getZomatoRestaurantSuggestions)
  .then((result) => {
    res.status(200).json(result);
  })
  .catch((err) => {
    res.status(500).json(err);
  });
}

function getEvent(event) {
  return Event.findOne({ _id: event }).exec();
}

function createCityRequestOptions(event) {
  return {
    'uri': 'https://developers.zomato.com/api/v2.1/cities',
    'qs': {
      'q': event.city
    },
    'headers': {
      'user-key': config.zomato
    },
    'json': true
  };
}

function createRestaurantsRequestOptions (city) {
  return {
    'uri': 'https://developers.zomato.com/api/v2.1/search',
    'qs': {
      'entity_id': city.id,
      'entity_type': 'city'
    },
    'headers': {
      'user-key': config.zomato
    },
    'json': true
  };
}

function getZomatoCitiesByName(options) {
  return rp.get(options);
}

function getZomatoRestaurantSuggestions(options) {
  return rp.get(options);
}

function getZomatoCityForEvent(cities, event) {
  let result = cities.location_suggestions.filter((city) => {
    if (city.state_code === event.state && city.name.includes(event.city)) {
      return city;
    }
  });
  return result[0];
}

export default { get };

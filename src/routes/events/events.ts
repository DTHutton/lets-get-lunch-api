import * as express from 'express';
import EventsCtrl from '../../controllers/events';
import auth from '../../middleware/auth';

const router = express.Router();

router.route('/')
  .post(auth.isAuthenticated, EventsCtrl.create)
  .patch(auth.isAuthenticated, EventsCtrl.subscribe);

router.route('/:id')
  .get(EventsCtrl.get)
  .patch(auth.isAuthenticated, EventsCtrl.update);

router.route('/user/:id')
  .get(EventsCtrl.getEventsForUser);

export default router;
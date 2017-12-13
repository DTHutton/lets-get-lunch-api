import * as express from 'express';
import EventsCtrl from '../../controllers/events';
import auth from '../../middleware/auth';

const router = express.Router();

router.route('/')
  .get(EventsCtrl.all)
  .post(auth.isAuthenticated, EventsCtrl.create)

router.route('/:id')
  .get(EventsCtrl.get)
  .patch(auth.isAuthenticated, EventsCtrl.update);

router.route('/user/:id')
  .get(EventsCtrl.getEventsForUser);

router.route('/:id/subscribe')
  .patch(auth.isAuthenticated, EventsCtrl.subscribe);

export default router;

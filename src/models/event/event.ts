import * as mongoose from 'mongoose';
const Schema = mongoose.Schema;

// TODO add preferences
const EventSchema = new mongoose.Schema({
  _creator: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  title: { type: String, required: true },
  description: { type: String },
  members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  location: { type: String, required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  suggestLocations: { type: Boolean, default: false }
});

export default mongoose.model('Event', EventSchema);
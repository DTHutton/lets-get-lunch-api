import * as mongoose from 'mongoose';
const Schema = mongoose.Schema;

const CommentSchema = new mongoose.Schema({
  content: { type: String, required: true },
  createdAt: { type: Date, required: true },
  _event: { type: Schema.Types.ObjectId, required: true, ref: 'Event' },
  _creator: { type: Schema.Types.ObjectId, required: true, ref: 'User' }
});

export default mongoose.model('Comment', CommentSchema);
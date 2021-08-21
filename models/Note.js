const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const NoteSchema = new Schema({
  title: { type: String, required: true },
  body: { type: String, required: true },
  creator: { type: mongoose.Types.ObjectId, required: true, ref: 'User' }
});

const Note = mongoose.model('Note', NoteSchema);

module.exports = Note;
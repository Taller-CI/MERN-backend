const { validationResult } = require('express-validator');
const mongoose = require('mongoose');

const HttpError = require('../models/http-error');
const Note = require('../models/Note');
const User = require('../models/User');

//Get a Note by ID
const getNoteById = async (req, res, next) => {
  const noteId = req.params.nid;

  let note;
  console.log(noteId);
  try {
    note = await Note.findById(noteId);
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not find a note.',
      500
    );
    return next(error);
  }

  if (!note) {
    const error = new HttpError(
      'Could not find note for the provided id.',
      404
    );
    return next(error);
  }

  res.json({ note: note.toObject({ getters: true }) });
};

//Find Note based on the user id
const getNotesByUserId = async (req, res, next) => {
  const userId = req.userData.userId;
  
  let userWithNotes;
  try {
    userWithNotes = await User.findById(userId).populate('notes');
    console.log("AAAA", userWithNotes);
  } catch (err) {
    const error = new HttpError(
      'Fetching notes failed, please try again later.',
      500
    );
    return next(error);
  }

  if (!userWithNotes || userWithNotes.notes.length === 0) {
    return next(
      new HttpError('Could not find notes for the provided user id.', 404)
    );
  }

  res.json({
    notes: userWithNotes.notes.map(note =>
      note.toObject({ getters: true })
    )
  });
};


// Create a Note
const createNote = async (req, res, next) => {

  const { title, body } = req.body;

  const createdNote = new Note({
    title,
    body,
    creator: req.userData.userId
  });

  let user;
  try {
    user = await User.findById(req.userData.userId);
    
  } catch (err) {
    const error = new HttpError(
      'Creating note failed, please try again.',
      500
    );
    return next(error);
  }

  if (!user) {
    const error = new HttpError('Could not find user for provided id.', 404);
    return next(error);
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdNote.save({ session: sess });
    user.notes.push(createdNote);
    await user.save({ session: sess });
    await sess.commitTransaction();

  } catch (err) {
    const error = new HttpError(
      'Creating note failed, please try again.',
      500
    );
    console.log(err);
    return next(error);
  }

  res.status(201).json({ note: createdNote });
};

//Updates a Note
const updateNote = async (req, res, next) => {

  const { title, body } = req.body;
  const noteId = req.params.nid;

  let note;
  try {
    note = await Note.findById(noteId);
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not update note.',
      500
    );
    return next(error);
  }

  if (note.creator.toString() !== req.userData.userId) {
    const error = new HttpError('You are not allowed to edit this note.', 401);
    return next(error);
  }

  note.title = title;
  note.body = body;

  try {
    await note.save();
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not update note.',
      500
    );
    return next(error);
  }

  res.status(200).json({ note: note.toObject({ getters: true }) });
};

//Deletes a Note
const deleteNote = async (req, res, next) => {
  const noteId = req.params.nid;

  let note;
  try {
    note = await Note.findById(noteId).populate('creator');
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not delete note.',
      500
    );
    return next(error);
  }

  if (!note) {
    const error = new HttpError('Could not find note for this id.', 404);
    return next(error);
  }

  if (note.creator.id !== req.userData.userId) {
    const error = new HttpError(
      'You are not allowed to delete this note.',
      401
    );
    return next(error);
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    console.log("AAAA", note.creator);
    console.log("xd");
    await note.remove({ session: sess });
    console.log("jajaja");
    note.creator.notes.pull(note);
    console.log("BBBBBBB", note.creator);
    await note.creator.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not delete note.',
      500
    );
    return next(error);
  }

  res.status(200).json({ message: 'Deleted note.' });
};

exports.getNoteById = getNoteById;
exports.createNote = createNote;
exports.getNotesByUserId = getNotesByUserId;
exports.updateNote = updateNote;
exports.deleteNote = deleteNote;
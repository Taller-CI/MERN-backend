const express = require('express');
const { getPrivateData } = require('../controllers/private'); //Aqui luego hay que cambiarlo por el home
const notesController = require('../controllers/notes-controller');

const checkAuth = require('../middleware/auth');

const router = express.Router();

router.use(checkAuth);

router.get("/", getPrivateData); //Esto solo se agrega para tener algo que mostrar en el path de / en el get

router.get('/notes/:nid', notesController.getNoteById);

router.get('/user/', notesController.getNotesByUserId);

router.route("/notes").post(notesController.createNote);


router.route("/notes/:nid").patch(notesController.updateNote);
  
router.delete('/notes/:nid', notesController.deleteNote);

module.exports = router;
const express = require('express');
const router = express.Router();

const {register, login, forgotpassword, resetpassword } = require('../controllers/auth');

router.route("/register").post(register);

router.route("/forgotpassword").post(forgotpassword);

router.route("/resetpassword/:resetToken").put(resetpassword);

module.exports = router;
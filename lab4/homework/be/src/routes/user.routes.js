// Router for /api/v1/users (every route needs a valid token)
const express = require('express');
const controller = require('../controllers/user.controller');
const requireAuth = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

const router = express.Router();

router.use(requireAuth);

router.put('/me', controller.updateMe);
router.post('/me/avatar', upload.single('avatar'), controller.updateAvatar);

module.exports = router;

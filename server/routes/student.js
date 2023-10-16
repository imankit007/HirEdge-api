const express = require('express');
const router = express.Router();

const { authenticateToken } = require('../utils/auth')


router.get('/profile', authenticateToken, (req, res) => {

    res.send(req.user);
})



module.exports = router;
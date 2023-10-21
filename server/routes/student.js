const express = require('express');
const router = express.Router();

const { authenticateToken } = require('../utils/auth')


router.get('/student/profile', authenticateToken, (req, res) => {
    res.send("Hello");
})



module.exports = router;
const express = require('express')
const cors = require('cors')
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
var cookieParser = require('cookie-parser');
const morgan = require('morgan');
dotenv.config();
const { studentColl, tpoColl, hodColl, alumniColl, companyColl, con } = require('./utils/dbConfig');
var app = express();
app.use(morgan("dev"))
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());


const { generateAuthToken, authenticateToken } = require('./utils/auth.utils')

//router for student module
const studentRouter = require('./routes/student.router');

//router for tpo module
const tpoRouter = require('./routes/tpo.router');

//router for alumni module
const alumniRouter = require('./routes/alumni.router');

const hodRouter = require('./routes/hod');
const commonRouter = require('./routes/common.router');
const { sendTestNotification } = require('./utils/messaging.utils');

app.use('/student', studentRouter);
app.use('/tpo', tpoRouter);
app.use('/alumni',alumniRouter);
app.use(hodRouter);
app.use('/common', commonRouter);



app.get('/', (req, res) => {
    res.send({ "message": "API is working" })
})


function JSDatetoSQLDateTime(seconds) {
    let date = new Date();
    date.setSeconds(seconds);
    return date.toISOString().slice(0, 19).replace('T', ' ');
}

app.post('/login', async (req, res) => {

    console.log(req.body);


    let user = null;
    try {   
        if (req.body.role == 'student') {
            user = await studentColl.findOne({
                'user_id': String(req.body.user_id).toLowerCase().trim(),
            }, {
                projection: {
                    password: 1
                }
            })
        } else
        if (req.body.role == 'tpo') {
            user = await tpoColl.findOne({
                'user_id': String(req.body.user_id).toLowerCase().trim()
            }, {
                projection: {
                    password: 1
                }
            })
        } else
        if (req.body.role == 'hod') {
            user = await hodColl.findOne({
                'user_id': String(req.body.user_id).trim()
            }, {
                projection: {
                    password: 1
                }
            })
        } else

        if (req.body.role == 'alumni') {
            user = await alumniColl.findOne({
                'user_id': String(req.body.user_id).trim().toLowerCase()
            }, {
                projection: {
                    password: 1
                }
            })
        }
        if (user == null) {
            res.status(401).json({
                'message': 'User ID does not exist'
            })
        } else
            if (req.body.password == user.password) {
                const access_token = generateAuthToken({ user_id: req.body.user_id, role: req.body.role }, '1800s');
                const refresh_token = generateAuthToken({ user_id: req.body.user_id, role: req.body.role }, `${7 * 24 * 60 * 60}s`);

                const expirtAt = JSDatetoSQLDateTime(7 * 24 * 60 * 60)

                con.execute('INSERT INTO auth (refresh_token, user_id, role, expiryAt )VALUES (?,?,?,?)', [
                    refresh_token, req.body.user_id, req.body.role, expirtAt
                ], function (err, results) {
                    console.log(err);
                })


                res.cookie('refresh_token', refresh_token, {
                    httpOnly: true,
                    maxAge: 24 * 60 * 60 * 1000,
                    sameSite: 'none',
                    secure: true,
                    path: '/'
                })
                res.status(200).json({
                    user_id: req.body.user_id,
                    role: req.body.role,
                    access_token,
                    refresh_token
                });
            } else {
                res.status(400).json({ message: "Invalid User ID or Password" })
            }
    } catch (e) {
        console.log(e);
    }
})

app.get('/refresh', async (req, res) => {
    const cookies = req.cookies;
    let refreshToken = cookies.refresh_token;
    if (refreshToken == "undefined" || !refreshToken) {
        res.sendStatus(401);
    } else {
        con.execute('SELECT * from `auth` WHERE `refresh_token` = ?', [refreshToken], function (err, results) {
            if (err) throw err;
            if (results.length == 0) return res.sendStatus(401);
            jwt.verify(
                results[0].refresh_token,
                process.env.TOKEN_SECRET, (err, decoded) => {
                    if (err || results[0].user_id.toLowerCase() !== decoded.user_id.toLowerCase()) {
                        return res.sendStatus(403);
                    }
                    const access_token = jwt.sign({
                        'user_id': decoded.user_id,
                        'role': decoded.role
                    },
                        process.env.TOKEN_SECRET,
                        {
                            expiresIn: '1800s'
                        }
                    );
                    return res.status(200).json({
                        access_token, role: decoded.role
                    })
                }
            )
        })
    }
})

app.get('/logout', async (req, res) => {
    const cookies = req.cookies;
    const refreshToken = cookies.refresh_token;

    con.execute('DELETE FROM auth where refresh_token=?', [refreshToken], function (err, results) {
        if (err) throw err;
    })
    res.clearCookie('refresh_token').status(200).send("Logout Successful")
})

app.get("/", function (req, res) {
    res.status(200).json({
        message: "API is Working"
    })
})

app.get('/send', async function (req, res) {

    try {
        const response = await sendTestNotification();

        console.log(response);

        res.status(200).json({
            message: response
        })

    } catch (error) {
        res.sendStatus(400);
        console.log(error);
    }

})


app.listen(5000, async () => {
    console.log("Listening at PORT 5000");
})



module.exports = app;
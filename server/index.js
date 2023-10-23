const express = require('express')
const cors = require('cors')
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
var cookieParser = require('cookie-parser');

const studentRouter = require('./routes/student')
const { studentColl, tpoColl, hodColl, alumniColl, companyColl } = require('./utils/dbConfig')

const { generateAuthToken } = require('./utils/auth')

dotenv.config();
var app = express();
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(studentRouter)
app.get('/', (req, res) => {
    res.send({ "message": "API is working" })
})

app.post('/login', async (req, res) => {

    console.log('Login Requested')

    let user = null;
    try {

        if (req.body.role == 'student') {
            user = await studentColl.findOne({
                'user_id': req.body.user_id.toString().toLowerCase()
            })
        }

        if (req.body.role == 'tpo') {
            user = await tpoColl.findOne({
                'user_id': req.body.user_id.toString().toLowerCase()
            })
        }

        if (req.body.role == 'hod') {
            user = await hodColl.findOne({
                'user_id': req.body.user_id.toString().toLowerCase()
            })
        }

        if (req.body.role == 'alumni') {
            user = await alumniColl.findOne({
                'user_id': req.body.user_id.toString().toLowerCase()
            })
        }
        if (user == null) {
            res.status(401).send({
                'message': 'User ID does not exist'
            })
        }
        if (req.body.password == user.password) {
            const access_token = generateAuthToken({ user_id: req.body.user_id, role: req.body.role }, '1800s')
            const refresh_token = generateAuthToken({ user_id: req.body.user_id, role: req.body.role }, `${7 * 24 * 60 * 60}s`)

            if (req.body.role == 'student') {
                await studentColl.findOneAndUpdate({
                    'user_id': req.body.user_id.toString().toLowerCase()
                }, {
                    $set: {
                        'refresh_token': refresh_token,
                    }
                })
            }

            if (req.body.role == 'tpo') {
                await tpoColl.findOneAndUpdate({
                    'user_id': req.body.user_id.toString().toLowerCase()
                }, {
                    $set: {
                        'refresh_token': refresh_token,
                    }
                })
            }

            if (req.body.role == 'hod') {
                await hodColl.findOneAndUpdate({
                    'user_id': req.body.user_id.toString().toLowerCase()
                }, {
                    $set: {
                        'refresh_token': refresh_token,
                    }
                })
            }

            if (req.body.role == 'alumni') {
                await alumniColl.findOneAndUpdate({
                    'user_id': req.body.user_id.toString().toLowerCase()
                }, {
                    $set: {
                        'refresh_token': refresh_token,
                    }
                })
            }
            res.cookie('refresh_token', `${req.body.role} ${refresh_token}`, {
                httpOnly: true, maxAge: 24 * 60 * 60 * 1000,
                sameSite: 'none',
                secure: true
            })
            res.status(200).json({
                user_id: req.body.user_id,
                role: req.body.role,
                access_token,
                refresh_token
            }); 
        } else {
            res.status(400).send({ message: "Authentication Failed" })
        }
    } catch (e) {
        console.log(e);
    }
})

app.get('/refresh', async (req, res) => {

    console.log('Refresh Token Requested');

    const cookies = req.cookies;

    if (!cookies.refresh_token) return res.sendStatus(401);

    const refreshToken = cookies.refresh_token;

    const [role, refresh_token] = refreshToken.split(' ')

    let user;

    if (role == 'student') {
        user = await studentColl.findOne({
            'refresh_token': refresh_token
        })
    }
    if (role == 'tpo') {
        user = await tpoColl.findOne({
            'refresh_token': refresh_token
        })
    }
    if (role == 'hod') {
        user = await hodColl.findOne({
            'refresh_token': refresh_token
        })
    }
    if (role == 'alumni') {
        user = await alumniColl.findOne({
            'refresh_token': refresh_token
        })
    }
    if (!user) {
        return res.sendStatus(401)
    }
    jwt.verify(
        refresh_token,
        process.env.TOKEN_SECRET, (err, decoded) => {
            if (err || user.user_id !== decoded.user_id) {
                return res.sendStatus(403);
            }
            console.log(decoded);
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

app.get('/logout', (req, res) => {

    res.clearCookie('refresh_token').send("Logout Successful")

})


app.listen(5000, async () => {
    console.log("Listening at PORT 5000");
})


module.exports = {
    studentColl
}
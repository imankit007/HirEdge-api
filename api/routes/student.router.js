const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");



const {
    studentColl,
    companyColl,
    companyDBColl,
} = require("../utils/dbConfig");
const { UUID, ObjectId } = require("mongodb");
const {

    getCompanies,
    getCompanyDetails,
    getInterviewExperiencesOfCompany,
} = require("../utils/dataFetching");
const {
    getProfile,
    getDrives,
    getQualification, getDriveData,
    getParticipatingDrives,
} = require("../utils/student.utils");

function authenticateToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (token == null) return res.sendStatus(401);
    jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
        console.log(err);
        if (err) return res.sendStatus(403);
        if (user.role != "student") {
            res.status(403).send("Unauthorized Access");
        }
        req.user = user;
        next();
    });
}

router.get("/profile", authenticateToken, async (req, res) => {
    try {
        const user_id = req.user.user_id;
        const data = await getProfile(user_id);
        res.status(200).json(data);
    } catch (error) {
        res.sendStatus(400);
    }
});

router.put('/profile', authenticateToken, async (req, res) => {

    try {   

        console.log(req.body);

        // const updates = {};
        // for (let [key, value] of Object.entries(req.body)) {
        //     updates[key] = value;
        // }
        // await studentColl.findOneAndUpdate({
        //     'user_id': req.user.user_id,
        // }, {
        //     $set: updates
        // })
        res.sendStatus(200);
    } catch (error) {
        console.log(error);
        res.sendStatus(400);
    }

})

router.get("/drives", authenticateToken, async (req, res) => {
    try {
        const s = req.query.s;
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const studentData = await getQualification(req.user.user_id);


        const data = await getDrives(s, page, limit, studentData);

        res.status(200).json(data);
    } catch (error) {
        console.log(error);
        res.sendStatus(400); ``
    }
});

router.get('/drives/participated', authenticateToken, async (req, res) => {
    try {

        const page = Number(req.query.page) || 1;
        const limit = 5;

        const drives = await getParticipatingDrives(req.user.user_id, page, limit);

        res.json(drives);
    } catch (error) {
        console.log(error);
    }
})

router.get("/drive/:drive_id", authenticateToken, async (req, res) => {
    const id = req.params.drive_id;
    const studentData = await getQualification(req.user.user_id);
    try {
        let result = await getDriveData(id, req.user.user_id, studentData);
        res.status(200).json(result);
    } catch (e) {
        console.log(e);
        res.sendStatus(400);
    }
});

router.get("/companies", authenticateToken, async (req, res) => {
    try {
        const s = String(req.query.s) || "";
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 25;

        var data = await getCompanies(s, page, limit);
        res.status(200).json(data);
    } catch (error) {
        console.log(error);
    }
});

router.get("/company/:company_id", authenticateToken, async (req, res) => {
    try {
        const id = req.params.company_id;

        const data = await getCompanyDetails(id);

        res.send(data);
    } catch (error) {
        console.log(error);
    }
});

router.post("/drive/:drive_id/apply", authenticateToken, async (req, res) => {
    try {
        const drive_id = req.params.drive_id;
        const student_id = req.user.user_id;

        const result = companyColl.findOneAndUpdate(
            {
                _id: new ObjectId(drive_id),
            },
            {
                $addToSet: {
                    students: {
                        "usn": student_id,
                        "status": "registered"
                    }
                },
            }
        );

        res.sendStatus(200);
    } catch (err) {
        console.log(err);
        res.sendStatus(400);
    }
});

router.post(
    "/company/:company_id/experiences",
    authenticateToken,
    async (req, res) => {
        try {
            const company_id = req.params.company_id;
        res.sendStatus(200);
        } catch (error) {
            console.log(error);
            res.sendStatus(400);
        }
    }
);

router.get(
    "/company/:company_id/experiences",
    authenticateToken,
    async (req, res) => {
        try {
            const company_id = req.params.company_id;

            const page = Number(req.query.page);
            const limit = Number(req.query.limit);

            const data = await getInterviewExperiencesOfCompany(
                company_id,
                page,
                limit
            );
            res.status(200).json(data);
    } catch (error) {
        console.log(error);
        res.sendStatus(400);
    }
    }
);  


module.exports = router;

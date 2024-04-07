var admin = require('firebase-admin')
var serviceAccount = require('../../hiredge-72a4e-firebase-adminsdk-cpn2y-887a394ae0.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

async function sendTestNotification() {
    try {
        const topic = 'NewDrive'
        const payload = {
            notification: {
                title: "FCM IS COOL !",
                body: "Notification has been recieved",
                content_available: "true",
                image: "https://i.ytimg.com/vi/iosNuIdQoy8/maxresdefault.jpg"
            }
        }
        const res = await admin.messaging().send({
            topic: topic,
            notification: {
                title: "Student Profile",
                body: "Student Profile has been Opened"
            },
            data: {
                'link': 'hiredge://student/Profile'
            }
        })

        return res;
    }
    catch (error) {
        console.log(error);
    }

}

module.exports = { sendTestNotification }
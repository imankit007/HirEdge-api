var admin = require('firebase-admin')
var serviceAccount = require('../../hiredge-72a4e-firebase-adminsdk-cpn2y-887a394ae0.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

async function sendTestNotification() {
    try {
        const token = "cU5_LfPVQS--EasGo1Yo9t:APA91bGSggeujNSalAXrNI1qnDlriU4YOV9g3cwTRVXr5aP5lc_KQfCdjOf2zUL8gEX73W0RlWDuGDOR5ixgOmJnIfRjWv18_4ggYivTW71VwiWanGBP-GyO0c9T9lxkIHoBXebZ8isS"

        const payload = {
            notification: {
                title: "FCM IS COOL !",
                body: "Notification has been recieved",
                content_available: "true",
                image: "https://i.ytimg.com/vi/iosNuIdQoy8/maxresdefault.jpg"
            }
        }
        const res = await admin.messaging().send({
            token: token,
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
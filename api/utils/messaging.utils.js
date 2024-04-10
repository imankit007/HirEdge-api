var admin = require('firebase-admin')
var serviceAccount = require('../../hiredge-72a4e-firebase-adminsdk-dyvlx-9d3d83fdaa.json')

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
                title: "New Drive Posted",
                body: "A new Drive has been posted"
            },

            data: {

            }
        })

        return res;
    }
    catch (error) {
        console.log(error);
    }

}

module.exports = { sendTestNotification }
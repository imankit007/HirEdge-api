var admin = require('firebase-admin')
var serviceAccount = require('../../hiredge-72a4e-firebase-adminsdk-dyvlx-9d3d83fdaa.json')

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

async function sendNewDriveNotification(company_name) {
    try {
        const topic = 'NewDrive'

        const res = await admin.messaging().send({
            topic: topic,
            notification: {
                title: "New Drive Posted",
                body: `Company: ${company_name}\n`
            }
        })
    }
    catch (error) {
        console.log(error);
    }

}

async function sendDriveUpdate(company_name, update_type, update_message) {
    try {

        const topic = 'NewDrive';
        const res = await admin.messaging().send({
            topic: topic,
            notification: {
                title: `${company_name} Drive Update - ${update_type}`,
                body: update_message
            },
        })


    } catch (error) {
        console.log(error);
    }
}


module.exports = { sendDriveUpdate, sendNewDriveNotification }
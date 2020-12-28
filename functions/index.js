const functions = require('firebase-functions');

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

const admin = require('firebase-admin');
admin.initializeApp();

exports.removeUser = functions.https.onRequest(async (req, res) => {
  const session_id = req.query.session_id;
  const username = req.query.username;
  console.log('Attempting to delete user ' + username + ' from session ' + session_id);

  const writeResult = await admin.firestore().collection('sessions').doc(session_id).update({
    users: admin.firestore.FieldValue.arrayRemove(username)
  });

  console.log('Deleted user ' + username + ' from session ' + session_id);
  res.json({result: 'Deleted user ' + username + ' from session ' + session_id});
});

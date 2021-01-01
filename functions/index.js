const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.removeUser = functions.https.onRequest((req, res) => {
  // Remove user from session as they have left the game

  const session_id = req.query.session_id;
  const username = req.query.username;
  console.log('Attempting to delete user ' + username + ' from session ' + session_id);

  admin.firestore().collection('sessions').doc(session_id).update({
    users: admin.firestore.FieldValue.arrayRemove(username)
  }).then((result) => {
    console.log('Deleted user ' + username + ' from session ' + session_id);
    return { result: 'Deleted user ' + username + ' from session ' + session_id };
  }).catch((error) => {
    console.log('Error on deleting user: ' + error);
    return { result: 'Error on deleting user: ' + error };
  });

  res.json({result: 'Executing task'});
});

exports.removeSession = functions.https.onRequest(async (req, res) => {
  // Delete session and archive, as host has left

  const session_id = req.query.session_id;
  console.log('Attempting to delete session ' + session_id);

  // Archive session
  const session_info = await admin.firestore().collection('sessions').doc(session_id).get();
  const {serverTimestamp} = admin.firestore.FieldValue;
  const archived_doc_ref = await admin.firestore().collection('archived-sessions').add({
    session_id: session_id,
    number_games: session_info.data().number_games,
    opened_datetime: session_info.data().opened_datetime,
    closed_datetime: serverTimestamp(),
    owner: session_info.data().owner
  });

  // Delete session
  const delete_session = await admin.firestore().collection('sessions').doc(session_id).delete();

  console.log('Deleted session ' + session_id + ' and archived to ' + archived_doc_ref.id);
  res.json({result: 'Deleted session ' + session_id});
});

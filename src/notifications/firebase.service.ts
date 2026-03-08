import * as admin from 'firebase-admin';

export class FirebaseService {

 constructor(){

  admin.initializeApp({
   credential: admin.credential.applicationDefault()
  });

 }

 async sendPush(token,message){

  await admin.messaging().send({
    token,
    notification:{
      title:"New Message",
      body:message
    }
  })

 }

}
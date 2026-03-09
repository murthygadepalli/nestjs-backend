export class GoogleLoginDto {

  name: string
  email: string
  photo: string
  phone: string

  googleToken: string   // from Google SignIn
  fcmToken: string      // from Firebase messaging

}
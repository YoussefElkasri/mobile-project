export interface User {
  // id: string;
  // identifier: string;
  uid: string;
  username: string;
  email: string;
  password: string;
  photoURL: string;
  invitations?:[{
    topicId:string;
    topicName:string;
  }]
}

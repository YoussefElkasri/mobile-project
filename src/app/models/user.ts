export interface User {
  uid: string;
  username: string;
  email: string;
  password: string;
  emailVerified:boolean;
  profileLink: string;
  invitations?:[{
    topicId:string;
    topicName:string;
  }]
}

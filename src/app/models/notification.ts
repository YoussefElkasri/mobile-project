export interface Notif {
  id?: string;
  title?: string;
  description?:string;
  readed?:boolean;
  userId?:string;
  date?:Date;
  topicName?:string;
  invitationId:string;
  object?:{
    id:string;
    name:string;
  }
}

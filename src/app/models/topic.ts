import { Invite } from './invite';
import { Post } from './post';

export interface Topic {
  id: string;
  name: string;
  creator:string;
  invites:Invite[];
  invitesRead: String[];
  invitesWrite: String[];
  posts: Post[];
}

import { Invite } from './invite';
import { Post } from './post';
import { User } from './user';

export interface Topic {
    id: string;
    name: string;
    creator:string;
    invites:Invite[];
    posts: Post[];
}

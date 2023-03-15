import { Post } from './post';
import { User } from './user';

export interface Topic {
    id: string;
    name: string;
    creator:string;
    invites:User[];
    posts: Post[];
}

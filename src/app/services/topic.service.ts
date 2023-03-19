import { Post } from './../models/post';
import { inject, Injectable } from '@angular/core';
import { Firestore, collection, collectionData, doc, docData, addDoc , deleteDoc, CollectionReference, query, where, orderBy} from '@angular/fire/firestore';
import { BehaviorSubject, map, Observable, switchMap, filter } from 'rxjs';
import { Topic } from '../models/topic';
import { User } from '../models/user';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class TopicService {

  private firestore= inject(Firestore);
  private authService = inject(AuthService);
  private topics$:BehaviorSubject<Topic[]> = new BehaviorSubject([{} as Topic]);

  constructor() { }

  /**
   * Method that returns all the topics
   *
   * @return An array of {Topic}
   */
  findAll(): Observable<Topic[]> {
    return this.topics$.asObservable();
  }

  getAll():Observable<Topic[]>{
    const collectionRef = collection(this.firestore,`topics`) as CollectionReference<Topic>;
    let uid = this.authService.getAuth()?.uid;
    return collectionData<Topic>(query(collectionRef, where("creator", "==", uid) ), {idField:'id'});
   // return collectionData<Topic>(collectionRef, {idField:'id'});
  }

  getAllPosts(id:string):Observable<Post[]>{
    const collectionRef = collection(this.firestore,`topics/${id}/posts`) as CollectionReference<Post>;

    return collectionData<Post>(collectionRef , {idField:'id'});
  }

  findOnePost(topicId: string, postId: string): Observable<any>{
    const docRef = doc(this.firestore,`topics/${topicId}/posts/${postId}`);

    return docData(docRef, {idField:'id'});
  }

  /**
   * Method that returns the topic which match the given id
   *
   * @param id {string} the given id
   * @return A {Topic}
   */
  findOne(id: string): Observable<any> {
    const docRef = doc(this.firestore, "topics", id);
    const collectionRef = collection(this.firestore,`topics/${id}/posts`) as CollectionReference<Post>;

    return docData(docRef,{idField:'id'}).pipe(
      switchMap(topic=> collectionData(query(collectionRef, orderBy('dateTime', 'asc')), {idField:'id'}).pipe(
        map(posts => ({
          ...topic,
          posts
        })
        )
      ))
    );
  }

  /**
   * Add a new {Topic} to the list
   *
   * @param topic {Topic}, the {Topic} to add to the list
   */
  create(topic: Topic): void {
    topic.creator = this.authService.getAuth()!.uid;
    const docRef = addDoc(collection(this.firestore, "topics"), topic);
  }

  /**
   * Remove a {Topic} from the list
   *
   * @param topic {Topic}, the {Topic} to remove from the list
   */
  delete(topic: Topic): void {
    deleteDoc(doc(this.firestore, "topics", topic.id));
  }

  /**
   * Add a new {Post} to the list of {Post} of the {Topic} that match the given topicId
   *
   * @param topicId {string}, the id of the {Topic} we want to add the new {Post}
   * @param post {Post}, the new {Post} to add
   */
  createPost(topicId: string, post: Post) {
    const collectionRef = collection(this.firestore,`topics/${topicId}/posts`) as CollectionReference<Post>;

    if(collectionRef != null) {
      const docRef = addDoc(collectionRef, post);
    }
  }

  /**
   * Remove a {Post} from the list of {Post} of the {Topic} that match the given topicId
   *
   * @param topicId {string}, the id of the {Topic} we want to remove the {Post}
   * @param post {Post}, the {Post} to remove
   */
  deletePost(topicId: string, post: Post): void {
    const docRef = doc(this.firestore, `topics/${topicId}/posts`, post.id)
    if(docRef != null) {
      deleteDoc(docRef);
    }

  }

  getAllUsers():Observable<User[]>{
    const collectionRef = collection(this.firestore,`users`) as CollectionReference<User>;
    return collectionData<User>(collectionRef, {idField:'id'});
  }

}

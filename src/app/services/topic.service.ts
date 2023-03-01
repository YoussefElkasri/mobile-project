import { inject, Injectable } from '@angular/core';
import { Firestore, collection, collectionData, doc, getDoc, docData, addDoc , deleteDoc, CollectionReference, setDoc } from '@angular/fire/firestore';
import { BehaviorSubject, map, Observable, of,pipe, switchMap } from 'rxjs';
import { Post } from '../models/post';
import { Topic } from '../models/topic';

@Injectable({
  providedIn: 'root'
})
export class TopicService {

  private firestore= inject(Firestore);

  private topics$:BehaviorSubject<Topic[]> = new BehaviorSubject([{id: '123', name: 'test', posts: []} as Topic]);

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
    return collectionData<Topic>(collectionRef,{idField:'id'})
  }

  getAllPosts(id:string):Observable<Post[]>{
    const collectionRef = collection(this.firestore,`topics/${id}/posts`) as CollectionReference<Post>;
    return collectionData<Post>(collectionRef,{idField:'id'})
  }

  /**
   * Method that returns the topic which match the given id
   *
   * @param id {string} the given id
   * @return A {Topic}
   */
  findOne(id: string): Observable<any> {
    // const collectionRef = docData(this.firestore,`topics`);

    const docRef = doc(this.firestore, "topics", id);
    const collectionRef = collection(this.firestore,`topics/${id}/posts`) as CollectionReference<Post>;

    return docData(docRef,{idField:'id'}).pipe(
      switchMap(topic=> collectionData(collectionRef, {idField:id}).pipe(
        map(posts=>({
          ...topic,
          posts
        }))
      ))
    );

    // return this.findAll().pipe(
    //   map((topics: Topic[]) => topics.find(t => t.id ===id) || null)
    // );

    // const topic = this.topics.find(t => t.id === id);
    // return topic ?? null;
  }

  /**
   * Add a new {Topic} to the list
   *
   * @param topic {Topic}, the {Topic} to add to the list
   */
  create(topic: Topic): void {
    // this.topics =
    const docRef = addDoc(collection(this.firestore, "topics"), topic);

  //  console.log("Document written with ID: ", docRef.id);

   // this.topics$.next(this.topics$.value.concat(topic));
  }

  /**
   * Remove a {Topic} from the list
   *
   * @param topic {Topic}, the {Topic} to remove from the list
   */
  delete(topic: Topic): void {

    deleteDoc(doc(this.firestore, "topics", topic.id));
    // this.topics$.next(this.topics$.value.filter(t => t.id !== topic.id));
    // this.topics = this.topics.filter(t => t.id !== topic.id);
  }

  /**
   * Add a new {Post} to the list of {Post} of the {Topic} that match the given topicId
   *
   * @param topicId {string}, the id of the {Topic} we want to add the new {Post}
   * @param post {Post}, the new {Post} to add
   */
  createPost(topicId: string, post: Post) {
    // this.topics$.next(this.topics$.findIndex(t$ => t$.id === topicId);)
    const topicIndex = this.topics$.value.findIndex(t$ => t$.id === topicId);


    console.log(topicIndex);
    setDoc(doc(this.firestore, "topics", topicId), post);
    if(topicIndex > -1) {

      // this.topics$.next(this.topics$.value[topicIndex]?.posts.concat(post))
      // this.topics[topicIndex].posts = this.topics[topicIndex]?.posts.concat(post);

      // this.topics$.value[topicIndex].posts = this.topics$.value[topicIndex]?.posts.concat(post);

      // this.topics$.next(this.topics$.value);

    }
  }

  /**
   * Remove a {Post} from the list of {Post} of the {Topic} that match the given topicId
   *
   * @param topicId {string}, the id of the {Topic} we want to remove the {Post}
   * @param post {Post}, the {Post} to remove
   */
  deletePost(topicId: string, post: Post): void {
    // const topicIndex = this.topics.findIndex(t => t.id === topicId);
    // if(topicIndex > -1) {
    //   this.topics[topicIndex].posts = this.topics[topicIndex]?.posts.filter(p => p.id !== post.id);
    // }
  }
}

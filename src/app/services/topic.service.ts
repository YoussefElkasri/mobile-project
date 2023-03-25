import { inject, Injectable } from '@angular/core';
import { Firestore, collection, collectionData, doc, docData, addDoc , deleteDoc, CollectionReference, query, where, getDocs , updateDoc} from '@angular/fire/firestore';
import { BehaviorSubject, map, Observable, switchMap } from 'rxjs';
import { Post } from '../models/post';
import { Topic } from '../models/topic';
import { User } from '../models/user';
import { AuthService } from './auth.service';
import { Notif } from '../models/notification';
import { Invitation } from '../models/invitation';
import { Invite } from '../models/invite';

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
    let uid= this.authService.getAuth()?.uid;
    return collectionData<Topic>(query(collectionRef, where("creator", "==", uid)));
   // return collectionData<Topic>(collectionRef, {idField:'id'});
  }

  getTopicsForReadInvited():Observable<Topic[]>{
    const collectionRef = collection(this.firestore,`topics`) as CollectionReference<Topic>;
    let email= this.authService.getAuth()?.email;
    return collectionData<Topic>(query(collectionRef, where("invitesRead", "array-contains", email)));
    //.where("members", "array-contains", { accountId: "qgZ564nfEaNP3Nt4cW1K3jCeVlY2", approved: true })
   // return collectionData<Topic>(collectionRef, {idField:'id'});
  }

  getTopicsForWriteInvited():Observable<Topic[]>{
    const collectionRef = collection(this.firestore,"topics") as CollectionReference<Topic>;
    let email= this.authService.getAuth()?.email;
    return collectionData<Topic>(query(collectionRef, where("invitesWrite", "array-contains", email)));
  }

  getAllPosts(id:string):Observable<Post[]>{
    const collectionRef = collection(this.firestore,`topics/${id}/posts`) as CollectionReference<Post>;
    return collectionData<Post>(collectionRef, {idField:'id'});
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
      switchMap(topic=> collectionData(collectionRef, {idField:'id'}).pipe(
        map(posts=>({
          ...topic,
          posts
        }))
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

    let invites:string[]=[];
    let read:string[]=[]
    let write:string[]=[]
    topic.invites.forEach(invite=>{
      //invites.push(invite.email);
      if(invite.right == "read"){
        read.push(invite.email);
      }
      else if(invite.right == "write"){
        write.push(invite.email);
      }
    });

    const docRef = addDoc(collection(this.firestore, "topics"),{name:topic.name,creator:topic.creator,invitesRead:read,invitesWrite:write});

     docRef.then(docTopic=>{
      const docRef = doc(this.firestore, "topics", docTopic.id);
      updateDoc(docRef , {id:docTopic.id});
      topic.invites.forEach(invite=>{
        //if(collectionRef != null) {
          //invite.accepted=false;
         // const docRef = addDoc(collectionRef, invite);
          this.sendInvitation(invite.email,docTopic.id,topic.name);
      //  }
      })

     });
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

  async getUserByEmail(email:string){
    // Create a query to search for documents with a specific field value
    const collectionRef = collection(this.firestore,`users`) as CollectionReference<User>;
    const q = query(collectionRef, where("email", "==", email));
    const querySnapshot = await getDocs(q);
    return querySnapshot;
  }


  async sendInvitation(email:string,topicId:string,topicName:string){
    // Get a Firestore reference
  const db = this.firestore;

// Get a reference to the document that you want to update
    let docRef= this.getUserByEmail(email);
    (await this.getUserByEmail(email)).forEach((document) => {
        //const docRef = doc(this.firestore, "users", document.id);
        const collectionRef = collection(this.firestore,`invitations`) as CollectionReference<Invitation>;
        const docInvitationRef = addDoc(collectionRef, {userId:document.id,topicId:topicId,accepted:false});
        //updateDoc(docRef , {invitation:{topicId:topicId, topicName:topicName, accepted:false}});
       let notification!: Notif;
        docInvitationRef.then(invitation=>{
          notification={title:"new demande",description:"you have received a new demande to joint a group of discusion !",readed:false,userId:document.id, topicName:topicName, invitationId:invitation.id};
          this.sendNotification(notification);
        })

      });
  }

  sendNotification(notification:Notif){
    const docNotificationRef = addDoc(collection(this.firestore, "notifications"), notification);
    docNotificationRef.then(notif=>{
      const docRef = doc(this.firestore, "notifications", notif.id);
      updateDoc(docRef , {id:notif.id});
    });

  }

   getNotificationForUser(idUserDoc:string){
    const collectionRef = collection(this.firestore,`notifications`) as CollectionReference<Notif>;
    return collectionData<Notif>(query(collectionRef, where("userId", "==", idUserDoc)));

    //const q = query(collectionRef, where("userId", "==", idUserDoc));
    // const querySnapshot =  getDocs(q);
    // querySnapshot.forEach(document=>{
    //   console.log(document.data());
    // })
  }

  deleteNotification(id:string){
    const docRef = doc(this.firestore, `notifications/${id}`);
    if(docRef != null) {
      deleteDoc(docRef);
    }
  }

  acceptInvitation(invitationId:string){
    const docRef = doc(this.firestore, "invitations", invitationId);
    updateDoc(docRef , {accepted:true});
  }

  markReadOnNotification(notificationId:string){
    const docRef = doc(this.firestore, "notifications", notificationId);
    if(docRef != null){
      updateDoc(docRef , {readed:true});
    }

  }

  getInvitation(topicId:string){
    const collectionRef = collection(this.firestore,`invitations`) as CollectionReference<Invitation>;
    return collectionData<Invitation>(query(collectionRef, where("topicId", "==", topicId)));
  }

  // getInvitation(invitationId:string){
  //   const docRef = doc(this.firestore, "topics", invitationId);
  //   return collectionData<Notif>(query(collectionRef, where("object.id", "==", idUserDoc)));
  // }

}

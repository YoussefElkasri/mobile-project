import { User } from 'src/app/models/user';
import { AuthService } from 'src/app/services/auth.service';
import { CommonModule, NgFor } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { IonicModule, ModalController } from '@ionic/angular';
import { EMPTY, Observable, map } from 'rxjs';
import { Post } from 'src/app/models/post';
import { Topic } from 'src/app/models/topic';
import { TopicService } from 'src/app/services/topic.service';
import { CreatePostComponent } from './modals/create-post/create-post.component';

@Component({
  selector: 'app-topic-details',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule,
    CreatePostComponent,
    NgFor
  ],
  template: `
  <ng-container *ngIf="topic$ | async as topic$">
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-button fill="clear" color="primary" [routerLink]="['/']">
            <ion-icon name="arrow-back-outline"></ion-icon>
          </ion-button>
        </ion-buttons>
        <ion-title>{{topic$?.name}}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <ion-list>
        <ion-item *ngFor="let post of topic$?.posts" class="message">
          <ion-avatar slot="start">
            <ion-img src="{{post.profileLink}}" />
          </ion-avatar>
          <div class="messageInfo" (click)="open(post.author, topic$, post)">
            <ion-label class="messageHeader" shape="round" slot="start">
              {{ post.username }}
              {{ this.timestampToDate(post.dateTime) }}
            </ion-label>
            <ion-label>{{ post.message }}</ion-label>
          </div>

        </ion-item>
      </ion-list>
      <ion-modal #modal isOpen={{isOpen}} [initialBreakpoint]="0.17" (willDismiss)="isOpen=false" >
        <ng-template>
          <ion-content>
            <ion-list>
              <ion-item *ngIf="this.user !== null && this.auhtorOfModalOpening === this.user.uid"
              (click)="editPost()">
                <ion-icon name="create-outline" slot="start"></ion-icon>
                <ion-label>
                  edit
                </ion-label>
              </ion-item>
              <ion-item *ngIf="this.user !== null && (this.auhtorOfModalOpening === this.user.uid || this.user.uid ===  this.topic$.creator)"
              (click)="deletePost()">
                <ion-icon name="trash-outline" slot="start"></ion-icon>
                <ion-label>
                  delete
                </ion-label>
              </ion-item>
            </ion-list>
          </ion-content>
        </ng-template>
      </ion-modal>
    </ion-content>

  <ion-item vertical="bottom" *ngIf="this.user && !topic$.invitesRead.includes(this.user.email)" >
      <ion-input [(ngModel)]="message" placeholder="Say hello !"></ion-input>
      <ion-fab-button size="small" (click)="sendMessage()">
        <ion-icon name="send" size="small" ></ion-icon>
      </ion-fab-button>
    </ion-item>

</ng-container>


`,
  styles: [`
    .message {
      /* .messageInfo {
      text-align: right;
      flex-direction: row-reverse;
      }

      .input-wrapper {
        flex-direction: row-reverse;
      } */
      .messageHeader {
        font-size: 12px;
        margin-bottom: 14px;
      }
    }

    .messageInfo {
      ion-button {
        font-size: 7px;
        width: 13px;
        padding-left: 0px;
        padding-right: 0px;
      }
    }

    `],
})
export class TopicDetailsPage implements OnInit {

  isOpen = false;
  auhtorOfModalOpening: string = '';
  postModalOpening: Post | null = null;
  editMessage = false;

  topicId: string | null = null;
  topic$: Observable<Topic | null> = EMPTY;

  private topicService = inject(TopicService);
  private modalCtrl = inject(ModalController);
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);

  user: User | null = null;
  message: string = '';

  /**
   * Fetch all the current topic according to the topicId during the ngOnInit hook
   */
  ngOnInit(): void {
    this.topicId = this.route.snapshot.params['topicId'];
    this.topic$ = this.topicService.findOne(this.topicId as string);
    this.user = this.authService.getUser();
  }

  /**
   * Method made to delete the given {Topic} and fetch the new list
   *
   * @param topic {Topic} the {Topic} to delete
   */
  delete(topic: Topic, post: Post): void {
    this.topicService.deletePost(topic.id, post);
  }

  /**
   * Method made to open the {CreateTopicComponent} in order to create a new {Topic}.
   *  - If the {CreateTopicComponent} is closed with the role `confirmed`,
   *  it creates a new Topic with the returned data and fetch the new list.
   *  - If the {CreateTopicComponent} is closed with the role `canceled`,
   *  it does nothing.
   */
  async openCreatePostModal(): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: CreatePostComponent,
    });
    modal.present();

    const { data, role } = await modal.onWillDismiss();

    if (role === 'confirmed') {
      this._addPost(data);
    }
  }

  sendMessage(): void {
    if(!this.editMessage){
      const message = {
        message: this.message,
        author: this.user?.uid ?? '',
        username: this.user?.username ?? '',
        profileLink: this.user?.profileLink,
        dateTime: Date.now()
      };


      this.topicService.createPost(this.topicId as string, message as Post);
      this.message = '';
    }
    else {
      if(this.postModalOpening !== null){
        this.postModalOpening.message = this.message;
        this.topicService.updatePost(this.topicId as string, this.postModalOpening as Post);
        this.message = '';
        this.editMessage = false;
      }
    }

  }

  /**
   * @private method to create a new {Post}
   *
   * @param post {Post} the {Post} to add to the {Post} list in the current {Topic}
   */
  private async _addPost(post: Post): Promise<void> {
    try {
      this.topicService.createPost(this.topicId as string, post);

      // const toast = await this.toastController.create({
      //   message: `Post ${post.name} successfully added`,
      //   duration: 1500,
      //   position: 'bottom',
      //   color: 'success'
      // });

      // await toast.present();
    } catch (e) {
      // const toast = await this.toastController.create({
      //   message: `Failed adding Post ${post.name}`,
      //   duration: 1500,
      //   position: 'bottom',
      //   color: 'danger'
      // });

      // await toast.present();
    }
  }

  timestampToDate(timestamp: number) {
    var date = new Date(timestamp);

    let messageDate = '';

    if(this.isToday(date)) {
      messageDate += "today at ";
    }
    else {
      messageDate += `${date.getDate()}/${date.getMonth()}/${date.getFullYear()} at `;
    }

    messageDate += ` ${date.getHours()} : ${date.getMinutes()} `

    return messageDate;
  }

  private isToday(date: Date): boolean {
    const today = new Date();

    return date.getDate() == today.getDate() &&
    date.getMonth() == today.getMonth() &&
    date.getFullYear() == today.getFullYear()

  }

  open(author: string, topic: Topic, post: Post) {
    if(this.user && topic.invitesRead.includes(this.user.email))
      return;
      
    if(this.user && (this.user.uid === author || this.user.uid === topic.creator )){
      this.isOpen = true;
      this.auhtorOfModalOpening = author;
      this.postModalOpening = post;
    }
  }

  deletePost() {
    if(this.topicId !== null && this.postModalOpening !== null){
      this.topicService.deletePost(this.topicId, this.postModalOpening)
      this.isOpen = false;
    }
  }

  editPost() {
    if(this.postModalOpening !== null && this.postModalOpening.message !== undefined){
      this.isOpen = false;
      this.message = this.postModalOpening.message;
      this.editMessage = true;
    }
  }

}

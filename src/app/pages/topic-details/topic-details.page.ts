import { User } from 'src/app/models/user';
import { AuthService } from 'src/app/services/auth.service';
import { CommonModule, NgFor } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { IonicModule, ModalController, ToastController } from '@ionic/angular';
import { EMPTY, Observable, map } from 'rxjs';
import { Post } from 'src/app/models/post';
import { Topic } from 'src/app/models/topic';
import { TopicService } from 'src/app/services/topic.service';
import { CreatePostComponent } from './modals/create-post/create-post.component';
import { UsersModalComponent } from '../topic/modals/create-topic/users-modal/users-modal.component';
import { Item } from 'src/app/models/item';
import { Invite } from 'src/app/models/invite';
import { UserDetailComponent } from './modals/user-detail/user-detail.component';

@Component({
  selector: 'app-topic-details',
  standalone: true,
  template: `
  <ng-container *ngIf="topic$ | async as topic$">
  <ion-menu contentId="main-content" >
  <ion-header>
    <ion-toolbar style="background:linear-gradient(#203887, #0c437b);">
      <ion-title>Utilisateurs</ion-title>
    </ion-toolbar>
  </ion-header>
  <ion-content [fullscreen]="true" class="ion-padding">
    <ion-list>
      <ion-item *ngFor="let user of userInTopic" (click)="selectUser(user)"><ion-label>{{user.username}}</ion-label></ion-item>
    </ion-list>
  </ion-content>
</ion-menu>
    <ion-header>
    <!-- style="background-color:linear-gradient(#203887, #0c437b);" -->
      <ion-toolbar style="background:linear-gradient(#203887, #0c437b);">
        <ion-buttons slot="start">
          <ion-button fill="clear" [routerLink]="['/']">
            <ion-icon name="arrow-back-outline"></ion-icon>
          </ion-button>
        </ion-buttons>
        <ion-title>{{topic$?.name}}</ion-title>
        <ion-button (click)="addFriend()" slot="end">
          <ion-icon name="person-add-outline"></ion-icon>
        </ion-button>
        <ion-menu-button slot="end">
          <ion-icon name="people-outline"></ion-icon>
        </ion-menu-button>
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

      <ion-modal #modalFriend isOpen={{isOpenModalFirend}} [initialBreakpoint]="0.40" (willDismiss)="isOpenModalFirend=false" >
        <ng-template>
          <ion-content>
            <div class="div-share">
              <ion-list [inset]="true">
                <ion-item [button]="true" [detail]="false" id="select-users">
                  <ion-label>Share with</ion-label>
                  <div slot="end" id="selected-fruits">{{ selectedUsersText }}</div>
                </ion-item>
              </ion-list>
              <ion-modal trigger="select-users" #modal>
                <ng-template>
                  <app-users-modal
                    class="ion-page"
                    title="Share with firends !"
                    [items]="userItems"
                    [selectedItems]="selectedUsers"
                    (selectionChange)="usersSelectionChanged($event)"
                    (selectionCancel)="modal.dismiss()"
                  ></app-users-modal>
                </ng-template>
              </ion-modal>
            </div>

            <ion-button expand="block" shape="round" (click)="updateInvite()">
              Send invitations
            </ion-button>
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
  styles: [
    `
      #menu {
        ion-content {
          --ion-background-color: #0c437b;
          ion-item {
            --ion-background-color: transparent; ;
          }
        }
      }

      ion-header,
      ion-toolbar {
        --ion-background-color: #0c437b !important;
        color: white !important;
      }
      ion-item::part(native) {
        border-color: #0c437b;
        border-width: 0px 0px 1px 0px;
      }
      .message {
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
      .div-share {
        box-shadow: 0px 0px 10px 0px #0c437b;
        border-radius: 20px;
      }
    `,
  ],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule,
    CreatePostComponent,
    NgFor,
    UsersModalComponent,
  ],
})
export class TopicDetailsPage implements OnInit {
  isOpen = false;
  isOpenModalFirend = false;
  auhtorOfModalOpening: string = '';
  postModalOpening: Post | null = null;
  editMessage = false;

  selectedUsersText = 'No guest user';
  selectedUsers: string[] = [];
  userItems: Item[] = [];

  topicId: string | null = null;
  topic$: Observable<Topic | null> = EMPTY;
  topic!: Topic;
  private topicService = inject(TopicService);
  private modalCtrl = inject(ModalController);
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private toastController = inject(ToastController);

  userInTopic: User[] = [];
  user: User | null = null;
  message: string = '';

  users: User[] = [];

  /**
   * Fetch all the current topic according to the topicId during the ngOnInit hook
   */

  ngOnInit(): void {
    this.topicId = this.route.snapshot.params['topicId'];
    this.topic$ = this.topicService.findOne(this.topicId as string);
    this.user = this.authService.getUser();

    let alreadyInvit: string[] = new Array();
    this.topic$.subscribe(data=>{
      this.topic=data as Topic;
    })
    this.topicService.findOne(this.topicId as string).subscribe(async (data) => {
      data.invitesWrite.forEach((element: string) => {
        alreadyInvit.push(element);
      });

      data.invitesRead.forEach((element: string) => {
        alreadyInvit.push(element);
      });

      let userCreator = (await this.topicService.getUserById(data.creator));
      this.userInTopic=[];
      this.userInTopic.push(userCreator);
      alreadyInvit.forEach(async element=>{
        (await this.topicService.getUserByEmail(element)).forEach(document => {
          // let i = this.userInTopic.indexOf(document.data());
          // if(i == -1){
          //   this.userInTopic.push(document.data());
          // }
          let exist=false;
          if(this.userInTopic.length > 0){
            this.userInTopic.forEach(userTopic=>{
              if(userTopic.email == document.data().email){
                exist=true;
              }
            });
            if(exist == false){
              this.userInTopic.push(document.data());
            }
          }else{
            this.userInTopic.push(document.data());
          }
        }
        );
      });

      this.topicService.getAllUsers().subscribe((data_user) => {
        this.userItems=[];
        this.users = data_user;
        this.users.forEach((user) => {
          if (
            user.email != this.authService.user.email &&
            !alreadyInvit.includes(user.email)
          ) {
            this.topic$.subscribe(async data=>{
              let topic_=data as Topic;
              (await this.topicService.getUserByEmail(user.email)).forEach((document) => {
                if(topic_.creator != document.id ){
                  let exist=false;
                  this.userItems.forEach(data=>{
                    if(data.value == user.email){
                      exist = true;
                    }
                  });
                  if(exist==false){
                    this.userItems.push({ text: user.username, value: user.email });
                  }

                }
              })

            })

          }
        });
      });
    });
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
  async selectUser(user: User) {
    const modal = await this.modalCtrl.create({
      component: UserDetailComponent,
      componentProps: {
        user: user,
        topic: this.topic,
      },
    });
    modal.present();

    const { data, role } = await modal.onWillDismiss();
    if (role === 'confirmed') {
      let topic: Topic = this.topic;

      this.updateRightUser(data, this.topic, user);
      // this.jointGroup(notification.id!, notification.invitationId);
    }
  }

  sendMessage(): void {
    if (!this.editMessage) {
      const message = {
        message: this.message,
        author: this.user?.uid ?? '',
        username: this.user?.username ?? '',
        profileLink: this.user?.profileLink,
        dateTime: Date.now(),
      };

      this.topicService.createPost(this.topicId as string, message as Post);
      this.message = '';
    } else {
      if (this.postModalOpening !== null) {
        this.postModalOpening.message = this.message;
        this.topicService.updatePost(
          this.topicId as string,
          this.postModalOpening as Post
        );
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

  private async updateRightUser(
    data: any,
    topic: Topic,
    user: User
  ): Promise<void> {
    try {
      this.topicService.updateUserRight(data, topic);

      const toast = await this.toastController.create({
        message: `right of the ${user.username} successfully updated`,
        duration: 1500,
        position: 'bottom',
        color: 'success',
      });

      await toast.present();
    } catch (e) {
      const toast = await this.toastController.create({
        message: `Failed updating right of ${user.username}`,
        duration: 1500,
        position: 'bottom',
        color: 'danger',
      });
      await toast.present();
    }
  }

  timestampToDate(timestamp: number) {
    var date = new Date(timestamp);

    let messageDate = '';

    if (this.isToday(date)) {
      messageDate += 'today at ';
    } else {
      messageDate += `${date.getDate()}/${date.getMonth()}/${date.getFullYear()} at `;
    }

    messageDate += ` ${date.getHours()} : ${date.getMinutes()} `;

    return messageDate;
  }

  private isToday(date: Date): boolean {
    const today = new Date();

    return (
      date.getDate() == today.getDate() &&
      date.getMonth() == today.getMonth() &&
      date.getFullYear() == today.getFullYear()
    );
  }

  open(author: string, topic: Topic, post: Post) {
    if (this.user && topic.invitesRead.includes(this.user.email)) return;

    if (
      this.user &&
      (this.user.uid === author || this.user.uid === topic.creator)
    ) {
      this.isOpen = true;
      this.auhtorOfModalOpening = author;
      this.postModalOpening = post;
    }
  }

  deletePost() {
    if (this.topicId !== null && this.postModalOpening !== null) {
      this.topicService.deletePost(this.topicId, this.postModalOpening);
      this.isOpen = false;
    }
  }

  editPost() {
    if (
      this.postModalOpening !== null &&
      this.postModalOpening.message !== undefined
    ) {
      this.isOpen = false;
      this.message = this.postModalOpening.message;
      this.editMessage = true;
    }
  }

  addFriend() {
    this.isOpenModalFirend = true;
  }

  private formatData(data: string[]) {
    if (data.length === 1) {
      const userItem = this.userItems.find(
        (userItem) => userItem.value === data[0]
      );
      return userItem!.text;
    }

    return `${data.length} items`;
  }

  usersSelectionChanged(userItems: any[]) {
    this.selectedUsers = [];
    userItems.forEach((user) => {
      this.selectedUsers.push(user.user);
    });
    this.selectedUsersText = this.formatData(this.selectedUsers);
    let userList: any[] = [];
    userItems.forEach((user) => {
      let right = '';
      if (!user.right) {
        right = 'read';
      } else {
        right = user.right;
      }
      userList.push({ email: user.user, right: right });
    });

    this.selectedUsers = userList;
  }

  updateInvite() {
    this.topicService.getTopic(this.topicId!).then((topic) => {
      if (topic) {
        this.selectedUsers.forEach((user) => {
          (topic as Topic).invites = new Array();
          topic.invites.push(user as unknown as Invite);
        });
        this.topicService.updateTopic(topic);
        this.isOpenModalFirend = false;
      }
    });
  }
}

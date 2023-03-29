import { UpdateProfileComponent } from './modals/update-profile/update-profile.component';
import { Component, inject, OnInit } from '@angular/core';
import { IonicModule, ModalController, ToastController } from '@ionic/angular';
import { CreateTopicComponent } from 'src/app/pages/topic/modals/create-topic/create-topic.component';
import { Topic } from 'src/app/models/topic';
import { TopicService } from 'src/app/services/topic.service';
import { RouterModule } from '@angular/router';
import { NgFor } from '@angular/common';
import { BehaviorSubject, map, Observable, switchMap } from 'rxjs';
import { CommonModule } from '@angular/common';
import { AuthService } from 'src/app/services/auth.service';
import { Notif } from 'src/app/models/notification';
import { ConfirmInvitationComponent } from './modals/confirm-invitation/confirm-invitation.component';
import { User } from '@capacitor-firebase/authentication/dist/esm/definitions';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    IonicModule,
    RouterModule,
    CreateTopicComponent,
    NgFor,
    CommonModule,
  ],
  template: `
    <ion-header [translucent]="true">
      <ion-toolbar style="background:linear-gradient(#203887, #0c437b);">
        <ion-title> Topics </ion-title>
        <ion-buttons slot="primary">
          <ion-button id="auto-trigger">
            <ion-icon slot="icon-only" name="notifications-outline"></ion-icon>
            <ion-badge
              *ngIf="numberNotifications > 0"
              class="small-badge"
              color="danger"
              >{{ numberNotifications }}</ion-badge
            >
            <ion-popover trigger="auto-trigger">
              <ng-template>
                <ion-content>
                  <ion-card button id="open-modal1">
                    <div *ngFor="let notification of notifications$ | async">
                      <div
                        *ngIf="!notification.readed"
                        (click)="openNotification(notification)"
                      >
                        <ion-card-header>
                          <p
                            [class]="
                              notification.readed
                                ? 'notification-readed'
                                : 'notification-no-readed'
                            "
                          >
                            {{ notification.title }}
                          </p>
                        </ion-card-header>

                        <ion-card-content>
                          <p>{{ notification.description }}</p>
                          <p>{{ notification.date }}</p>
                        </ion-card-content>
                      </div>
                    </div>
                  </ion-card>
                </ion-content>
              </ng-template>
            </ion-popover>
          </ion-button>
          <ion-button (click)="updateProfile()">
            <ion-icon name="person-outline"></ion-icon>
          </ion-button>
          <ion-button (click)="logout()">
            <ion-icon slot="icon-only" name="log-out-outline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content [fullscreen]="true" id="main-content">
      <ion-searchbar
        search-icon="search-circle"
        (ionChange)="test($event.target)"
        placeholder="Custom Search Icon"
      ></ion-searchbar>
      <ion-list>
        <!-- Sliding item with text options on both sides -->
        <ion-item-sliding *ngFor="let topic of topics$ | async">
          <ion-item
            [routerLink]="['/topic/' + topic.id]"
            routerLinkActive="active"
            lines="none"
          >
            <ion-label>{{ topic.name }}</ion-label>
          </ion-item>

          <ion-item-options side="end">
            <ion-item-option (click)="delete(topic)" color="danger">
              <ion-icon slot="icon-only" name="trash"></ion-icon>
            </ion-item-option>
            <ion-item-option (click)="update(topic)" color="primary">
              <ion-icon slot="icon-only" name="create-outline"></ion-icon>
            </ion-item-option>
          </ion-item-options>
        </ion-item-sliding>
        <ion-item-sliding *ngFor="let topic of TopicReadinvite">
          <ion-item
            [routerLink]="['/topic/' + topic.id]"
            routerLinkActive="active"
            lines="none"
          >
            <ion-label>{{ topic.name }}</ion-label>
          </ion-item>
        </ion-item-sliding>
        <ion-item-sliding *ngFor="let topic of TopicWriteinvite">
          <ion-item
            [routerLink]="['/topic/' + topic.id]"
            routerLinkActive="active"
            lines="none"
          >
            <ion-label>{{ topic.name }}</ion-label>
          </ion-item>

          <ion-item-options side="end">
            <!-- <ion-item-option (click)="delete(topic)" color="danger">
              <ion-icon slot="icon-only" name="trash"></ion-icon>
            </ion-item-option> -->
            <ion-item-option (click)="update(topic)" color="primary">
              <ion-icon slot="icon-only" name="create-outline"></ion-icon>
            </ion-item-option>
          </ion-item-options>
        </ion-item-sliding>
      </ion-list>
      <ion-fab horizontal="end" vertical="bottom" slot="fixed">
        <ion-fab-button (click)="openCreateTopicModal()">
          <ion-icon name="add"></ion-icon>
        </ion-fab-button>
      </ion-fab>
    </ion-content>
  `,
  styles: [
    `
      ion-content {
        color: white;
      }

      ion-header,
      ion-toolbar {
        --ion-background-color: #0c437b !important;
        color: white !important;
      }
      ion-item::part(native) {
        border-color: #0c437b;
        border-width: 0px 0px 2px 0px;
      }
      #container {
        text-align: center;

        position: absolute;
        left: 0;
        right: 0;
        top: 50%;
        transform: translateY(-50%);
      }
      .mt-5 {
        margin-top: 2rem;
      }
      #container strong {
        font-size: 20px;
        line-height: 26px;
      }

      #container p {
        font-size: 16px;
        line-height: 22px;

        color: #8c8c8c;

        margin: 0;
      }

      #container a {
        text-decoration: none;
      }
      .small-badge {
        position: absolute;
        top: 0px;
        left: 10px;
        font-size: 10px;
      }

      .notification-readed {
        font-size: 16px;
        font-weight: bold;
      }

      .notification-no-readed {
        font-size: 16px;
        font-weight: bold;
      }
    `,
  ],
})
export class TopicPage implements OnInit {
  // ngOnDestroy(): void {
  //   this.subscribeUser.unsubscribe();
  // }
  // @ViewChild('modalNotif', { static: true }) modalNotif!: IonModal;

  topics$!: Observable<Topic[]>;
  topics: Topic[]=[];
  topicsInvited$!: Observable<Topic[]>;
  notifications$!: Observable<Notif[]>;
  text$: BehaviorSubject<string> = new BehaviorSubject('');
  TopicReadinvite: Topic[] = [];
  TopicWriteinvite: Topic[] = [];
  numberNotifications: number = 0;
  profileImg: string = '';
  user!:User;
  subscribeUser: any;
  private topicService = inject(TopicService);
  private authService = inject(AuthService);
  private toastController = inject(ToastController);
  private modalCtrl = inject(ModalController);

  /**
   * Fetch all the topic during the ngOnInit hook
   */
  ngOnInit(): void {
    this.topics$ = this.topicService
      .getAll()
      .pipe(
        switchMap((topics) =>
          this.text$.pipe(
            map((text) =>
              topics.filter((t: Topic) =>
                t.name.toLocaleUpperCase().includes(text.toLocaleUpperCase())
              )
            )
          )
        )
      );
      // this.topicService
      // .getAll().subscribe(data=>{
      //   console.log(data);
      //   // this.topics.forEach(topic=>{
      //   //   if()
      //   // })
      // });
    //this.topicsInvited$ = this.topicService.getTopicsForInvited();
    this.topicService.getTopicsForReadInvited().subscribe((data) => {
      this.TopicReadinvite = [];
      data.forEach((item) => {
        this.topicService.getInvitation(item.id).subscribe((res) => {
          this.TopicReadinvite=[];
          res.forEach((inv) => {
            if (
              inv.userId == this.authService.getAuth()?.uid &&
              inv.accepted == true
            ) {
              let exist=false;
              this.TopicReadinvite.forEach(data=>{
                if(data.id == item.id){
                  exist=true;
                }
              });
              if (exist == false) {
                this.TopicReadinvite.push(item);
              }
            }
          });
        });
      });
    });
    this.topicService.getTopicsForWriteInvited().subscribe((data) => {
      this.TopicWriteinvite = [];
      data.forEach((item) => {
        this.topicService.getInvitation(item.id).subscribe((res) => {
          res.forEach((inv) => {
            if (
              inv.userId == this.authService.getAuth()?.uid &&
              inv.accepted == true
            ) {
              let exist=false;
              this.TopicWriteinvite.forEach(data=>{
                if(data.id == item.id){
                  exist=true;
                }
              });
              if (exist == false) {
                this.TopicWriteinvite.push(item);
              }
            }
          });
        });
      });
    });
    this.authService.user$.subscribe((user) => {
      if (user.uid) {
        this.profileImg = user.profileLink;
        this.notifications$ = this.topicService.getNotificationForUser(
          user.uid
        );

        this.notifications$.subscribe((notifications) => {
          this.numberNotifications = 0;
          notifications.forEach((notification) => {
            if (!notification.readed) {
              this.numberNotifications++;
            }
          });
        });
      }
    });
  }

  jointGroup(notificationId: string, invitationId: string) {
    this.topicService.acceptInvitation(invitationId);
    this.topicService.deleteNotification(notificationId);
  }

  markReadOnNotification(notificationId: string) {
    this.topicService.markReadOnNotification(notificationId);
  }

  async openNotification(notification: Notif) {
    const modal = await this.modalCtrl.create({
      component: ConfirmInvitationComponent,
      componentProps: {
        notification: notification,
      },
    });
    modal.present();

    const { data, role } = await modal.onWillDismiss();
    if (role === 'confirmed') {
      this.jointGroup(notification.id!, notification.invitationId);
    } else if (role === 'canceled') {
      this.markReadOnNotification(notification.id!);
    }
  }

  test(event: any) {
    this.text$.next(event.value.toString());
  }

  logout() {
    this.authService.SignOut();
  }

  async updateProfile() {
    let _user = this.authService.getUser();
    const modal = await this.modalCtrl.create({
      component: UpdateProfileComponent,
      componentProps: {
        user: _user,
      },
    });
    modal.present();

    const { data, role } = await modal.onWillDismiss();
    if (role === 'confirmed') {
      _user.profileLink = data.profileLink;
      _user.username = data.username;
      this._updateProfile(_user);
    }
  }

  private async _updateProfile(user: any): Promise<void> {
    try {
      this.topicService.updateUser(user);

      const toast = await this.toastController.create({
        message: `Your account successfully updated`,
        duration: 1500,
        position: 'bottom',
        color: 'success',
      });

      await toast.present();
    } catch (e) {
      const toast = await this.toastController.create({
        message: `Failed updating profile`,
        duration: 1500,
        position: 'bottom',
        color: 'danger',
      });

      await toast.present();
    }
  }
  /**
   * Method made to delete the given {Topic} and fetch the new list
   *
   * @param topic {Topic} the {Topic} to delete
   */
  delete(topic: Topic): void {
    this.topicService.delete(topic);
  }

  async update(topic: Topic) {
    let canRename = false;
    topic.invitesWrite.forEach((item) => {
      if (item == this.authService.getAuth()?.email) {
        canRename = true;
      }
    });
    if (topic.creator == this.authService.getAuth()?.uid) {
      const modal = await this.modalCtrl.create({
        component: CreateTopicComponent,
        componentProps: {
          creator: true,
          topic: topic,
        },
      });
      modal.present();
      const { data, role } = await modal.onWillDismiss();

      if (role === 'confirmed') {
        this._updateTopic(data);
      }
    } else if (canRename) {
      const modal = await this.modalCtrl.create({
        component: CreateTopicComponent,
        componentProps: {
          creator: false,
          topic: topic,
        },
      });
      modal.present();

      const { data, role } = await modal.onWillDismiss();
      if (role === 'confirmed') {
        this._renameTopic(data);
      }
    }
  }

  /**
   * Method made to open the {CreateTopicComponent} in order to create a new {Topic}.
   *  - If the {CreateTopicComponent} is closed with the role `confirmed`,
   *  it creates a new Topic with the returned data and fetch the new list.
   *  - If the {CreateTopicComponent} is closed with the role `canceled`,
   *  it does nothing.
   */
  async openCreateTopicModal(): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: CreateTopicComponent,
    });
    modal.present();

    const { data, role } = await modal.onWillDismiss();

    if (role === 'confirmed') {
      this._createTopic(data);
    }
  }

  /**
   * @private method to create a new {Topic}
   *
   * @param topic {Topic} the {Topic} to add to the list
   */
  private async _createTopic(topic: Topic): Promise<void> {
    try {
      this.topicService.create(topic);

      const toast = await this.toastController.create({
        message: `Topic ${topic.name} successfully created`,
        duration: 1500,
        position: 'bottom',
        color: 'success',
      });

      await toast.present();
    } catch (e) {
      const toast = await this.toastController.create({
        message: `Failed creating Topic ${topic.name}`,
        duration: 1500,
        position: 'bottom',
        color: 'danger',
      });

      await toast.present();
    }
  }

  private async _updateTopic(topic: Topic): Promise<void> {
    try {
      this.topicService.updateTopic(topic);

      const toast = await this.toastController.create({
        message: `Topic ${topic.name} successfully updated`,
        duration: 1500,
        position: 'bottom',
        color: 'success',
      });

      await toast.present();
    } catch (e) {
      const toast = await this.toastController.create({
        message: `Failed updating Topic ${topic.name}`,
        duration: 1500,
        position: 'bottom',
        color: 'danger',
      });

      await toast.present();
    }
  }

  private async _renameTopic(topic: Topic): Promise<void> {
    try {
      this.topicService.renameTopic(topic);

      const toast = await this.toastController.create({
        message: `Topic ${topic.name} successfully renamed`,
        duration: 1500,
        position: 'bottom',
        color: 'success',
      });

      await toast.present();
    } catch (e) {
      const toast = await this.toastController.create({
        message: `Failed renaming Topic ${topic.name}`,
        duration: 1500,
        position: 'bottom',
        color: 'danger',
      });

      await toast.present();
    }
  }
}

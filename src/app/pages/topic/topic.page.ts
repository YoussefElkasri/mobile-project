import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { IonicModule, IonModal, ModalController, ToastController } from '@ionic/angular';
import { CreateTopicComponent } from 'src/app/pages/topic/modals/create-topic/create-topic.component';
import { Topic } from 'src/app/models/topic';
import { TopicService } from 'src/app/services/topic.service';
import { RouterModule } from '@angular/router';
import { NgFor } from '@angular/common';
import { BehaviorSubject, filter, map, Observable, switchMap } from 'rxjs';
import { CommonModule } from '@angular/common';
import { UsersModalComponent } from './modals/create-topic/users-modal/users-modal.component';
import { AuthService } from 'src/app/services/auth.service';
import { Notif } from 'src/app/models/notification';
import { Invite } from 'src/app/models/invite';
import { ConfirmInvitationComponent } from './modals/confirm-invitation/confirm-invitation.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [IonicModule, RouterModule, CreateTopicComponent, NgFor,CommonModule],
  template: `
  <ion-header [translucent]="true">
  <ion-toolbar>
    <ion-title>
      Topics
    </ion-title>
    <ion-buttons slot="primary">
      <ion-button id="auto-trigger">
        <ion-icon slot="icon-only" name="notifications-outline" ></ion-icon>
        <ion-badge *ngIf="numberNotifications>0" class="small-badge" color="danger">{{numberNotifications}}</ion-badge>
        <ion-popover trigger="auto-trigger" >
        <ng-template>
          <ion-content>
          <!-- <ion-list>
            <ion-item  *ngFor="let notification of notifications$ | async" button>
              <ion-avatar slot="start">
                <img alt="Silhouette of a person's head" src="https://ionicframework.com/docs/img/demos/avatar.svg" />
              </ion-avatar>
              <ion-label>
                <h3 class="title">{{notification.title}}</h3>
                <p class="description">{{notification.description}}</p>
                <p class="date">{{notification.date}}</p>
              </ion-label>
            </ion-item>
          </ion-list> -->

            <ion-card  button id="open-modal1">
              <div *ngFor="let notification of notifications$ | async">

              <div *ngIf="!notification.readed" (click)="openNotification(notification)">
                <ion-card-header >
                  <p [class]="notification.readed ? 'notification-readed' : 'notification-no-readed'" >{{notification.title}}</p>
                </ion-card-header>

                <ion-card-content >
                  <p>{{notification.description}}</p>
                  <p>{{notification.date}}</p>
                </ion-card-content>
              </div>
            </div>
            </ion-card>
          </ion-content>
        </ng-template>
      </ion-popover>
      </ion-button>
    </ion-buttons>
      <!-- <ion-icon slot="end" name="notifications-outline">
      </ion-icon>
      <ion-badge color="danger">1</ion-badge> -->
  </ion-toolbar>
</ion-header>

<ion-content [fullscreen]="true">
<ion-searchbar search-icon="search-circle" (ionChange)="test($event.target)" placeholder="Custom Search Icon"></ion-searchbar>
  <ion-list>
    <!-- Sliding item with text options on both sides -->
    <ion-item-sliding *ngFor="let topic of topics$ | async">
      <ion-item [routerLink]="['/topic/' + topic.id ]" routerLinkActive="active" lines="none">
        <ion-label>{{ topic.name }}</ion-label>
      </ion-item>

      <ion-item-options side="end">
        <ion-item-option (click)="delete(topic)" color="danger">
          <ion-icon slot="icon-only" name="trash"></ion-icon>
        </ion-item-option>
      </ion-item-options>
    </ion-item-sliding>
    <ion-item-sliding *ngFor="let topic of TopicReadinvite">
      <ion-item [routerLink]="['/topic/' + topic.id ]" routerLinkActive="active" lines="none">
        <ion-label>{{ topic.name }}</ion-label>
      </ion-item>

      <ion-item-options side="end">
        <ion-item-option (click)="delete(topic)" color="danger">
          <ion-icon slot="icon-only" name="trash"></ion-icon>
        </ion-item-option>
      </ion-item-options>
    </ion-item-sliding>
    <ion-item-sliding *ngFor="let topic of TopicWriteinvite">
      <ion-item [routerLink]="['/topic/' + topic.id ]" routerLinkActive="active" lines="none">
        <ion-label>{{ topic.name }}</ion-label>
      </ion-item>

      <ion-item-options side="end">
        <ion-item-option (click)="delete(topic)" color="danger">
          <ion-icon slot="icon-only" name="trash"></ion-icon>
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
  styles: [`
  #container {
  text-align: center;

  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
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
.small-badge{
  position: absolute;
    top: 0px;
    left: 10px;
    font-size: 10px;
}

.notification-readed{
  font-size:16px;
  font-weight:bold;
}

.notification-no-readed{
  font-size:16px;
  font-weight:bold;
}
ion-item::part(native) {
  /* background: #19422d;
  color: #fff; */
}

ion-item::part(detail-icon) {
  color: white;
  opacity: 1;
  font-size: 20px;
}
  `],
})
export class TopicPage implements OnInit {
  // @ViewChild('modalNotif', { static: true }) modalNotif!: IonModal;

  presentingElement:any;
  topics$!: Observable<Topic[]>;
  topicsInvited$!: Observable<Topic[]>;
  notifications$!: Observable<Notif[]>;
  text$:BehaviorSubject<string>=new BehaviorSubject('');
  TopicReadinvite:Topic[]=[];
  TopicWriteinvite:Topic[]=[];
  numberNotifications:number=0;
  private topicService = inject(TopicService);
  private authService = inject(AuthService);
  private toastController = inject(ToastController);
  private modalCtrl = inject(ModalController);

  /**
   * Fetch all the topic during the ngOnInit hook
   */
  ngOnInit(): void {
    this.topics$ = this.topicService.getAll().pipe(
      switchMap(topics=>this.text$.pipe(
        map(text=>topics.filter((t:Topic)=>t.name.toLocaleUpperCase().includes(text.toLocaleUpperCase())))
      ))
    );
    //this.topicsInvited$ = this.topicService.getTopicsForInvited();
    this.topicService.getTopicsForReadInvited().subscribe(data=>{
      this.TopicReadinvite=[];
      data.forEach(item=>{
        this.topicService.getInvitation(item.id).subscribe(res=>{
          res.forEach(inv=>{
            if(inv.userId == this.authService.getAuth()?.uid && inv.accepted == true){
              let i = this.TopicReadinvite.indexOf(item);
              if(i == -1){
                this.TopicReadinvite.push(item);
              }

            }
          })
        });
      })
    });
    this.topicService.getTopicsForWriteInvited().subscribe(data=>{
      this.TopicWriteinvite=[];
      data.forEach(item=>{
        this.topicService.getInvitation(item.id).subscribe(res=>{
          res.forEach(inv=>{
            if(inv.userId == this.authService.getAuth()?.uid && inv.accepted == true){
              let i = this.TopicWriteinvite.indexOf(item);
              if(i == -1){
                this.TopicWriteinvite.push(item);
              }

            }
          })
        });
      })
    });
    this.authService.user$.subscribe(user => {
      if(user.uid){
        this.notifications$= this.topicService.getNotificationForUser(user.uid);

        this.notifications$.subscribe(notifications=>{
          this.numberNotifications=0;
          notifications.forEach(notification=>{
            if(!notification.readed){
              this.numberNotifications++;
            }
          })
        })
        this.presentingElement = document.querySelector('.ion-page');
      }
    });

  }

  jointGroup(notificationId:string,invitationId:string){
    this.topicService.acceptInvitation(invitationId);
    this.topicService.deleteNotification(notificationId);
  }

  markReadOnNotification(notificationId:string){
    this.topicService.markReadOnNotification(notificationId);
  }

  async openNotification(notification:Notif){
    const modal = await this.modalCtrl.create({
      component: ConfirmInvitationComponent,
      componentProps: {
        notification: notification,
      }
    });
    modal.present();

    const { data, role } = await modal.onWillDismiss();
    if (role === 'confirmed') {
      this.jointGroup(notification.id!,notification.invitationId);
    }else if(role === 'canceled'){
      this.markReadOnNotification(notification.id!);
    }
  }

  test(event:any){
    this.text$.next(event.value.toString())
  }

  // cancelModal(){
  //   this.topicService.markReadOnNotification(notificationId);
  //   this.modal.dismiss();
  // }

  /**
   * Method made to delete the given {Topic} and fetch the new list
   *
   * @param topic {Topic} the {Topic} to delete
   */
  delete(topic: Topic): void {
    this.topicService.delete(topic);
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
        color: 'success'
      });

      await toast.present();
    } catch (e) {
      const toast = await this.toastController.create({
        message: `Failed creating Topic ${topic.name}`,
        duration: 1500,
        position: 'bottom',
        color: 'danger'
      });

      await toast.present();
    }
  }
}

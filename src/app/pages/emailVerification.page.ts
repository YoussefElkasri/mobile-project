import { Component, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { IonicModule, IonModal, ModalController, ToastController } from '@ionic/angular';
import { CreateTopicComponent } from 'src/app/pages/topic/modals/create-topic/create-topic.component';
import { Topic } from 'src/app/models/topic';
import { TopicService } from 'src/app/services/topic.service';
import { RouterModule } from '@angular/router';
import { NgFor } from '@angular/common';
import { BehaviorSubject, filter, map, Observable, switchMap } from 'rxjs';
import { CommonModule } from '@angular/common';
import { AuthService } from 'src/app/services/auth.service';
import { Notif } from 'src/app/models/notification';
import { Invite } from 'src/app/models/invite';
// import { User } from '@capacitor-firebase/authentication/dist/esm/definitions';
import { VerificationEmailService } from '../services/verificationEmail.service';

@Component({
  selector: 'app-email-verif',
  standalone: true,
  imports: [IonicModule, RouterModule, CreateTopicComponent, NgFor,CommonModule],
  template: `
  <ion-header [translucent]="true">
  <ion-toolbar>
    <ion-title>
      Email
    </ion-title>
  </ion-toolbar>
</ion-header>

<ion-content [fullscreen]="true" id="main-content">
  You have to verify your adress mail to continue !
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
.mt-5{
  margin-top:2rem;
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
export class EmailVerification implements OnInit {


  topics$!: Observable<Topic[]>;
  topicsInvited$!: Observable<Topic[]>;
  notifications$!: Observable<Notif[]>;
  text$:BehaviorSubject<string>=new BehaviorSubject('');
  TopicReadinvite:Topic[]=[];
  TopicWriteinvite:Topic[]=[];
  numberNotifications:number=0;
  profileImg:string="";
  // user!:User;
  subscribeUser:any;
  private topicService = inject(TopicService);
  private authService = inject(AuthService);
  private toastController = inject(ToastController);
  private modalCtrl = inject(ModalController);
  private verificationEmailService = inject(VerificationEmailService);

  ngOnInit(): void {
    this.verificationEmailService.sendEmailVerification(this.authService.getAuth()!,this.authService.getAuthFirestore());
  }


}

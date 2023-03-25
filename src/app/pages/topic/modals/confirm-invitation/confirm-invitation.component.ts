import { NgIf } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';
import { Notif } from 'src/app/models/notification';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, IonicModule, NgIf],
  selector: 'app-confirm-invitation',
  templateUrl: './confirm-invitation.component.html',
  styleUrls: ['./confirm-invitation.component.scss'],
})
export class ConfirmInvitationComponent implements OnInit {
  @Input()
  notification!: Notif;

  constructor(private modalController: ModalController,) { }

  ngOnInit() {
  }

  accept(){
    this.modalController.dismiss(this.notification,'confirmed');
  }

  close(){
    this.modalController.dismiss(null,'canceled');
  }

}

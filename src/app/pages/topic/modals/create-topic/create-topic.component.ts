import { NgIf } from '@angular/common';
import { Component, inject, Input, OnInit, ViewChild } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  IonicModule,
  IonModal,
  ModalController,
  NavController,
} from '@ionic/angular';
import { BehaviorSubject, map, Observable, switchMap } from 'rxjs';
import { Item } from 'src/app/models/item';
import { Topic } from 'src/app/models/topic';
import { TopicService } from 'src/app/services/topic.service';
import { UsersModalComponent } from './users-modal/users-modal.component';
import { User } from 'src/app/models/user';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-create-topic',
  standalone: true,
  imports: [ReactiveFormsModule, IonicModule, NgIf, UsersModalComponent],
  template: `
    <form [formGroup]="createTopicForm" (ngSubmit)="createTopic()" novalidate>
      <ion-header translucent>
        <ion-toolbar>
          <ion-buttons slot="start">
            <ion-button fill="clear" (click)="dismissModal(null, 'canceled')"
              >Close</ion-button
            >
          </ion-buttons>
          <ion-title>New Topic</ion-title>
          <ion-buttons slot="end">
            <ion-button
              fill="clear"
              type="submit"
              [disabled]="createTopicForm.invalid"
            >
              <ion-icon name="checkmark-outline"></ion-icon>
            </ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content fullscreen>
        <ion-item lines="full">
          <ion-label position="floating">Name</ion-label>
          <ion-input
            type="text"
            name="name"
            formControlName="name"
            required
          ></ion-input>
        </ion-item>
        <ion-text
          color="danger"
          *ngIf="controls['name'].touched && controls['name'].errors?.['required']"
        >
          <span> This field is required </span>
        </ion-text>
        <ion-text
          color="danger"
          *ngIf="controls['name'].touched && controls['name'].errors?.['minlength']"
        >
          <span> Minimum length 2 </span>
        </ion-text>

        <div *ngIf="canUpdateUsers" class="div-share">
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
      </ion-content>
    </form>
  `,
  styles: [
    `
      .div-share {
        box-shadow: 0px 0px 10px 0px #0c437b;
        border-radius: 20px;
      }

      ion-content {
        ion-content {
          color: white;
        }

        ion-header,
        ion-toolbar {
          --ion-background-color: #0c437b !important;
          color: white !important;
        }
      }
    `,
  ],
})
export class CreateTopicComponent implements OnInit {
  @ViewChild('modal', { static: true }) modal!: IonModal;
  @Input() topic!: Topic;
  @Input() creator!: boolean;

  canUpdateUsers: boolean = false;
  createTopicForm!: FormGroup;
  users: User[] = [];
  private topicService = inject(TopicService);
  private authService = inject(AuthService);
  constructor(
    private modalController: ModalController,
    private formBuilder: FormBuilder,
    public navCtrl: NavController
  ) {}

  /**
   * Getter for the {FormGroup} controls
   */
  get controls(): {
    [key: string]: AbstractControl<any, any>;
  } {
    return this.createTopicForm.controls;
  }

  /**
   * Creates the {FormGroup} during the ngOnInit hook.
   * The {FormGroup} has the given controls :
   *
   * - name: a {string}, which should be not null and has a min length of 2.
   */
  ngOnInit() {
    if (this.topic) {
      this.canUpdateUsers = this.creator;
      let invites: string[] = [];
      this.topic.invitesRead.forEach((item) => {
        if (item) {
          invites.push(item);
        }
      });
      this.topic.invitesWrite.forEach((item) => {
        if (item) {
          invites.push(item);
        }
      });
      this.createTopicForm = this.formBuilder.group({
        name: [this.topic.name, [Validators.required, Validators.minLength(2)]],
        invites: [[], [Validators.nullValidator]],
      });
      this.topicService.getAllUsers().subscribe((data) => {
        this.users = data;
        this.users.forEach((user) => {
          if (user.email != this.authService.user.email) {
            let i = invites.indexOf(user.email);
            if (i == -1) {
              this.userItems.push({ text: user.username, value: user.email });
            }
          }
        });
      });
    } else {
      this.canUpdateUsers = true;
      this.createTopicForm = this.formBuilder.group({
        name: ['', [Validators.required, Validators.minLength(2)]],
        invites: [[], [Validators.required]],
      });
      this.topicService.getAllUsers().subscribe((data) => {
        this.users = data;
        this.users.forEach((user) => {
          if (user.email != this.authService.user.email) {
            this.userItems.push({ text: user.username, value: user.email });
          }
        });
      });
    }
  }

  /**
   * Public method to dissmiss the modal
   *
   * @param topic the {Topic} to return
   * @param status the {string} of the status on how is closed the modal,
   * - it can be 'confirmed' if the modal is closed by a form submition.
   * - it can be 'canceled' if the modal is close by the close button.
   */
  dismissModal(topic: Topic | null, status: 'confirmed' | 'canceled') {
    this.modalController.dismiss(topic, status);
  }

  /**
   * Public method to create a {Topic} and call the methods that will give close the modal
   * with the status 'confirmed' and the given {Topic}
   */
  createTopic() {
    //this.createTopicForm.get("invites")?.setValue([{username:"youssef",email:"elkasri.youssef@outlook.fr"}]);
    if (this.createTopicForm.valid) {
      let topic: Topic = {
        ...this.createTopicForm.value,
      };
      if (this.topic) {
        topic.id = this.topic.id;
      }

      this.dismissModal(topic, 'confirmed');
    }
  }

  selectedUsersText = 'No guest user';
  selectedUsers: string[] = [];

  userItems: Item[] = [];

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
    this.createTopicForm.get('invites')?.setValue(userList);
    this.modal.onWillDismiss().then((data) => {
      this.modal.dismiss();
    });
  }
}

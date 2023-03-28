import { NgIf } from '@angular/common';
import { Component, inject, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';
import { Topic } from 'src/app/models/topic';
import { User } from 'src/app/models/user';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, IonicModule, NgIf],
  selector: 'app-user-detail',
  templateUrl: './user-detail.component.html',
  styleUrls: ['./user-detail.component.scss'],
})
export class UserDetailComponent implements OnInit {

  @Input() user!: User;
  @Input() topic!: Topic;

  profileLink: string |null = null;
  rightForm = new FormGroup({
    right : new FormControl('', []),
  });
  private authService = inject(AuthService);

  canUpdateRight:boolean=false;
  constructor(private modalController: ModalController,) {

  }



  ngOnInit() {
    if(this.user && this.topic){
      this.topic.invitesRead.forEach(invite=>{
        if(this.user.email == invite){
          this.rightForm.get('right')?.setValue('read');
        }
      });
      this.topic.invitesWrite.forEach(invite=>{
        if(this.user.email == invite){
          this.rightForm.get('right')?.setValue('write');
        }
      });

      if(this.authService.getUser().uid == this.topic.creator){
        this.canUpdateRight=true;
      }
      // this.registerForm.get('username')?.setValue(this.user.username);

    }
  }

  onSubmit(){
    this.modalController.dismiss({right:this.rightForm.get('right')?.value,email:this.user.email},'confirmed');
  }


  cancel() {
    this.modalController.dismiss(null,'canceled');

  }


}

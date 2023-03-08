import { CommonModule, NgFor } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { User } from 'src/app/models/user';
import { CreateTopicComponent } from '../topic/modals/create-topic/create-topic.component';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss'],
  standalone: true,
  imports: [ReactiveFormsModule, IonicModule, RouterModule, CreateTopicComponent, NgFor,CommonModule],
})
export class AuthComponent implements OnInit {

  identifiantPassError:boolean = false
  authForm!: FormGroup;
  constructor(private formBuilder: FormBuilder, private authService: AuthService, private router: Router) {
    this.authForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.minLength(2)]],
      password: ['', [Validators.required, Validators.minLength(4)]],
    });
  }


  /**
   * Getter for the {FormGroup} controls
   */
  get controls(): {
    [key: string]: AbstractControl<any, any>;
  } {
    return this.authForm.controls;
  }

  ngOnInit() {

  }

  login(){
    if (this.authForm.valid) {
      // const user: User = {
      //   ...this.authForm.value,
      // };
      console.log(this.authForm.value);
      this.authService.Onchangeauth(this.authForm.value.email,this.authForm.value.password).then(res=>{
        if(res=="error"){
          this.identifiantPassError=true;
        }else{
          this.router.navigate(['topic']);
        }
        console.log(res);
      }).catch(error=>{
        console.log(error);
      })

    }


  }

}



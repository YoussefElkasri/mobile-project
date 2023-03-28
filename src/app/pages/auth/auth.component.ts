import { CommonModule, NgFor } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { IonicModule, ToastController } from '@ionic/angular';
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

  isOpen = false;

  private toastController = inject(ToastController);

  identifiantPassError:boolean = false
  authForm!: FormGroup;
  registerForm!: FormGroup;
  constructor(private formBuilder: FormBuilder, private authService: AuthService, private router: Router) {
    this.authForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.pattern("^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,4}$")]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });

    this.registerForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.pattern("^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,4}$")]]
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

  async login(){
    if (this.authForm.valid) {
      // const user: User = {
      //   ...this.authForm.value,
      // };
      await this.authService.Onchangeauth(this.authForm.value.email,this.authForm.value.password).then(res=>{
        if(res=="error"){
          this.identifiantPassError=true;
        }else{
          if(this.authService.getAuth()?.emailVerified){
            this.router.navigate(['topic']);
          }else{
            this.router.navigate(['verifEmail']);
          }

        }
      }).catch(error=>{
        console.log(error);
      })

    }


  }

  async signInWithGoogle(){
    try {
      await this.authService.signInWithGoogle();
    } catch (_error: any) {
      console.log(_error);
      const toast = await this.toastController.create({
        message: `Failed to signIn with google`,
        duration: 1500,
        position: 'bottom',
        color: 'danger'
      });

      await toast.present();
    }

  }

  async signInWithFacebook(){
    try {
      await this.authService.signInWithFacebook();
    } catch (_error: any) {
      console.log(_error);
      const toast = await this.toastController.create({
        message: `Failed to signIn with facebook`,
        duration: 1500,
        position: 'bottom',
        color: 'danger'
      });

      await toast.present();
    }
  }

  async signInWithGithub(){
    try {
      await this.authService.signInWithGithub();
    } catch (_error: any) {
      console.log(_error);
      const toast = await this.toastController.create({
        message: `Failed to signIn with Github`,
        duration: 1500,
        position: 'bottom',
        color: 'danger'
      });

      await toast.present();
    }
  }

  accept() {
    this.authService.resetPassword(this.registerForm.value.email).
    then(
      async () => {
        const toast = await this.toastController.create({
          message: `E-mail Sent`,
          duration: 1500,
          position: 'bottom',
          color: 'succes'
        });

        await toast.present();
        this.isOpen=false;
      }
    )
    .catch(
      async () => {
        const toast = await this.toastController.create({
          message: `This email is not registered with us`,
          duration: 1500,
          position: 'bottom',
          color: 'danger'
        });

        await toast.present();
      }
    )
  }

  goBack() {
    this.isOpen = false;
  }

  openModal() {
    this.isOpen = true;
  }

}



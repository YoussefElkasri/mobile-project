import { CommonModule, NgFor } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CreateTopicComponent } from '../topic/modals/create-topic/create-topic.component';
import { AuthService } from 'src/app/services/auth.service';
import { User } from '../../models/user';

import { uploadBytes, Storage, ref, getDownloadURL } from '@angular/fire/storage';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  standalone: true,
  imports: [ReactiveFormsModule, IonicModule, RouterModule, CreateTopicComponent, NgFor,CommonModule],
})
export class RegisterComponent implements OnInit {

  profilePicturLink: string | null = null;

  registerPassError:boolean = false
  registerForm!: FormGroup;
  constructor(private formBuilder: FormBuilder, private authService: AuthService, private router: Router, private storage: Storage) {

    this.registerForm = this.formBuilder.group({
      username: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.pattern("^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,4}$")]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword:  ['', [Validators.required, Validators.minLength(6)] ]
    },
    {
      validator: this.MatchValidator('password', 'confirmPassword'),
    });
  }


  /**
   * Getter for the {FormGroup} controls
   */
  get controls(): {
    [key: string]: AbstractControl<any, any>;
  } {
    return this.registerForm.controls;
  }

  ngOnInit() {

  }

  register(){

    if(this.passwordMatchError) {
      return;
    }

    const values = this.registerForm.value;

    const user: User = {
      uid: '',
      username: values.username,
      email: values.email,
      password: values.password,
      profileLink: this.profilePicturLink != null ? this.profilePicturLink : 'https://ionicframework.com/docs/img/demos/avatar.svg'
    }

    console.log(user);

    this.authService.createUserAuth(user)
    .then( (autUser) =>{
      user.uid = autUser.user.uid;
      this.authService.addUser(user);
      this.router.navigate(['login']);
    }
    )
    .catch(error => {
      console.log(error);
      this.registerPassError = true;
    });
  }


  MatchValidator(source: string, target: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const sourceCtrl = control.get(source);
      const targetCtrl = control.get(target);

      return sourceCtrl && targetCtrl && sourceCtrl.value !== targetCtrl.value
        ? { mismatch: true }
        : null;
    };
  }

  get passwordMatchError() {
    return (
      this.registerForm.getError('mismatch') &&
      this.registerForm.get('confirmPassword')?.touched
    );
  }

  goBack() {
    this.router.navigate(['login']);
  }

  loadFile(event: any) {
    let image = document.getElementById("imagePreview");
    const storageRef = ref(this.storage, `image/${event.target.files[0].name}`);
    uploadBytes(storageRef, event.target.files[0])
    .then((snapshot) => {
      return getDownloadURL(snapshot.ref);
    })
    .then(downloadURL => {
      if(image !== null)
        image.style.backgroundImage = `url('${downloadURL}')`;
    })

  };

}



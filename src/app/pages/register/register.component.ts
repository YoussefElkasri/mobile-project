import { CommonModule, NgFor } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CreateTopicComponent } from '../topic/modals/create-topic/create-topic.component';
import { AuthService } from 'src/app/services/auth.service';
import { User } from '../../models/user';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  standalone: true,
  imports: [ReactiveFormsModule, IonicModule, RouterModule, CreateTopicComponent, NgFor,CommonModule],
})
export class RegisterComponent implements OnInit {

  registerPassError:boolean = false
  registerForm!: FormGroup;
  constructor(private formBuilder: FormBuilder, private authService: AuthService, private router: Router) {

    this.registerForm = this.formBuilder.group({
      username: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.minLength(5)]],
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

    const values = this.registerForm.value;

    const user: User = {
      uid: '',
      username: values.username,
      email: values.email,
      password: values.password,
      photoURL: '',
    }

    this.authService.createUserAuth(user)
    .then( () =>{
      this.authService.addUser(user)
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

}



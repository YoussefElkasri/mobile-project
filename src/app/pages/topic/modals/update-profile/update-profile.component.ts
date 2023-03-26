import { NgIf } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule, ModalController } from '@ionic/angular';
import { Notif } from 'src/app/models/notification';

import { uploadBytes, Storage, ref, getDownloadURL } from '@angular/fire/storage';
import { User } from 'src/app/models/user';


@Component({
  standalone: true,
  imports: [ReactiveFormsModule, IonicModule, NgIf],
  selector: 'app-update-profile',
  templateUrl: './update-profile.component.html',
  styleUrls: ['./update-profile.component.scss'],
})
export class UpdateProfileComponent implements OnInit {
  @Input() user!: User;

  registerForm!: FormGroup;

  profileLink: string |null = null;

  constructor(private modalController: ModalController, private formBuilder: FormBuilder, private router: Router, private storage: Storage) {
    this.registerForm = this.formBuilder.group({
      username: ['', [Validators.required, Validators.minLength(2)]]
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

  accept(){
    this.modalController.dismiss({username: this.registerForm.value.username, profileLink: this.profileLink !== null ? this.profileLink : this.user.profileLink },'confirmed');
  }


  goBack() {
    this.modalController.dismiss(null,'canceled');

  }


  loadFile(event: any) {
    let image = document.getElementById("imagePreview");
    const storageRef = ref(this.storage, `image/${event.target.files[0].name}`);
    uploadBytes(storageRef, event.target.files[0])
    .then((snapshot) => {
      return getDownloadURL(snapshot.ref);
    })
    .then(downloadURL => {
      if(image !== null){
        this.profileLink = downloadURL;
        image.style.backgroundImage = `url('${downloadURL}')`;
      }
    })

  };

}

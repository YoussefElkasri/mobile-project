import { inject, Injectable } from "@angular/core";
import { Auth, onAuthStateChanged, sendEmailVerification, User } from "@angular/fire/auth";
import { doc, docData, Firestore, updateDoc } from "@angular/fire/firestore";
import { Router } from "@angular/router";
import { Observable } from "rxjs";
import { AuthService } from "./auth.service";

@Injectable({
  providedIn: 'root'
})
export class VerificationEmailService {

  private firestore= inject(Firestore);
  constructor(private router: Router) { }

  async sendEmailVerification(user:User,auth:Auth){
    try {
      await sendEmailVerification(user);

      this.waitForEmailVerification(auth);


      // do something else here if needed
    } catch (error) {
      console.log('Error sending email verification:', error);
    }
  }

  async waitForEmailVerification(auth:Auth) {
    if (auth.currentUser) {
      if (!auth.currentUser.emailVerified) {
        await auth.currentUser.reload();
        await new Promise(resolve => setTimeout(resolve, 1000)); // wait for 1 second
        await this.waitForEmailVerification(auth); // recursively call the function until email is verified
      }else{
        console.log(auth.currentUser.emailVerified);
        const docRef = doc(this.firestore, "users", auth.currentUser.uid);
        updateDoc(docRef , {emailVerified:true});
        this.router.navigate(['/topic']);
      }
    }
  }

}

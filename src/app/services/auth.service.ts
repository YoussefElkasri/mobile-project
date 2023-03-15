import { inject, Injectable } from '@angular/core';
import { Firestore , doc, getDoc } from '@angular/fire/firestore';
// import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Auth , createUserWithEmailAndPassword, signInWithEmailAndPassword, getAuth, authState, onAuthStateChanged } from "@angular/fire/auth";
import { BehaviorSubject, Observable } from 'rxjs';
// import * as auth from 'firebase/auth';

import { User } from '../models/user';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import "firebase/auth";
import { FirebaseApp } from '@angular/fire/app';


@Injectable({
  providedIn: 'root'
})
export class AuthService {


  private firestore= inject(Firestore);
  private user$:BehaviorSubject<User> = new BehaviorSubject({} as User);
  user!:User;
  constructor(public auth: Auth,public router: Router,) { }


  Onchangeauth(email: string, password: string){
    console.log(email,password);

    return signInWithEmailAndPassword(this.auth, email,password).then((result) => {
      console.log(result);
      return this.SetUserData(result.user);
      //return this.user$.asObservable();
      // this.router.navigate(['topic']);
    }).catch(error=>{
      console.log('error', error)
      return "error";
    });

    //return this.user$.asObservable();

    // const userAuth = getAuth();
    // console.log(userAuth);
    // this.user$.next();





  }

  // SignIn(email: string, password: string) {
  //   this.afAuth.auth().signInWithEmailAndPassword(email, password)
  //   .then(function(result) {
  //     // result.user.tenantId should be ‘TENANT_PROJECT_ID’.
  //   }).catch(function(error) {
  //     // Handle error.
  //   });

    // this.afAuth.auth().signIn(email)
    //   .then(res => {
    //     console.log('Successfully signed in!');
    //   })
    //   .catch(err => {
    //     console.log('Something is wrong:',err.message);
    //   });
  // }

  SetUserData(user: any) {
    // const userRef: AngularFirestoreDocument<any> = this.firestore.doc(
    //   `users/${user.uid}`
    // );
    const userData: User = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      emailVerified: user.emailVerified,
      username: user.username,
    };
    this.user=userData;
    this.user$.next(userData);
    console.log(userData);
  }

   // Sign out
   SignOut() {
    return this.auth.signOut().then(() => {
      localStorage.removeItem('user');
      this.router.navigate(['sign-in']);
    });
  }

  getAuthStatus():boolean {
    const user = this.auth.currentUser;
    console.log(user);
    if(user){
      return true;
    }else{
      return false;
    }

  }

  getAuth() {
    return this.auth.currentUser;

  }

}


@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private authService: AuthService,
        private router: Router) { }
    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): boolean | Promise<boolean> {
        var isAuthenticated = this.authService.getAuthStatus();
        if (!isAuthenticated) {
            this.router.navigate(['/login']);
        }
        return isAuthenticated;
    }
}

import { inject, Injectable } from '@angular/core';
import { Firestore , doc, getDoc, addDoc, collection, docData, setDoc, DocumentData } from '@angular/fire/firestore';
// import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Auth , createUserWithEmailAndPassword, signInWithEmailAndPassword, getAuth, authState, UserCredential } from "@angular/fire/auth";
import { BehaviorSubject, Observable } from 'rxjs';
// import * as auth from 'firebase/auth';

import { User } from '../models/user';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';


@Injectable({
  providedIn: 'root'
})
export class AuthService {


  private firestore= inject(Firestore);
  private user$:BehaviorSubject<User> = new BehaviorSubject({} as User);
  user!:User;
  constructor(public auth: Auth,public router: Router,) { }


  Onchangeauth(email: string, password: string){
    return signInWithEmailAndPassword(this.auth, email,password).then((result) => {
      console.log(result.user);
      return this.SetUserData(result.user);
    }).catch(error=>{
      console.log('error', error)
      return "error";
    });
  }

  SetUserData(user: any) {
    const docRef = doc(this.firestore,`users/${user.uid}`);

    const userInfo: Observable<any> = docData(docRef);

    let userData: User;

    userInfo.subscribe(
      data => {
        userData = {
          uid: user.uid,
          email: user.email,
          profileLink: data.profileLink,
          username: data.username ,
          password: ''
        };

        this.user=userData;
        this.user$.next(userData);
      }
    );
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
    if(user){
      return true;
    }else{
      return false;
    }

  }

  getAuth() {
    return this.auth.currentUser;
  }

  getUser() {
    return this.user;
  }

  createUserAuth(user: User): Promise<UserCredential> {
    return createUserWithEmailAndPassword(this.auth, user.email, user.password);
  }

  addUser(user: User): void {
    const docRefWithSet = setDoc(doc(
        this.firestore,
        "users",
        user.uid
      ),
      {username : user.username, email: user.email, profileLink: user.profileLink}
      )

    // const docRef = addDoc(collection(this.firestore, 'users'), {username : user.username, email: user.email});
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

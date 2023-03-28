import { inject, Injectable } from '@angular/core';
import { Firestore , doc, getDoc, addDoc, collection, docData, setDoc, DocumentData } from '@angular/fire/firestore';

import { Auth , createUserWithEmailAndPassword, signInWithEmailAndPassword, getAuth, authState, UserCredential, /*GoogleAuthProvider, signInWithCredential, sendEmailVerification, FacebookAuthProvider, GithubAuthProvider, */sendPasswordResetEmail } from "@angular/fire/auth";
import { BehaviorSubject, Observable } from 'rxjs';

import { User } from '../models/user';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
// import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
import { VerificationEmailService } from './verificationEmail.service';


@Injectable({
  providedIn: 'root'
})
export class AuthService {


  private firestore= inject(Firestore);
  public user$:BehaviorSubject<User> = new BehaviorSubject({} as User);
  user!:User;
  constructor(public auth: Auth, public router: Router,private verificationEmailService:VerificationEmailService) { }


  Onchangeauth(email: string, password: string){
    return signInWithEmailAndPassword(this.auth, email,password).then((result) => {
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
          password: '',
          invitations: data.invitations,
          emailVerified: user.emailVerified,
        };

        this.user=userData;
        this.user$.next(userData);
      }
    );
  }

  // Sign out
  SignOut() {
    return this.auth.signOut().then(async () => {
      // await FirebaseAuthentication.signOut();
      //localStorage.removeItem('user');
      // this.signOutWithFacebook();
      this.router.navigate(['/login']);
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

  getAuthFirestore() {
    return this.auth;
  }

  addUser(user: User): void {
    const docRefWithSet = setDoc(doc(
        this.firestore,
        "users",
        user.uid
      ),
      {username : user.username, email: user.email, profileLink: user.profileLink, emailVerified: user.emailVerified}
      )

    // const docRef = addDoc(collection(this.firestore, 'users'), {username : user.username, email: user.email});
  }

  resetPassword(email: string){
    return sendPasswordResetEmail(this.auth, email);
  }

  async signInWithGoogle(){
    // const result = await FirebaseAuthentication.signInWithGoogle();
    // const credential = GoogleAuthProvider.credential(result.credential?.idToken);
    // await signInWithCredential(getAuth(), credential);
    // //USER.value = getAuth().currentUser;
    // if(getAuth().currentUser){
    //   await this.addGoogleUser(getAuth().currentUser);
    //   this.SetUserData(getAuth().currentUser);
    // }
    // this.router.navigate(['topic']);
    // return getAuth().currentUser;
  }

  async addGoogleUser(user: any) {
    const docRefWithSet = setDoc(doc(
        this.firestore,
        "users",
        user.uid
      ),
      {username : user.displayName, email: user.email, profileLink: user.photoURL,emailVerified: user.emailVerified}
      )
  }

  async signOutWithFacebook(){
    // const credentials = FacebookAuthProvider.credential(this.acessToken);
    // const facebookAppId = '777537323890124';
    // const revokeUrl = `https://graph.facebook.com/${facebookAppId}/permissions`;
    // const response = await fetch(revokeUrl, {
    //   method: 'DELETE',
    //   body: `access_token=${credentials.accessToken}`
    // });
  }
  acessToken:any;
  async signInWithFacebook(){
    // const result = await FirebaseAuthentication.signInWithFacebook();
    // this.acessToken = FacebookAuthProvider.credential(result.credential?.accessToken!);
    // const credential = FacebookAuthProvider.credential(result.credential?.accessToken!);
    // await signInWithCredential(getAuth(), credential);
    // //USER.value = getAuth().currentUser;
    // if(getAuth().currentUser){
    //   await this.addGoogleUser(getAuth().currentUser);
    //   this.SetUserData(getAuth().currentUser);
    // }
    // this.router.navigate(['topic']);
    // return getAuth().currentUser;
  }

  async addFacebookUser(user: any) {
    const docRefWithSet = setDoc(doc(
        this.firestore,
        "users",
        user.uid
      ),
      {username : user.displayName, email: user.email, profileLink: user.photoURL,emailVerified: user.emailVerified}
      )
  }

  async signInWithGithub(){
    // await FirebaseAuthentication.signOut();
    // const result = await FirebaseAuthentication.signInWithGithub();
    // const credential = GithubAuthProvider.credential(result.credential?.accessToken!);
    // await signInWithCredential(getAuth(), credential);
    // //USER.value = getAuth().currentUser;
    // if(getAuth().currentUser){
    //   await this.addGithubUser(getAuth().currentUser);
    //   this.SetUserData(getAuth().currentUser);
    // }
    // this.router.navigate(['topic']);
    // return getAuth().currentUser;
  }
  async addGithubUser(user: any) {
    const docRefWithSet = setDoc(doc(
        this.firestore,
        "users",
        user.uid
      ),
      {username : user.displayName, email: user.email, profileLink: user.photoURL,emailVerified: user.emailVerified}
      )
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

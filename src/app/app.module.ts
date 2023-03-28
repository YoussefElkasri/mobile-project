import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { PreloadAllModules, RouteReuseStrategy, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { provideFirebaseApp, getApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth, FacebookAuthProvider} from '@angular/fire/auth';
import { environment } from 'src/environments/environment';
import { AppComponent } from './app.component';
import { routes } from './routes';
import { AuthGuard } from './services/auth.service';
import { provideStorage, getStorage } from '@angular/fire/storage';


@NgModule({
  declarations: [AppComponent],
  imports: [
    provideFirebaseApp(() => initializeApp(
      environment.firebaseConfig
     )),
    provideFirestore(() => getFirestore()),
    provideAuth(() => getAuth()),
    provideStorage((() => getStorage())),
    CommonModule,
    BrowserModule,
    IonicModule.forRoot(),
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy },AuthGuard],
  bootstrap: [AppComponent],
})

export class AppModule {}


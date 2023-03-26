import { CommonModule, NgFor } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { EMPTY, Observable } from 'rxjs';
import { Post } from 'src/app/models/post';
import { TopicService } from 'src/app/services/topic.service';

@Component({
  selector: 'app-post-details',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule,
    NgFor
  ],
  template: `
  <ng-container *ngIf="post$ | async as post$">
    <ion-header>
    <ion-toolbar>
      <ion-buttons slot="start">
        <ion-button fill="clear" [routerLink]="['/']">
          <ion-icon name="arrow-back-outline"></ion-icon>
        </ion-button>
      </ion-buttons>
      <!-- <ion-title>{{post$.name}}</ion-title> -->
    </ion-toolbar>
  </ion-header>

  <ion-content>
    <ion-label>
      <h1>Description</h1>
    </ion-label>
    <!-- <ion-label>{{ post$.description }}</ion-label> -->
  </ion-content>
</ng-container>


`,
  styles: [],
})
export class PostDetailsPage implements OnInit {

  topicId: string | null = null;
  postId: string | null = null;
  post$: Observable<Post | null> = EMPTY;

  private topicService = inject(TopicService);
  private route = inject(ActivatedRoute);

  /**
   * Fetch all the current topic according to the topicId during the ngOnInit hook
   */
  ngOnInit(): void {
    this.topicId = this.route.snapshot.params['topicId'];
    this.postId = this.route.snapshot.params['postId'];
    this.post$ = this.topicService.findOnePost(this.topicId as string, this.postId as string);
  }
}

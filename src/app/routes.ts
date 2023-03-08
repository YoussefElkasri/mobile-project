import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'topic',
    loadComponent: () => import('./pages/topic/topic.page').then( m => m.TopicPage)
  },
  {
    path: 'topic/:topicId',
    loadComponent: () => import('./pages/topic-details/topic-details.page').then( m => m.TopicDetailsPage)
  },
  {
    path: 'topic/:topicId/post/:postId',
    loadComponent: () => import('./pages/post-details/post-details.page').then( m => m.PostDetailsPage)
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/auth/auth.component').then( m => m.AuthComponent)
  },
  {
    path: '',
    redirectTo: 'topic',
    pathMatch: 'full'
  }
];
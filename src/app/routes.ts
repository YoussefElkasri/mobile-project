import { Routes } from '@angular/router';
import { AuthGuard } from './services/auth.service';

export const routes: Routes = [
  {
    path: 'topic',
    loadComponent: () => import('./pages/topic/topic.page').then( m => m.TopicPage),
    canActivate: [AuthGuard],
  },
  {
    path: 'topic/:topicId',
    loadComponent: () => import('./pages/topic-details/topic-details.page').then( m => m.TopicDetailsPage),
    canActivate: [AuthGuard],
  },
  {
    path: 'topic/:topicId/post/:postId',
    loadComponent: () => import('./pages/post-details/post-details.page').then( m => m.PostDetailsPage),
    canActivate: [AuthGuard],
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/auth/auth.component').then( m => m.AuthComponent),
    // canActivate: [AuthGuard],
  },
  {
    path: '',
    redirectTo: 'topic',
    pathMatch: 'full'
  }
];

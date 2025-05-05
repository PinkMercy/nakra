import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CommentService } from '../../services/comment.service';
import { AuthService } from '../../services/auth.service';

// NG-ZORRO imports
import { NzCommentModule } from 'ng-zorro-antd/comment';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzEmptyModule } from 'ng-zorro-antd/empty';

interface Comment {
  id: number;
  content: string;
  createdAt: string;
  userId: number;
  userFirstname: string;
  userLastname: string;
  userEmail: string;
  trainingId: number;
  likesCount: number;
  dislikesCount: number;
  likedByCurrentUser: boolean;
  dislikedByCurrentUser: boolean;
}

@Component({
  selector: 'app-comment-section',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzCommentModule,
    NzFormModule,
    NzButtonModule,
    NzInputModule,
    NzIconModule,
    NzAvatarModule,
    NzToolTipModule,
    NzPopconfirmModule,
    NzSpinModule,
    NzEmptyModule
  ],
  templateUrl: './comment-section.component.html',
  styleUrl: './comment-section.component.scss'
})
export class CommentSectionComponent implements OnInit {
  @Input() trainingId!: number;
  
  comments: Comment[] = [];
  commentForm: FormGroup;
  userId: number | null = null;
  isLoading = false;
  isSubmitting = false;
  
  constructor(
    private fb: FormBuilder,
    private commentService: CommentService,
    private authService: AuthService,
    private message: NzMessageService
  ) {
    this.commentForm = this.fb.group({
      content: ['', [Validators.required, Validators.maxLength(1000)]]
    });
  }
  
  ngOnInit(): void {
    this.userId = this.authService.getUserId();
    this.loadComments();
  }
  
  loadComments(): void {
    this.isLoading = true;
    this.commentService.getCommentsForTraining(this.trainingId, this.userId).subscribe({
      next: (data) => {
        this.comments = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading comments', err);
        this.message.error('Failed to load comments');
        this.isLoading = false;
      }
    });
  }
  
  submitComment(): void {
    if (!this.userId) {
      this.message.warning('You must be logged in to comment');
      return;
    }
    
    if (this.commentForm.valid) {
      const content = this.commentForm.get('content')?.value;
      this.isSubmitting = true;
      
      this.commentService.addComment(this.userId, this.trainingId, content).subscribe({
        next: (newComment) => {
          this.comments = [newComment, ...this.comments];
          this.commentForm.reset();
          this.isSubmitting = false;
          this.message.success('Comment added successfully');
        },
        error: (err) => {
          console.error('Error adding comment', err);
          this.message.error('Failed to add comment');
          this.isSubmitting = false;
        }
      });
    }
  }
  
  toggleLike(comment: Comment): void {
    if (!this.userId) {
      this.message.warning('You must be logged in to like comments');
      return;
    }
    
    this.commentService.toggleLike(comment.id, this.userId).subscribe({
      next: (updatedComment) => {
        // Update the comment in the array
        const index = this.comments.findIndex(c => c.id === comment.id);
        if (index !== -1) {
          this.comments[index] = updatedComment;
        }
      },
      error: (err) => {
        console.error('Error toggling like', err);
        this.message.error('Failed to update like');
      }
    });
  }
  
  toggleDislike(comment: Comment): void {
    if (!this.userId) {
      this.message.warning('You must be logged in to dislike comments');
      return;
    }
    
    this.commentService.toggleDislike(comment.id, this.userId).subscribe({
      next: (updatedComment) => {
        // Update the comment in the array
        const index = this.comments.findIndex(c => c.id === comment.id);
        if (index !== -1) {
          this.comments[index] = updatedComment;
        }
      },
      error: (err) => {
        console.error('Error toggling dislike', err);
        this.message.error('Failed to update dislike');
      }
    });
  }
  
  deleteComment(commentId: number): void {
    if (!this.userId) return;
    
    this.commentService.deleteComment(commentId, this.userId).subscribe({
      next: () => {
        this.comments = this.comments.filter(c => c.id !== commentId);
        this.message.success('Comment deleted successfully');
      },
      error: (err) => {
        console.error('Error deleting comment', err);
        this.message.error('Failed to delete comment');
      }
    });
  }
  
  getInitials(firstName: string, lastName: string): string {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`;
  }
  
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString();
  }
  
  canDeleteComment(comment: Comment): boolean {
    return this.userId === comment.userId;
  }
}
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Comment } from '../models/Comment';

@Injectable({
  providedIn: 'root'
})
export class CommentService {
  private apiUrl = 'http://localhost:8080/api/comments';
  constructor(private http: HttpClient) { }
  /**
   * Get all comments for a specific training
   * @param trainingId The ID of the training
   * @param userId The current user ID (optional)
   * @returns An observable of Comment[]
   */
  getCommentsForTraining(trainingId: number, userId: number | null): Observable<Comment[]> {
    let url = `${this.apiUrl}/training/${trainingId}`;
    if (userId){
      url += `?userId=${userId}`;
    }
    return this.http.get<Comment[]>(url);
  }
  
  /**
   * Add a new comment to a training
   * @param userId The user ID
   * @param trainingId The training ID
   * @param content The comment content
   * @returns An observable of the created Comment
   */
  addComment(userId: number, trainingId: number, content: string): Observable<Comment> {
    return this.http.post<Comment>(this.apiUrl, {
      userId,
      trainingId,
      content
    });
  }
  
  /**
   * Toggle like for a comment (like/unlike)
   * @param commentId The comment ID
   * @param userId The user ID
   * @returns An observable of the updated Comment
   */
  toggleLike(commentId: number, userId: number): Observable<Comment> {
    return this.http.post<Comment>(`${this.apiUrl}/${commentId}/like?userId=${userId}`, {});
  }
  
  /**
   * Toggle dislike for a comment (dislike/undislike)
   * @param commentId The comment ID
   * @param userId The user ID
   * @returns An observable of the updated Comment
   */
  toggleDislike(commentId: number, userId: number): Observable<Comment> {
    return this.http.post<Comment>(`${this.apiUrl}/${commentId}/dislike?userId=${userId}`, {});
  }
  
  /**
   * Delete a comment
   * @param commentId The comment ID
   * @param userId The user ID (for authorization)
   * @returns An observable of void
   */
  deleteComment(commentId: number, userId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${commentId}?userId=${userId}`);
  }
}
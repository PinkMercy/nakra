export interface Comment {
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
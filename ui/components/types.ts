export interface CommentProps {
  className?: string;
  parentId?: string;
  comment: Comment;
}

export interface Comment {
  id: string;
  author: { name: string };
  content: string;
  createdAt: string;
  replies?: Comment[];
}
export interface ReplyCommentFormData {
  content: string;
}

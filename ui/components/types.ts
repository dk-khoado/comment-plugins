export interface CommentProps {
  comment: {
    id: string;
    author: { name: string };
    content: string;
    createdAt: string;
    replies?: CommentProps["comment"][];
  };
}

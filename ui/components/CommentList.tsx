import React from "react";
import Comment from "./Comment";
import { CommentProps } from "./types";

interface CommentListProps {
  comments: CommentProps["comment"][];
}

const CommentList: React.FC<CommentListProps> = ({ comments }) => {
  return (
    <ul className="space-y-4">
      {comments.map((comment) => (
        <Comment key={comment.id} comment={comment} />
      ))}
    </ul>
  );
};

export default CommentList;

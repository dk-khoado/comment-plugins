import React, { useState } from "react";
import { CommentProps } from "./types";
import clsx from "clsx";
import ReplyForm from "./replyForm";

const generateAvatarUrl = (name: string, size = 40) => {
  const initials = name
    .split(" ")
    .map((word) => word[0])
    .join("");
  return `https://ui-avatars.com/api/?name=${initials}&size=${size}&background=random`;
};

const Comment: React.FC<CommentProps> = ({ comment, parentId }) => {
  const [showReplyForm, setShowReplyForm] = useState(false);

  const onReplySuccess = () => {
    setShowReplyForm(false);
  };

  const onReply = () => {
    setShowReplyForm(!showReplyForm);
  };
  return (
    <li
      className={clsx("bg-white p-4 rounded-lg flex items-start space-x-4", {
        "shadow-md": !parentId,
      })}
    >
      <img
        src={generateAvatarUrl(comment.author.name)}
        alt="Avatar"
        className="w-10 h-10 rounded-full"
        loading="lazy"
      />
      <div className="w-full">
        <div className="flex items-center space-x-2">
          <strong className="block text-lg font-semibold">
            {comment.author.name}
          </strong>
          <span className="text-sm text-gray-500">
            {new Date(comment.createdAt).toLocaleString()}
          </span>
        </div>
        <div className="mt-2 text-gray-600">{comment.content}</div>
        <button
          className="text-sm text-indigo-600 hover:underline"
          onClick={onReply}
        >
          Reply
        </button>
        {showReplyForm && (
          <ReplyForm
            parentId={parentId || comment.id}
            onSuccess={onReplySuccess}
          />
        )}

        {comment.replies && (
          <ul className="space-y-4 mt-4 ">
            {comment.replies.map((child) => (
              <Comment key={child.id} comment={child} parentId={comment.id} />
            ))}
          </ul>
        )}
      </div>
    </li>
  );
};

export default Comment;

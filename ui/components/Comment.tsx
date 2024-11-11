import React, { useState } from "react";
import { CommentProps } from "./types";
import { Button } from "./ui/button";

const generateAvatarUrl = (name: string, size = 40) => {
  const initials = name
    .split(" ")
    .map((word) => word[0])
    .join("");
  return `https://ui-avatars.com/api/?name=${initials}&size=${size}&background=random`;
};

const Comment: React.FC<CommentProps> = ({ comment }) => {
  const [showReplyForm, setShowReplyForm] = useState(false);

  const handleReplySubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const newReply = {
      id: Date.now().toString(),
      author: { name: formData.get("author") as string },
      content: formData.get("content") as string,
      createdAt: new Date().toISOString(),
    };
    setShowReplyForm(false);
    event.currentTarget.reset();
  };

  return (
    <li className="bg-white p-4 rounded-lg shadow-md flex items-start space-x-4">
      <img
        src={generateAvatarUrl(comment.author.name)}
        alt="Avatar"
        className="w-10 h-10 rounded-full"
        loading="lazy"
      />
      <div>
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
          onClick={() => setShowReplyForm(!showReplyForm)}
        >
          Reply
        </button>
        {showReplyForm && (
          <form className="mt-4 space-y-2" onSubmit={handleReplySubmit}>
            <input
              type="text"
              name="author"
              placeholder="Your name"
              className="w-full p-2 border border-gray-300 rounded-md"
            />
            <textarea
              name="content"
              placeholder="Your reply"
              className="w-full p-2 border border-gray-300 rounded-md"
            />
            <div className="flex justify-end">
              <Button type="submit">Reply</Button>
            </div>
          </form>
        )}
      </div>
    </li>
  );
};

export default Comment;

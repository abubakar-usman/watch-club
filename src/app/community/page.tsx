"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Heart,
  MessageCircle,
  MoreHorizontal,
  Image as ImageIcon,
  Film,
  Smile,
  ListPlus,
  X,
  Send,
} from "lucide-react";

interface CommentItem {
  id: number;
  username: string;
  avatar: string;
  text: string;
  timestamp: string;
}

interface PostItem {
  id: number;
  username: string;
  avatar: string;
  content: string;
  likes: number;
  liked: boolean;
  commentsCount: number;
  timestamp: string;
  moviePoster: string;
  commentList: CommentItem[];
}

const initialPosts: PostItem[] = [];

export default function CommunityPage() {
  const [posts, setPosts] = useState<PostItem[]>(initialPosts);
  const [newPostText, setNewPostText] = useState("");
  const [openCommentPostId, setOpenCommentPostId] = useState<number | null>(null);
  const [commentInput, setCommentInput] = useState<{ [postId: number]: string }>({});
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Create new post
  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostText.trim()) return;

    const newPost: PostItem = {
      id: Date.now(),
      username: "WatchClub Member",
      avatar: "/popcorn.png",
      content: newPostText,
      likes: 0,
      liked: false,
      commentsCount: 0,
      timestamp: "Just now",
      moviePoster: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=800&auto=format&fit=crop",
      commentList: [],
    };

    setPosts([newPost, ...posts]);
    setNewPostText("");
  };

  // Toggle Like
  const handleToggleLike = (postId: number) => {
    setPosts(
      posts.map((post) => {
        if (post.id === postId) {
          const isLiked = !post.liked;
          return {
            ...post,
            liked: isLiked,
            likes: isLiked ? post.likes + 1 : post.likes - 1,
          };
        }
        return post;
      })
    );
  };

  // Add Comment
  const handleAddComment = (postId: number) => {
    const text = commentInput[postId];
    if (!text || !text.trim()) return;

    setPosts(
      posts.map((post) => {
        if (post.id === postId) {
          const newComment: CommentItem = {
            id: Date.now(),
            username: "You",
            avatar: "/popcorn.png",
            text: text.trim(),
            timestamp: "Just now",
          };
          return {
            ...post,
            commentList: [...post.commentList, newComment],
            commentsCount: post.commentsCount + 1,
          };
        }
        return post;
      })
    );

    setCommentInput({ ...commentInput, [postId]: "" });
  };

  return (
    <main className="w-full min-h-screen bg-[#181818] text-white pb-16">
      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

        {/* 1. COMMUNITY HEADER BANNER */}
        <section
          className="relative w-full max-w-[1344px] h-[206px] rounded-[10px] overflow-hidden flex flex-col justify-center p-[54px] mx-auto"
          style={{
            backgroundImage: `url('/Frame_8.png')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 1,
          }}
        >
          <div className="relative z-10 max-w-[600px] space-y-2">
            <h1 className="text-[32px] font-bold tracking-tight uppercase text-white font-roboto">
              Community
            </h1>
            <p className="text-[#C7C7C7] text-[15px] font-medium leading-relaxed">
              Share Recommendations, Ask Questions And Talk About Your Favorite Movies And Series.
            </p>
          </div>
        </section>

        {/* 2. POST CREATION CARD */}
        <section className="bg-[#302F2F] border border-white/10 rounded-[10px] p-6 shadow-md">
          <form onSubmit={handleCreatePost} className="space-y-4">
            <input
              type="text"
              value={newPostText}
              onChange={(e) => setNewPostText(e.target.value)}
              placeholder="What's On Your Mind?"
              className="w-full bg-transparent text-white placeholder-[#C7C7C7] text-[15px] outline-none border-b border-white/10 pb-3"
            />
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-5">
                <button type="button" title="Add Image" className="hover:opacity-80 transition-opacity">
                  <img src="/icons/picupload.png" alt="Add Image" className="w-5 h-5 object-contain" />
                </button>

                <button type="button" title="Add GIF" className="hover:opacity-80 transition-opacity">
                  <img src="/icons/gif.png" alt="Add GIF" className="w-5 h-5 object-contain" />
                </button>

                <button type="button" title="Add Emoji" className="hover:opacity-80 transition-opacity">
                  <img src="/icons/smile.png" alt="Add Emoji" className="w-5 h-5 object-contain" />
                </button>

                <button type="button" title="Add List" className="hover:opacity-80 transition-opacity">
                  <img src="/icons/list.png" alt="Add List" className="w-5 h-5 object-contain" />
                </button>
              </div>

              <button
                type="submit"
                className="bg-[#E60813] hover:bg-[#c5070f] text-white font-semibold text-[14px] px-6 py-2 rounded-[8px] transition-colors"
              >
                Post
              </button>
            </div>
          </form>
        </section>

        {/* 3. DISCUSSION FEED */}
        <section className="space-y-6">
          {posts.length === 0 ? (
            <div className="bg-[#302F2F] border border-white/10 rounded-[10px] p-10 text-center text-[#C7C7C7] text-sm font-medium">
              No community posts yet. Share your thoughts above!
            </div>
          ) : (
            posts.map((post) => (
              <article
                key={post.id}
                className="bg-[#302F2F] border border-white/10 rounded-[10px] p-6 shadow-md flex flex-col gap-4"
              >
                {/* Header: User avatar, Username, Timestamp, Options */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-[40px] h-[40px] rounded-full overflow-hidden border border-white/10 relative shrink-0">
                      <Image
                        src={post.avatar}
                        alt={post.username}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="text-white text-[15px] font-semibold leading-snug">{post.username}</h3>
                      <span className="text-[#C7C7C7] text-[12px]">{post.timestamp}</span>
                    </div>
                  </div>

                  <button className="text-[#C7C7C7]">
                    <MoreHorizontal size={20} />
                  </button>
                </div>

                {/* Main Content & Movie Poster Row */}
                <div className="flex items-start justify-between gap-6 max-[768px]:flex-col">
                  <p className="text-white text-[15px] font-normal leading-relaxed flex-1 pt-1">
                    {post.content}
                  </p>

                  {/* Clickable Movie Poster Thumbnail */}
                  {post.moviePoster && (
                    <div
                      onClick={() => setPreviewImage(post.moviePoster)}
                      className="relative w-[220px] h-[124px] rounded-[10px] overflow-hidden shrink-0 border border-white/10 cursor-pointer shadow-md"
                    >
                      <Image
                        src={post.moviePoster}
                        alt="Movie Preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                </div>

                {/* Action Bar: Likes & Comments */}
                <div className="flex items-center gap-6 pt-2 border-t border-white/5">
                  <button
                    onClick={() => handleToggleLike(post.id)}
                    className={`flex items-center gap-2 text-[14px] font-medium ${post.liked ? "text-[#E60813]" : "text-[#C7C7C7]"
                      }`}
                  >
                    <Heart size={18} className={post.liked ? "fill-[#E60813]" : ""} />
                    <span>{post.likes}</span>
                  </button>

                  <button
                    onClick={() =>
                      setOpenCommentPostId(openCommentPostId === post.id ? null : post.id)
                    }
                    className="flex items-center gap-2 text-[#C7C7C7] text-[14px] font-medium"
                  >
                    <MessageCircle size={18} />
                    <span>{post.commentsCount}</span>
                  </button>
                </div>

                {/* Expandable Comment Section */}
                {openCommentPostId === post.id && (
                  <div className="pt-4 border-t border-white/10 space-y-4">
                    {/* Comments List */}
                    <div className="space-y-3">
                      {post.commentList.map((comment) => (
                        <div key={comment.id} className="flex items-start gap-3 bg-black/20 p-3 rounded-[8px]">
                          <div className="w-[32px] h-[32px] rounded-full overflow-hidden border border-white/10 relative shrink-0">
                            <Image src={comment.avatar} alt={comment.username} fill className="object-cover" />
                          </div>
                          <div className="flex-1 text-[13px]">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-semibold text-white">{comment.username}</span>
                              <span className="text-[#C7C7C7] text-[11px]">{comment.timestamp}</span>
                            </div>
                            <p className="text-zinc-200">{comment.text}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Add Comment Input */}
                    <div className="flex items-center gap-3 pt-2">
                      <input
                        type="text"
                        placeholder="Write a comment..."
                        value={commentInput[post.id] || ""}
                        onChange={(e) =>
                          setCommentInput({ ...commentInput, [post.id]: e.target.value })
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddComment(post.id);
                          }
                        }}
                        className="flex-1 bg-black/30 border border-white/10 rounded-[8px] px-4 py-2 text-sm text-white placeholder-[#C7C7C7] outline-none"
                      />
                      <button
                        onClick={() => handleAddComment(post.id)}
                        className="bg-[#E60813] text-white p-2 rounded-[8px]"
                      >
                        <Send size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </article>
            )))}
        </section>
      </div>

      {/* 4. MOVIE POSTER PREVIEW MODAL */}
      {previewImage && (
        <div
          className="fixed inset-0 z-[2000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="relative max-w-[540px] w-full bg-[#1e1e1e] rounded-[16px] overflow-hidden border border-white/15 p-2 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 z-10 bg-black/60 text-white rounded-full p-2"
            >
              <X size={20} />
            </button>
            <div className="relative w-full aspect-video rounded-[12px] overflow-hidden">
              <Image
                src={previewImage}
                alt="Full Preview"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

"use client";

import { useMemo, useState } from "react";
import type { ChangeEvent } from "react";
import {
  ClubsPage,
  CommunityReportsAdmin,
  MediaPage,
  OrganizationPage,
  OrganizationsAdmin,
  useCommunityDemo,
} from "./community-features";
import type { CommunityRole } from "./community-features";

type View = "ideas" | "archive" | "media" | "clubs" | "organization" | "admin";
type Role = CommunityRole;
type Status = "Under Review" | "In Progress" | "Completed" | "Not Implemented";

type Reply = {
  id: number;
  author: string;
  initials: string;
  text: string;
  time: string;
  owned?: boolean;
};

type Comment = {
  id: number;
  author: string;
  initials: string;
  text: string;
  time: string;
  owned?: boolean;
  replies: Reply[];
};

type Post = {
  id: number;
  author: string;
  authorRole: "Student" | "Teacher";
  initials: string;
  time: string;
  ageHours: number;
  title: string;
  problem: string;
  suggestion: string;
  images: string[];
  likes: number;
  liked: boolean;
  reports: number;
  owned?: boolean;
  hidden?: boolean;
  comments: Comment[];
};

type Milestone = {
  id: number;
  date: string;
  title: string;
  note: string;
  status: Status;
};

type ArchiveItem = {
  id: number;
  title: string;
  submittedBy: string;
  likes: number;
  status: Status;
  date: string;
  summary: string;
  outcome: string;
  images: string[];
  feedback?: string;
  milestones: Milestone[];
};

const initialPosts: Post[] = [
  {
    id: 1,
    author: "Emma Chen",
    authorRole: "Student",
    initials: "EC",
    time: "2 hours ago",
    ageHours: 2,
    title: "More shaded seating near the field",
    problem: "The outdoor tables get too hot at lunch and are difficult to use in light rain.",
    suggestion: "Add several covered tables near the field for lunch and free periods.",
    images: [],
    likes: 87,
    liked: false,
    reports: 0,
    comments: [
      {
        id: 11,
        author: "Mia Zhang",
        initials: "MZ",
        text: "Clubs could meet there too.",
        time: "1 hour ago",
        replies: [
          { id: 111, author: "Emma Chen", initials: "EC", text: "Yes — especially after lunch.", time: "45 minutes ago" },
        ],
      },
      {
        id: 12,
        author: "Mr. Lewis",
        initials: "ML",
        text: "Drainage would need to be considered.",
        time: "35 minutes ago",
        replies: [],
      },
    ],
  },
  {
    id: 2,
    author: "Daniel Wu",
    authorRole: "Student",
    initials: "DW",
    time: "Yesterday",
    ageHours: 25,
    title: "Keep the library open later",
    problem: "Students waiting for late buses do not always have a quiet place to work.",
    suggestion: "Keep the library open until late buses leave on weekdays.",
    images: [],
    likes: 81,
    liked: false,
    reports: 0,
    comments: [
      {
        id: 21,
        author: "Sophie Lin",
        initials: "SL",
        text: "Even two days a week would help.",
        time: "Yesterday",
        replies: [],
      },
    ],
  },
  {
    id: 3,
    author: "Sophie Lin",
    authorRole: "Student",
    initials: "SL",
    time: "2 days ago",
    ageHours: 49,
    title: "Clearer recycling signs",
    problem: "The dining hall bins are easy to mix up.",
    suggestion: "Add picture labels above each bin to make sorting clearer.",
    images: [],
    likes: 75,
    liked: false,
    reports: 1,
    comments: [
      {
        id: 31,
        author: "Leo Sun",
        initials: "LS",
        text: "Eco Committee could help design them.",
        time: "2 days ago",
        replies: [],
      },
    ],
  },
  {
    id: 4,
    author: "Mr. Lewis",
    authorRole: "Teacher",
    initials: "ML",
    time: "3 days ago",
    ageHours: 76,
    title: "A quiet zone in the common room",
    problem: "Students who need to study have few quiet options during free periods.",
    suggestion: "Set aside one section of the common room as a quiet zone.",
    images: [],
    likes: 56,
    liked: false,
    reports: 0,
    comments: [],
  },
];

const initialArchive: ArchiveItem[] = [
  {
    id: 101,
    title: "More outdoor seating for lunch",
    submittedBy: "Emma Chen",
    likes: 124,
    status: "Completed",
    date: "May 2026",
    summary: "Students asked for more usable outdoor lunch spaces.",
    outcome: "Six shaded tables were installed near the field and are now used throughout lunch and free periods.",
    images: ["/community-outcome.png"],
    feedback: "It is much easier to find a comfortable place to sit with friends now.",
    milestones: [
      { id: 1011, date: "May 5", title: "Selected", note: "Entered StuCo review after leading the weekly vote.", status: "Under Review" },
      { id: 1012, date: "May 12", title: "Approved", note: "Facilities confirmed the location and installation plan.", status: "In Progress" },
      { id: 1013, date: "May 28", title: "Completed", note: "Six shaded tables opened near the field.", status: "Completed" },
    ],
  },
  {
    id: 102,
    title: "Extend library opening hours",
    submittedBy: "Daniel Wu",
    likes: 109,
    status: "In Progress",
    date: "June 2026",
    summary: "Keep the library open until late buses depart.",
    outcome: "Later hours are being tested on Tuesdays and Thursdays. Attendance will be reviewed after four weeks.",
    images: [],
    milestones: [
      { id: 1021, date: "Jun 3", title: "Selected", note: "The idea entered review with 109 votes.", status: "Under Review" },
      { id: 1022, date: "Jun 17", title: "Trial started", note: "The library now stays open later twice a week.", status: "In Progress" },
    ],
  },
  {
    id: 103,
    title: "Covered bicycle parking",
    submittedBy: "Leo Sun",
    likes: 96,
    status: "Under Review",
    date: "August 2026",
    summary: "Protect bicycles from rain during the school day.",
    outcome: "Facilities is checking locations, capacity, and safety requirements.",
    images: [],
    milestones: [
      { id: 1031, date: "Aug 24", title: "Selected", note: "StuCo asked Facilities to assess possible locations.", status: "Under Review" },
    ],
  },
  {
    id: 104,
    title: "Move the late bus departure time",
    submittedBy: "Mia Zhang",
    likes: 91,
    status: "Not Implemented",
    date: "April 2026",
    summary: "Delay late buses by thirty minutes.",
    outcome: "This could not move forward because routes are shared with other campuses and the change conflicts with driver schedules.",
    images: [],
    milestones: [
      { id: 1041, date: "Apr 6", title: "Selected", note: "The proposal entered StuCo review.", status: "Under Review" },
      { id: 1042, date: "Apr 18", title: "Not implemented", note: "Shared routes and driver schedules prevent the proposed change.", status: "Not Implemented" },
    ],
  },
];

const statusClass: Record<Status, string> = {
  "Under Review": "review",
  "In Progress": "progress",
  "Completed": "completed",
  "Not Implemented": "declined",
};

const currentUser = {
  name: "Alex Chen",
  initials: "AC",
  role: "Student",
};

function Brand() {
  return (
    <span className="brand">
      <span className="brand-mark"><span /></span>
      <span>YKPS Forum</span>
    </span>
  );
}

function totalComments(post: Post) {
  return post.comments.reduce((total, comment) => total + 1 + comment.replies.length, 0);
}

export default function Home() {
  const community = useCommunityDemo();
  const [view, setView] = useState<View>("ideas");
  const [role, setRole] = useState<Role>("member");
  const [posts, setPosts] = useState(initialPosts);
  const [archive, setArchive] = useState(initialArchive);
  const [sort, setSort] = useState<"trending" | "newest">("trending");
  const [archiveFilter, setArchiveFilter] = useState<Status | "All">("All");
  const [expandedArchive, setExpandedArchive] = useState<number | null>(101);
  const [openComments, setOpenComments] = useState<number | null>(null);
  const [commentDrafts, setCommentDrafts] = useState<Record<number, string>>({});
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [newPostOpen, setNewPostOpen] = useState(false);
  const [draftImages, setDraftImages] = useState<string[]>([]);
  const [reportTarget, setReportTarget] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const [rejectTarget, setRejectTarget] = useState<number | null>(null);
  const [archiveUpdateTarget, setArchiveUpdateTarget] = useState<number | null>(null);
  const [adminUploadImages, setAdminUploadImages] = useState<string[]>([]);
  const [profileOpen, setProfileOpen] = useState(false);
  const [adminTab, setAdminTab] = useState<"top" | "reports" | "archive" | "organizations">("top");
  const [reviewedPostIds, setReviewedPostIds] = useState<number[]>([]);
  const [toast, setToast] = useState("");
  const [selectedOrganizationId, setSelectedOrganizationId] = useState("green-pulse");
  const [mediaUploadOpen, setMediaUploadOpen] = useState(false);
  const [clubComposeOpen, setClubComposeOpen] = useState(false);

  const activePosts = useMemo(
    () => posts.filter((post) => !post.hidden),
    [posts],
  );

  const weeklyTop = useMemo(
    () => [...activePosts].sort((a, b) => b.likes - a.likes).slice(0, 3),
    [activePosts],
  );

  const visiblePosts = useMemo(() => {
    const list = [...activePosts];
    if (sort === "newest") return list.sort((a, b) => b.id - a.id);
    return list.sort((a, b) => {
      const scoreA = a.likes * 1.4 - Math.sqrt(a.ageHours);
      const scoreB = b.likes * 1.4 - Math.sqrt(b.ageHours);
      return scoreB - scoreA;
    });
  }, [activePosts, sort]);

  const candidates = weeklyTop.filter((post) => !reviewedPostIds.includes(post.id));
  const reportQueue = posts.filter((post) => post.reports > 0 && !post.hidden);
  const filteredArchive = archiveFilter === "All"
    ? archive
    : archive.filter((item) => item.status === archiveFilter);

  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2400);
  };

  const navigate = (next: View) => {
    setView(next);
    setProfileOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const collectImages = (
    event: ChangeEvent<HTMLInputElement>,
    current: string[],
    update: (images: string[]) => void,
  ) => {
    const files = Array.from(event.target.files ?? []).slice(0, Math.max(0, 3 - current.length));
    update([...current, ...files.map((file) => URL.createObjectURL(file))].slice(0, 3));
    event.target.value = "";
  };

  const toggleLike = (id: number) => {
    setPosts((current) => current.map((post) => post.id === id ? {
      ...post,
      liked: !post.liked,
      likes: post.likes + (post.liked ? -1 : 1),
    } : post));
  };

  const addComment = (id: number) => {
    const text = (commentDrafts[id] ?? "").trim();
    if (!text) return;
    setPosts((current) => current.map((post) => post.id === id ? {
      ...post,
      comments: [...post.comments, {
        id: Date.now(),
        author: currentUser.name,
        initials: currentUser.initials,
        text,
        time: "Just now",
        owned: true,
        replies: [],
      }],
    } : post));
    setCommentDrafts((current) => ({ ...current, [id]: "" }));
    notify("Comment posted");
  };

  const addReply = (postId: number, commentId: number) => {
    const key = `${postId}-${commentId}`;
    const text = (replyDrafts[key] ?? "").trim();
    if (!text) return;
    setPosts((current) => current.map((post) => post.id === postId ? {
      ...post,
      comments: post.comments.map((comment) => comment.id === commentId ? {
        ...comment,
        replies: [...comment.replies, {
          id: Date.now(),
          author: currentUser.name,
          initials: currentUser.initials,
          text,
          time: "Just now",
          owned: true,
        }],
      } : comment),
    } : post));
    setReplyDrafts((current) => ({ ...current, [key]: "" }));
    setReplyingTo(null);
    notify("Reply posted");
  };

  const deleteComment = (postId: number, commentId: number, replyId?: number) => {
    setPosts((current) => current.map((post) => post.id === postId ? {
      ...post,
      comments: replyId
        ? post.comments.map((comment) => comment.id === commentId
          ? { ...comment, replies: comment.replies.filter((reply) => reply.id !== replyId) }
          : comment)
        : post.comments.filter((comment) => comment.id !== commentId),
    } : post));
    notify("Comment deleted");
  };

  const createPost = (formData: FormData) => {
    const title = String(formData.get("title") ?? "").trim();
    const problem = String(formData.get("problem") ?? "").trim();
    const suggestion = String(formData.get("suggestion") ?? "").trim();
    if (!title || !problem || !suggestion) return;
    const nextId = Math.max(0, ...posts.map((post) => post.id)) + 1;
    setPosts((current) => [{
      id: nextId,
      author: currentUser.name,
      authorRole: "Student",
      initials: currentUser.initials,
      time: "Just now",
      ageHours: 0,
      title,
      problem,
      suggestion,
      images: draftImages,
      likes: 0,
      liked: false,
      reports: 0,
      owned: true,
      comments: [],
    }, ...current]);
    setDraftImages([]);
    setNewPostOpen(false);
    setSort("newest");
    notify("Idea posted");
  };

  const submitReport = (formData: FormData) => {
    if (reportTarget === null) return;
    const reason = String(formData.get("reason") ?? "Community guidelines");
    setPosts((current) => current.map((post) => post.id === reportTarget
      ? { ...post, reports: post.reports + 1 }
      : post));
    setReportTarget(null);
    notify(`Report sent · ${reason}`);
  };

  const deletePost = () => {
    if (deleteTarget === null) return;
    setPosts((current) => current.filter((post) => post.id !== deleteTarget));
    setDeleteTarget(null);
    notify("Post deleted");
  };

  const moveCandidateToArchive = (post: Post) => {
    const item: ArchiveItem = {
      id: 200 + post.id,
      title: post.title,
      submittedBy: post.author,
      likes: post.likes,
      status: "Under Review",
      date: "October 2026",
      summary: post.suggestion,
      outcome: "StuCo has opened a review with the relevant school team.",
      images: post.images,
      milestones: [
        {
          id: Date.now(),
          date: "Oct 1",
          title: "Selected",
          note: `Selected from this week’s Top 3 with ${post.likes} votes.`,
          status: "Under Review",
        },
      ],
    };
    setArchive((current) => current.some((entry) => entry.id === item.id) ? current : [item, ...current]);
    setPosts((current) => current.map((entry) => entry.id === post.id ? { ...entry, hidden: true } : entry));
    setReviewedPostIds((current) => [...current, post.id]);
    notify("Moved to Archive");
  };

  const rejectCandidate = (formData: FormData) => {
    if (rejectTarget === null) return;
    const post = posts.find((entry) => entry.id === rejectTarget);
    const reason = String(formData.get("reason") ?? "").trim();
    if (!post || !reason) return;
    const item: ArchiveItem = {
      id: 300 + post.id,
      title: post.title,
      submittedBy: post.author,
      likes: post.likes,
      status: "Not Implemented",
      date: "October 2026",
      summary: post.suggestion,
      outcome: reason,
      images: post.images,
      milestones: [
        {
          id: Date.now(),
          date: "Oct 1",
          title: "Not implemented",
          note: reason,
          status: "Not Implemented",
        },
      ],
    };
    setArchive((current) => [item, ...current]);
    setPosts((current) => current.map((entry) => entry.id === post.id ? { ...entry, hidden: true } : entry));
    setReviewedPostIds((current) => [...current, post.id]);
    setRejectTarget(null);
    notify("Reason published in Archive");
  };

  const publishMilestone = (formData: FormData) => {
    if (archiveUpdateTarget === null) return;
    const status = String(formData.get("status") ?? "Under Review") as Status;
    const title = String(formData.get("title") ?? "").trim();
    const note = String(formData.get("note") ?? "").trim();
    if (!title || !note) return;
    setArchive((current) => current.map((item) => item.id === archiveUpdateTarget ? {
      ...item,
      status,
      outcome: note,
      images: [...item.images, ...adminUploadImages].slice(0, 3),
      milestones: [...item.milestones, {
        id: Date.now(),
        date: "Oct 1",
        title,
        note,
        status,
      }],
    } : item));
    setAdminUploadImages([]);
    setArchiveUpdateTarget(null);
    notify("Milestone published");
  };

  return (
    <main className="site-shell">
      <header className="topbar">
        <button className="brand-button" onClick={() => navigate("ideas")}><Brand /></button>
        <nav className="nav-tabs" aria-label="Main navigation">
          <button className={view === "ideas" ? "active" : ""} onClick={() => navigate("ideas")}>Ideas</button>
          <button className={view === "archive" ? "active" : ""} onClick={() => navigate("archive")}>Archive</button>
          <button className={view === "media" ? "active" : ""} onClick={() => navigate("media")}>Media</button>
          <button className={view === "clubs" ? "active" : ""} onClick={() => navigate("clubs")}>Clubs</button>
          {role === "admin" && (
            <button className={view === "admin" ? "active" : ""} onClick={() => navigate("admin")}>
              Manage <span className="count-badge">{candidates.length + reportQueue.length + community.reports.length}</span>
            </button>
          )}
        </nav>
        <div className="header-actions">
          {view === "ideas" && <button className="header-post" onClick={() => setNewPostOpen(true)}>＋ Post</button>}
          {view === "media" && role === "organization" && <button className="header-post" onClick={() => setMediaUploadOpen(true)}>＋ Upload</button>}
          {view === "clubs" && role === "organization" && <button className="header-post" onClick={() => setClubComposeOpen(true)}>＋ New post</button>}
          <button className="profile-button" aria-label="Open profile menu" onClick={() => setProfileOpen((open) => !open)}>{role === "organization" ? "GP" : "AC"}</button>
          {profileOpen && (
            <div className="profile-menu">
              <strong>{role === "organization" ? "Green Pulse" : "Alex Chen"}</strong>
              <small>{role === "admin" ? "StuCo administrator" : role === "organization" ? "Organization leader" : "Student"}</small>
              <hr />
              {role !== "member" && <button onClick={() => { setRole("member"); navigate("ideas"); }}>Student view</button>}
              {role !== "organization" && <button onClick={() => { setRole("organization"); navigate("media"); }}>Organization leader view</button>}
              {role !== "admin" && <button onClick={() => { setRole("admin"); navigate("admin"); }}>StuCo view</button>}
              <button onClick={() => { community.resetDemo(); window.location.reload(); }}>Reset demo</button>
            </div>
          )}
        </div>
      </header>

      {view === "ideas" && (
        <section className="ideas-page">
          <div className="ideas-heading">
            <div>
              <span className="eyebrow">THIS WEEK</span>
              <h1>Ideas</h1>
              <p>Share a problem and a practical way to improve it.</p>
            </div>
            <div className="week-cutoff"><strong>Closes Sunday</strong><span>23:59 · Shanghai</span></div>
          </div>

          <div className="content-grid">
            <div className="feed-column">
              <div className="feed-tools">
                <span><strong>{visiblePosts.length}</strong> open ideas</span>
                <div className="sort-pills">
                  <button className={sort === "trending" ? "selected" : ""} onClick={() => setSort("trending")}>Trending</button>
                  <button className={sort === "newest" ? "selected" : ""} onClick={() => setSort("newest")}>Newest</button>
                </div>
              </div>

              {visiblePosts.map((post) => {
                const topRank = weeklyTop.findIndex((entry) => entry.id === post.id);
                const isLocked = topRank >= 0;
                return (
                  <article className="post-card" key={post.id}>
                    <div className="post-author">
                      <span className="avatar">{post.initials}</span>
                      <span>
                        <strong>{post.author}</strong>
                        <small>{post.authorRole} · {post.time}</small>
                      </span>
                      {topRank >= 0 && <span className="rank-tag">#{topRank + 1} this week</span>}
                      <button className="more-button" aria-label={`Report ${post.title}`} onClick={() => setReportTarget(post.id)}>•••</button>
                    </div>

                    <h2>{post.title}</h2>
                    <div className="post-copy">
                      <div><span>Problem</span><p>{post.problem}</p></div>
                      <div><span>Suggestion</span><p>{post.suggestion}</p></div>
                    </div>

                    {post.images.length > 0 && (
                      <div className={`post-images images-${post.images.length}`}>
                        {post.images.map((image, index) => <img key={image} src={image} alt={`Attachment ${index + 1} for ${post.title}`} />)}
                      </div>
                    )}

                    <div className="post-actions">
                      <button className={post.liked ? "liked" : ""} onClick={() => toggleLike(post.id)} aria-label={post.liked ? "Remove vote" : "Vote for this idea"}>
                        {post.liked ? "♥" : "♡"} <strong>{post.likes}</strong>
                      </button>
                      <button onClick={() => setOpenComments(openComments === post.id ? null : post.id)}>
                        ◯ <strong>{totalComments(post)}</strong>
                      </button>
                      {post.owned && !isLocked && <button className="quiet-action" onClick={() => setDeleteTarget(post.id)}>Delete</button>}
                      {post.owned && isLocked && <span className="locked-note">Top 3 · locked</span>}
                    </div>

                    {openComments === post.id && (
                      <div className="comments-panel">
                        {post.comments.length === 0 && <p className="empty-comment">No comments yet.</p>}
                        {post.comments.map((comment) => {
                          const replyKey = `${post.id}-${comment.id}`;
                          return (
                            <div className="comment-thread" key={comment.id}>
                              <div className="comment">
                                <span className="avatar small">{comment.initials}</span>
                                <div className="comment-body">
                                  <div className="comment-meta">
                                    <strong>{comment.author}</strong><small>{comment.time}</small>
                                    <button onClick={() => setReplyingTo(replyingTo === replyKey ? null : replyKey)}>Reply</button>
                                    {comment.owned && <button onClick={() => deleteComment(post.id, comment.id)}>Delete</button>}
                                  </div>
                                  <p>{comment.text}</p>
                                </div>
                              </div>

                              {comment.replies.map((reply) => (
                                <div className="comment reply" key={reply.id}>
                                  <span className="avatar small">{reply.initials}</span>
                                  <div className="comment-body">
                                    <div className="comment-meta">
                                      <strong>{reply.author}</strong><small>{reply.time}</small>
                                      {reply.owned && <button onClick={() => deleteComment(post.id, comment.id, reply.id)}>Delete</button>}
                                    </div>
                                    <p>{reply.text}</p>
                                  </div>
                                </div>
                              ))}

                              {replyingTo === replyKey && (
                                <div className="reply-form">
                                  <input
                                    value={replyDrafts[replyKey] ?? ""}
                                    onChange={(event) => setReplyDrafts((current) => ({ ...current, [replyKey]: event.target.value }))}
                                    onKeyDown={(event) => { if (event.key === "Enter") addReply(post.id, comment.id); }}
                                    placeholder={`Reply to ${comment.author}`}
                                    aria-label={`Reply to ${comment.author}`}
                                  />
                                  <button onClick={() => addReply(post.id, comment.id)}>Reply</button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                        <div className="comment-form">
                          <span className="avatar small">AC</span>
                          <input
                            value={commentDrafts[post.id] ?? ""}
                            onChange={(event) => setCommentDrafts((current) => ({ ...current, [post.id]: event.target.value }))}
                            onKeyDown={(event) => { if (event.key === "Enter") addComment(post.id); }}
                            placeholder="Add a comment"
                            aria-label="Add comment"
                          />
                          <button onClick={() => addComment(post.id)}>Post</button>
                        </div>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>

            <aside className="sidebar">
              <div className="weekly-card">
                <div className="weekly-topline"><strong>Top 3</strong><span>Votes only</span></div>
                {weeklyTop.map((post, index) => (
                  <div className="mini-rank" key={post.id}>
                    <b>{index + 1}</b>
                    <span>{post.title}<small>♥ {post.likes}</small></span>
                  </div>
                ))}
                <div className="weekly-rule">StuCo reviews and may replace candidates.</div>
              </div>
              <button className="archive-teaser" onClick={() => navigate("archive")}>
                <span className="archive-icon">✓</span>
                <span><small>LATEST OUTCOME</small><strong>Outdoor seating completed</strong></span>
                <b>View</b>
              </button>
            </aside>
          </div>
        </section>
      )}

      {view === "archive" && (
        <section className="archive-page">
          <div className="page-heading">
            <div><span className="eyebrow">PUBLIC RECORD</span><h1>Archive</h1><p>Major decisions and outcomes, kept visible.</p></div>
            <div className="archive-stats"><strong>{archive.length}</strong><span>reviewed ideas</span></div>
          </div>

          <div className="filter-row" aria-label="Filter Archive">
            {(["All", "Under Review", "In Progress", "Completed", "Not Implemented"] as const).map((filter) => (
              <button key={filter} className={archiveFilter === filter ? "active" : ""} onClick={() => setArchiveFilter(filter)}>{filter}</button>
            ))}
          </div>

          <div className="archive-timeline">
            {filteredArchive.map((item) => {
              const expanded = expandedArchive === item.id;
              return (
                <article className={`archive-story ${expanded ? "expanded" : ""}`} key={item.id}>
                  <div className="timeline-rail">
                    <span className={`timeline-dot ${statusClass[item.status]}`} />
                    <small>{item.date}</small>
                  </div>
                  <div className="story-card">
                    <button className="story-summary" onClick={() => setExpandedArchive(expanded ? null : item.id)} aria-expanded={expanded}>
                      <span>
                        <span className={`status-pill ${statusClass[item.status]}`}>{item.status}</span>
                        <h2>{item.title}</h2>
                        <small>{item.submittedBy} · ♥ {item.likes}</small>
                      </span>
                      <b>{expanded ? "−" : "+"}</b>
                    </button>

                    {expanded && (
                      <div className="story-detail">
                        <p className="story-outcome">{item.outcome}</p>
                        {item.images.length > 0 && (
                          <div className={`outcome-images images-${item.images.length}`}>
                            {item.images.map((image, index) => <img key={image} src={image} alt={`Outcome ${index + 1} for ${item.title}`} />)}
                          </div>
                        )}
                        <div className="milestone-list">
                          {item.milestones.map((milestone) => (
                            <div className="milestone" key={milestone.id}>
                              <span className={`milestone-mark ${statusClass[milestone.status]}`} />
                              <div><small>{milestone.date}</small><strong>{milestone.title}</strong><p>{milestone.note}</p></div>
                            </div>
                          ))}
                        </div>
                        {item.feedback && <blockquote>“{item.feedback}”<small>Selected student feedback</small></blockquote>}
                        <div className="archive-locked">Archived posts are read-only · Updated by StuCo</div>
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {view === "media" && (
        <MediaPage
          hub={community}
          role={role}
          uploadOpen={mediaUploadOpen}
          setUploadOpen={setMediaUploadOpen}
          onOpenOrganization={(id) => { setSelectedOrganizationId(id); navigate("organization"); }}
          notify={notify}
        />
      )}

      {view === "clubs" && (
        <ClubsPage
          hub={community}
          role={role}
          composeOpen={clubComposeOpen}
          setComposeOpen={setClubComposeOpen}
          onOpenOrganization={(id) => { setSelectedOrganizationId(id); navigate("organization"); }}
          notify={notify}
        />
      )}

      {view === "organization" && (
        <OrganizationPage
          hub={community}
          organizationId={selectedOrganizationId}
          role={role}
          onOpenMedia={() => navigate("media")}
          onBack={() => navigate("clubs")}
          notify={notify}
        />
      )}

      {view === "admin" && role === "admin" && (
        <section className="admin-page">
          <div className="page-heading admin-heading">
            <div><span className="eyebrow">STUCO</span><h1>Manage</h1></div>
            <div className="admin-stats">
              <span><strong>{candidates.length}</strong> candidates</span>
              <span><strong>{reportQueue.length + community.reports.length}</strong> reports</span>
              <span><strong>{community.organizations.filter((organization) => organization.active).length}</strong> organizations</span>
            </div>
          </div>

          <div className="admin-tabs">
            <button className={adminTab === "top" ? "active" : ""} onClick={() => setAdminTab("top")}>Top 3 <span>{candidates.length}</span></button>
            <button className={adminTab === "reports" ? "active" : ""} onClick={() => setAdminTab("reports")}>Reports <span>{reportQueue.length + community.reports.length}</span></button>
            <button className={adminTab === "archive" ? "active" : ""} onClick={() => setAdminTab("archive")}>Archive <span>{archive.length}</span></button>
            <button className={adminTab === "organizations" ? "active" : ""} onClick={() => setAdminTab("organizations")}>Organizations <span>{community.organizations.length}</span></button>
          </div>

          {adminTab === "top" && (
            <div className="admin-stack">
              <div className="admin-section-head"><h2>This week</h2><span>Closes Sun · 23:59</span></div>
              {candidates.length === 0 && <div className="empty-state"><span>✓</span><h3>All reviewed</h3></div>}
              {candidates.map((post, index) => (
                <article className="candidate-card" key={post.id}>
                  <div className="rank-box">#{index + 1}</div>
                  <div className="candidate-copy">
                    <small>{post.author} · ♥ {post.likes}</small>
                    <h3>{post.title}</h3>
                    <p>{post.suggestion}</p>
                  </div>
                  <div className="candidate-actions">
                    <button className="approve" onClick={() => moveCandidateToArchive(post)}>Review</button>
                    <button onClick={() => setRejectTarget(post.id)}>Replace</button>
                  </div>
                </article>
              ))}
            </div>
          )}

          {adminTab === "reports" && (
            <>
              <div className="admin-stack">
                <div className="admin-section-head"><h2>Ideas reports</h2><span>Manual review only</span></div>
                {reportQueue.length === 0 && <div className="empty-state compact"><span>✓</span><h3>All clear</h3></div>}
                {reportQueue.map((post) => (
                  <article className="candidate-card" key={post.id}>
                    <div className="report-box">{post.reports}</div>
                    <div className="candidate-copy"><small>{post.author}</small><h3>{post.title}</h3><p>{post.problem}</p></div>
                    <div className="candidate-actions">
                      <button className="danger" onClick={() => {
                        setPosts((current) => current.map((entry) => entry.id === post.id ? { ...entry, hidden: true, reports: 0 } : entry));
                        notify("Content deleted");
                      }}>Delete content</button>
                      <button onClick={() => {
                        setPosts((current) => current.map((entry) => entry.id === post.id ? { ...entry, reports: 0 } : entry));
                        notify("Content kept");
                      }}>Keep content</button>
                    </div>
                  </article>
                ))}
              </div>
              <CommunityReportsAdmin hub={community} notify={notify} />
            </>
          )}

          {adminTab === "archive" && (
            <div className="admin-stack">
              <div className="admin-section-head"><h2>Major milestones</h2><span>Public timeline</span></div>
              {archive.map((item) => (
                <article className="archive-admin-row" key={item.id}>
                  <div><span className={`status-pill ${statusClass[item.status]}`}>{item.status}</span><h3>{item.title}</h3><small>{item.milestones.length} milestones</small></div>
                  <button onClick={() => {
                    setArchiveUpdateTarget(item.id);
                    setAdminUploadImages([]);
                  }}>Add milestone</button>
                </article>
              ))}
            </div>
          )}

          {adminTab === "organizations" && <OrganizationsAdmin hub={community} notify={notify} />}
        </section>
      )}

      {newPostOpen && (
        <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setNewPostOpen(false); }}>
          <form className="modal-card post-modal" action={createPost}>
            <div className="modal-heading"><div><span className="eyebrow">NEW IDEA</span><h2>What should change?</h2></div><button type="button" onClick={() => setNewPostOpen(false)} aria-label="Close">×</button></div>
            <label>Title <span>60 max</span><input name="title" required maxLength={60} placeholder="One clear sentence" /></label>
            <label>Problem <span>300 max</span><textarea name="problem" required maxLength={300} placeholder="What is happening, and who does it affect?" /></label>
            <label>Suggestion <span>300 max</span><textarea name="suggestion" required maxLength={300} placeholder="What practical change would help?" /></label>
            <div className="upload-block">
              <div><strong>Images</strong><small>Optional · up to 3</small></div>
              <label className="upload-button">＋ Add images<input type="file" accept="image/*" multiple onChange={(event) => collectImages(event, draftImages, setDraftImages)} /></label>
            </div>
            {draftImages.length > 0 && <div className="upload-previews">{draftImages.map((image, index) => <div key={image}><img src={image} alt={`Upload preview ${index + 1}`} /><button type="button" onClick={() => setDraftImages((current) => current.filter((entry) => entry !== image))} aria-label={`Remove image ${index + 1}`}>×</button></div>)}</div>}
            <div className="identity-note"><span className="avatar small">AC</span><span>Public as <strong>Alex Chen · Student</strong></span></div>
            <div className="modal-actions"><button type="button" onClick={() => setNewPostOpen(false)}>Cancel</button><button type="submit" className="submit">Post idea</button></div>
          </form>
        </div>
      )}

      {reportTarget !== null && (
        <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setReportTarget(null); }}>
          <form className="modal-card small-modal" action={submitReport}>
            <div className="modal-heading"><div><span className="eyebrow warning">PRIVATE</span><h2>Report post</h2></div><button type="button" onClick={() => setReportTarget(null)} aria-label="Close">×</button></div>
            <label>Reason<select name="reason" defaultValue="Off-topic or not a suggestion"><option>Off-topic or not a suggestion</option><option>Disrespectful or harmful</option><option>Personal information</option><option>Spam or duplicate</option><option>Image concern</option></select></label>
            <p className="modal-note">StuCo reviews every report manually. The post stays visible until a decision is made.</p>
            <div className="modal-actions"><button type="button" onClick={() => setReportTarget(null)}>Cancel</button><button type="submit" className="submit danger-submit">Report</button></div>
          </form>
        </div>
      )}

      {deleteTarget !== null && (
        <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setDeleteTarget(null); }}>
          <div className="modal-card small-modal">
            <div className="modal-heading"><div><span className="eyebrow warning">DELETE</span><h2>Delete this post?</h2></div><button type="button" onClick={() => setDeleteTarget(null)} aria-label="Close">×</button></div>
            <p className="modal-note">This cannot be undone. Top 3 posts must be handled by StuCo.</p>
            <div className="modal-actions"><button onClick={() => setDeleteTarget(null)}>Cancel</button><button className="submit danger-submit" onClick={deletePost}>Delete</button></div>
          </div>
        </div>
      )}

      {rejectTarget !== null && (
        <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setRejectTarget(null); }}>
          <form className="modal-card small-modal" action={rejectCandidate}>
            <div className="modal-heading"><div><span className="eyebrow warning">PUBLIC RECORD</span><h2>Replace this candidate</h2></div><button type="button" onClick={() => setRejectTarget(null)} aria-label="Close">×</button></div>
            <p className="modal-note">The post will enter Archive as Not Implemented. The full reason will be visible to everyone.</p>
            <label>Public reason<textarea name="reason" required maxLength={300} placeholder="Explain the decision clearly." /></label>
            <div className="modal-actions"><button type="button" onClick={() => setRejectTarget(null)}>Cancel</button><button type="submit" className="submit danger-submit">Publish reason</button></div>
          </form>
        </div>
      )}

      {archiveUpdateTarget !== null && (
        <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setArchiveUpdateTarget(null); }}>
          <form className="modal-card" action={publishMilestone}>
            <div className="modal-heading"><div><span className="eyebrow">MAJOR UPDATE</span><h2>Add milestone</h2></div><button type="button" onClick={() => setArchiveUpdateTarget(null)} aria-label="Close">×</button></div>
            <label>Status<select name="status" defaultValue={archive.find((item) => item.id === archiveUpdateTarget)?.status}><option>Under Review</option><option>In Progress</option><option>Completed</option><option>Not Implemented</option></select></label>
            <label>Milestone title<input name="title" required maxLength={60} placeholder="e.g. Trial approved" /></label>
            <label>Public update<textarea name="note" required maxLength={300} placeholder="What changed, and what happens next?" /></label>
            <div className="upload-block">
              <div><strong>Outcome images</strong><small>Up to 3 total</small></div>
              <label className="upload-button">＋ Add images<input type="file" accept="image/*" multiple onChange={(event) => collectImages(event, adminUploadImages, setAdminUploadImages)} /></label>
            </div>
            {adminUploadImages.length > 0 && <div className="upload-previews">{adminUploadImages.map((image, index) => <div key={image}><img src={image} alt={`Outcome preview ${index + 1}`} /></div>)}</div>}
            <div className="modal-actions"><button type="button" onClick={() => setArchiveUpdateTarget(null)}>Cancel</button><button type="submit" className="submit">Publish</button></div>
          </form>
        </div>
      )}

      {toast && <div className="toast"><span>✓</span>{toast}</div>}
    </main>
  );
}

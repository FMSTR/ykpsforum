"use client";

import { useMemo, useState } from "react";

type View = "community" | "archive" | "admin";
type Role = "member" | "admin";
type Status = "Under Review" | "In Progress" | "Completed" | "Not Implemented";

type Comment = {
  id: number;
  author: string;
  initials: string;
  text: string;
  time: string;
};

type Post = {
  id: number;
  author: string;
  initials: string;
  time: string;
  title: string;
  body: string;
  likes: number;
  liked: boolean;
  reports: number;
  hidden?: boolean;
  comments: Comment[];
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
  image?: string;
};

const initialPosts: Post[] = [
  {
    id: 1,
    author: "Emma Chen",
    initials: "EC",
    time: "2 hours ago",
    title: "More shaded seating near the field",
    body: "Could we add a few covered tables near the field? It would make lunch and free periods much more comfortable, especially when the weather gets warmer.",
    likes: 87,
    liked: false,
    reports: 0,
    comments: [
      { id: 11, author: "Mia Zhang", initials: "MZ", text: "This would also give clubs another place to meet after lunch.", time: "1 hour ago" },
      { id: 12, author: "Mr. Lewis", initials: "ML", text: "A useful suggestion. Shade and drainage would both need to be considered.", time: "35 minutes ago" },
    ],
  },
  {
    id: 2,
    author: "Daniel Wu",
    initials: "DW",
    time: "Yesterday",
    title: "Keep the library open later on weekdays",
    body: "Extending library hours until the late buses leave would give students a quiet place to work and collaborate after class.",
    likes: 81,
    liked: false,
    reports: 0,
    comments: [
      { id: 21, author: "Sophie Lin", initials: "SL", text: "Even two extra days a week would make a big difference.", time: "Yesterday" },
    ],
  },
  {
    id: 3,
    author: "Sophie Lin",
    initials: "SL",
    time: "2 days ago",
    title: "Clearer recycling signs in the dining hall",
    body: "The current bins are easy to mix up. Simple picture-based labels above each bin could reduce contamination and wasted recycling.",
    likes: 75,
    liked: false,
    reports: 1,
    comments: [
      { id: 31, author: "Leo Sun", initials: "LS", text: "Maybe the Eco Committee could help design these.", time: "2 days ago" },
    ],
  },
  {
    id: 4,
    author: "Mr. Lewis",
    initials: "ML",
    time: "3 days ago",
    title: "A quieter zone in the senior common room",
    body: "Could one section be designated for quiet study during free periods, while keeping the rest available for conversation?",
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
    summary: "Students asked for more comfortable spaces to eat and meet outside.",
    outcome: "Six new shaded tables were installed near the field. StuCo collected feedback after two weeks, and students reported that the area is now used throughout lunch and free periods.",
    image: "/community-outcome.png",
  },
  {
    id: 102,
    title: "Extend library opening hours",
    submittedBy: "Daniel Wu",
    likes: 109,
    status: "In Progress",
    date: "June 2026",
    summary: "Keep the library open until late buses depart on selected weekdays.",
    outcome: "The Library team is testing extended hours on Tuesdays and Thursdays this term. Attendance will be reviewed after four weeks.",
  },
  {
    id: 103,
    title: "Covered bicycle parking",
    submittedBy: "Leo Sun",
    likes: 96,
    status: "Under Review",
    date: "August 2026",
    summary: "Add weather protection for bicycles during rainy weeks.",
    outcome: "Facilities is assessing possible locations, capacity, and safety requirements. StuCo will publish the recommendation here.",
  },
  {
    id: 104,
    title: "Move the late bus departure time",
    submittedBy: "Mia Zhang",
    likes: 91,
    status: "Not Implemented",
    date: "April 2026",
    summary: "Delay all late buses by thirty minutes to allow more activity time.",
    outcome: "The change could not be made because routes are shared with other campuses and would conflict with driver schedules. Activities will instead finish five minutes earlier where possible.",
  },
];

const statusClass: Record<Status, string> = {
  "Under Review": "review",
  "In Progress": "progress",
  "Completed": "completed",
  "Not Implemented": "declined",
};

function Brand() {
  return (
    <span className="brand">
      <span className="brand-mark"><span /></span>
      <span>YKPS Forum</span>
    </span>
  );
}

function MicrosoftLogo() {
  return <span className="ms-logo" aria-hidden="true"><i /><i /><i /><i /></span>;
}

export default function Home() {
  const [signedIn, setSignedIn] = useState(false);
  const [role, setRole] = useState<Role>("member");
  const [view, setView] = useState<View>("community");
  const [posts, setPosts] = useState(initialPosts);
  const [archive, setArchive] = useState(initialArchive);
  const [sort, setSort] = useState<"popular" | "newest">("popular");
  const [archiveFilter, setArchiveFilter] = useState<Status | "All">("All");
  const [selectedArchive, setSelectedArchive] = useState(101);
  const [openComments, setOpenComments] = useState<number | null>(null);
  const [commentDrafts, setCommentDrafts] = useState<Record<number, string>>({});
  const [newPostOpen, setNewPostOpen] = useState(false);
  const [reportTarget, setReportTarget] = useState<number | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [adminTab, setAdminTab] = useState<"candidates" | "reports" | "archive">("candidates");
  const [candidateIds, setCandidateIds] = useState([1, 2, 3]);
  const [adminDrafts, setAdminDrafts] = useState<Record<number, string>>({});
  const [toast, setToast] = useState("");

  const visiblePosts = useMemo(() => {
    const list = posts.filter((post) => !post.hidden);
    return [...list].sort((a, b) => sort === "popular" ? b.likes - a.likes : b.id - a.id);
  }, [posts, sort]);

  const weeklyTop = useMemo(
    () => [...posts].filter((post) => !post.hidden).sort((a, b) => b.likes - a.likes).slice(0, 3),
    [posts],
  );

  const selectedItem = archive.find((item) => item.id === selectedArchive) ?? archive[0];
  const filteredArchive = archiveFilter === "All" ? archive : archive.filter((item) => item.status === archiveFilter);
  const reportQueue = posts.filter((post) => post.reports > 0);
  const candidates = candidateIds.map((id) => posts.find((post) => post.id === id)).filter(Boolean) as Post[];

  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2600);
  };

  const logIn = (nextRole: Role) => {
    setRole(nextRole);
    setSignedIn(true);
    setView(nextRole === "admin" ? "admin" : "community");
    notify(nextRole === "admin" ? "StuCo demo access enabled" : "Welcome to YKPS Forum");
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
      comments: [...post.comments, { id: Date.now(), author: "Alex Chen", initials: "AC", text, time: "Just now" }],
    } : post));
    setCommentDrafts((current) => ({ ...current, [id]: "" }));
    notify("Comment added");
  };

  const createPost = (formData: FormData) => {
    const title = String(formData.get("title") ?? "").trim();
    const body = String(formData.get("body") ?? "").trim();
    if (!title || !body) return;
    const nextId = Math.max(...posts.map((post) => post.id)) + 1;
    setPosts((current) => [{
      id: nextId,
      author: "Alex Chen",
      initials: "AC",
      time: "Just now",
      title,
      body,
      likes: 0,
      liked: false,
      reports: 0,
      comments: [],
    }, ...current]);
    setNewPostOpen(false);
    setSort("newest");
    notify("Your suggestion is now live");
  };

  const submitReport = (formData: FormData) => {
    if (reportTarget === null) return;
    const reason = String(formData.get("reason") ?? "Community guidelines");
    setPosts((current) => current.map((post) => post.id === reportTarget ? { ...post, reports: post.reports + 1 } : post));
    setReportTarget(null);
    notify(`Report submitted: ${reason}`);
  };

  const approveCandidate = (post: Post) => {
    const next: ArchiveItem = {
      id: 200 + post.id,
      title: post.title,
      submittedBy: post.author,
      likes: post.likes,
      status: "Under Review",
      date: "September 2026",
      summary: post.body,
      outcome: "StuCo has selected this idea for review. An update will be posted after the relevant school team has been consulted.",
    };
    setArchive((current) => current.some((item) => item.id === next.id) ? current : [next, ...current]);
    setCandidateIds((current) => current.filter((id) => id !== post.id));
    notify("Idea approved and moved to the Archive");
  };

  const setArchiveStatus = (id: number, status: Status) => {
    setArchive((current) => current.map((item) => item.id === id ? { ...item, status } : item));
  };

  const saveOutcome = (item: ArchiveItem) => {
    const text = (adminDrafts[item.id] ?? item.outcome).trim();
    setArchive((current) => current.map((entry) => entry.id === item.id ? { ...entry, outcome: text } : entry));
    notify("Archive update published");
  };

  if (!signedIn) {
    return (
      <main className="login-screen">
        <section className="login-art">
          <div className="login-brand"><Brand /><span>School community platform</span></div>
          <div className="login-message">
            <span className="eyebrow light">Ideas grow when they are heard</span>
            <h1>Make school<br />better, together.</h1>
            <p>Share constructive suggestions, build support across the community, and follow what happens next.</p>
          </div>
          <div className="floating-card float-one"><b>87</b><span>people support<br />shaded seating</span></div>
          <div className="floating-card float-two"><span className="tiny-check">✓</span><span>Idea completed<br /><b>View the outcome</b></span></div>
          <div className="login-orb orb-one" /><div className="login-orb orb-two" />
        </section>
        <section className="login-panel">
          <div className="login-box">
            <span className="demo-chip">INTERACTIVE DEMO</span>
            <h2>Welcome to YKPS Forum</h2>
            <p>Use your school Microsoft 365 account to continue.</p>
            <button className="microsoft-button" onClick={() => logIn("member")}><MicrosoftLogo />Continue with Microsoft</button>
            <div className="privacy-note"><span>◈</span><span>Your name is shown when you post or comment. Only members of the school community can sign in.</span></div>
            <div className="demo-divider"><span>Demo options</span></div>
            <button className="admin-demo" onClick={() => logIn("admin")}>Preview as a StuCo administrator →</button>
          </div>
          <p className="demo-disclaimer">This prototype does not connect to a real Microsoft account.</p>
        </section>
      </main>
    );
  }

  const navigate = (next: View) => {
    setView(next);
    setProfileOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <main className="site-shell">
      <header className="topbar">
        <button className="brand-button" onClick={() => navigate("community")}><Brand /></button>
        <nav className="nav-tabs" aria-label="Main navigation">
          <button className={view === "community" ? "active" : ""} onClick={() => navigate("community")}>Community</button>
          <button className={view === "archive" ? "active" : ""} onClick={() => navigate("archive")}>Archive</button>
          {role === "admin" && <button className={view === "admin" ? "active" : ""} onClick={() => navigate("admin")}>StuCo Admin <span className="count-badge">{reportQueue.length + candidates.length}</span></button>}
        </nav>
        <div className="header-actions">
          <span className="demo-mode">Demo mode</span>
          {view === "community" && <button className="header-share" onClick={() => setNewPostOpen(true)}>＋ Share</button>}
          <button className="profile-button" aria-label="Open profile" onClick={() => setProfileOpen((open) => !open)}>AC</button>
          {profileOpen && (
            <div className="profile-menu">
              <strong>Alex Chen</strong><small>alex.chen@school.edu</small>
              <hr />
              <button onClick={() => { setRole(role === "admin" ? "member" : "admin"); navigate(role === "admin" ? "community" : "admin"); }}>{role === "admin" ? "Switch to member view" : "Switch to StuCo demo"}</button>
              <button onClick={() => { setSignedIn(false); setProfileOpen(false); }}>Sign out</button>
            </div>
          )}
        </div>
      </header>

      {view === "community" && (
        <>
          <section className="hero">
            <div>
              <span className="eyebrow">A better school starts with a conversation</span>
              <h1>Your idea could<br />change our school.</h1>
              <p>Share a problem or suggestion. Discuss it with the community, build support, and help great ideas move forward.</p>
            </div>
            <button className="primary-button" onClick={() => setNewPostOpen(true)}><span>＋</span> Share a suggestion</button>
          </section>

          <section className="content-grid">
            <div className="feed-column">
              <div className="section-heading">
                <div><span className="live-dot" />Community feed <small>{visiblePosts.length} open ideas</small></div>
                <div className="sort-pills"><button className={sort === "popular" ? "selected" : ""} onClick={() => setSort("popular")}>Popular</button><button className={sort === "newest" ? "selected" : ""} onClick={() => setSort("newest")}>Newest</button></div>
              </div>
              {visiblePosts.map((post) => (
                <article className="post-card" key={post.id}>
                  <div className="post-author">
                    <span className="avatar">{post.initials}</span>
                    <span><strong>{post.author}</strong><small>{post.time} · School community</small></span>
                    <button className="more-button" aria-label={`Report ${post.title}`} onClick={() => setReportTarget(post.id)}>•••</button>
                  </div>
                  <h2>{post.title}</h2>
                  <p>{post.body}</p>
                  <div className="post-actions">
                    <button className={post.liked ? "liked" : ""} onClick={() => toggleLike(post.id)} aria-label={post.liked ? "Remove like" : "Like this post"}>{post.liked ? "♥" : "♡"} <strong>{post.likes}</strong></button>
                    <button onClick={() => setOpenComments(openComments === post.id ? null : post.id)}>○ <strong>{post.comments.length}</strong> comments</button>
                    <button className="report" onClick={() => setReportTarget(post.id)}>Report</button>
                  </div>
                  {openComments === post.id && (
                    <div className="comments-panel">
                      {post.comments.length === 0 && <p className="empty-comment">Start a constructive conversation.</p>}
                      {post.comments.map((comment) => (
                        <div className="comment" key={comment.id}><span className="avatar small">{comment.initials}</span><div><div><strong>{comment.author}</strong><small>{comment.time}</small></div><p>{comment.text}</p></div></div>
                      ))}
                      <div className="comment-form"><span className="avatar small">AC</span><input value={commentDrafts[post.id] ?? ""} onChange={(event) => setCommentDrafts((current) => ({ ...current, [post.id]: event.target.value }))} onKeyDown={(event) => { if (event.key === "Enter") addComment(post.id); }} placeholder="Add a constructive comment…" aria-label="Add comment" /><button onClick={() => addComment(post.id)}>Post</button></div>
                    </div>
                  )}
                </article>
              ))}
            </div>

            <aside className="sidebar">
              <div className="weekly-card">
                <div className="weekly-topline"><span className="eyebrow light">This week</span><span>Ends Sunday</span></div>
                <h2>Ideas gaining momentum</h2>
                <p>The three most-supported ideas move to StuCo review each week.</p>
                {weeklyTop.map((post, index) => <div className="mini-rank" key={post.id}><b>{index + 1}</b><span>{post.title}<small>{post.likes} supporters</small></span></div>)}
              </div>
              <button className="archive-teaser" onClick={() => navigate("archive")}>
                <span className="archive-teaser-content"><span className="check">✓</span><span><small>Recently completed</small><strong>More outdoor seating</strong></span></span>
                <span className="archive-link">View the Archive →</span>
              </button>
              <div className="guidelines-card"><span>◈</span><div><strong>Keep it constructive</strong><p>Focus on a clear problem, explain its impact, and suggest a possible improvement.</p></div></div>
            </aside>
          </section>
        </>
      )}

      {view === "archive" && (
        <section className="archive-page">
          <div className="page-intro archive-intro">
            <div><span className="eyebrow">Ideas into action</span><h1>See what changed.</h1><p>Every selected idea stays visible here, from the first review to the final outcome.</p></div>
            <div className="impact-stat"><strong>{archive.filter((item) => item.status === "Completed").length}</strong><span>ideas completed<br />this school year</span></div>
          </div>
          <div className="filter-row" aria-label="Filter archived ideas">
            {(["All", "Under Review", "In Progress", "Completed", "Not Implemented"] as const).map((filter) => <button key={filter} className={archiveFilter === filter ? "active" : ""} onClick={() => setArchiveFilter(filter)}>{filter}</button>)}
          </div>
          <div className="archive-layout">
            <div className="archive-list">
              {filteredArchive.map((item) => (
                <button className={`archive-card ${selectedItem.id === item.id ? "selected" : ""}`} key={item.id} onClick={() => setSelectedArchive(item.id)}>
                  <span className={`status-pill ${statusClass[item.status]}`}>{item.status}</span>
                  <h2>{item.title}</h2>
                  <p>{item.summary}</p>
                  <span className="archive-meta"><span>By {item.submittedBy}</span><span>♥ {item.likes}</span><span>{item.date}</span></span>
                </button>
              ))}
            </div>
            {selectedItem && (
              <aside className="outcome-panel">
                <div className="outcome-header"><span className={`status-pill ${statusClass[selectedItem.status]}`}>{selectedItem.status}</span><span>{selectedItem.date}</span></div>
                {selectedItem.image && <img src={selectedItem.image} alt="Students using the completed outdoor seating area" />}
                <span className="eyebrow">StuCo outcome update</span>
                <h2>{selectedItem.title}</h2>
                <p>{selectedItem.outcome}</p>
                <div className="outcome-footer"><span className="check small-check">✓</span><span><strong>Transparent from start to finish</strong><small>Updates are published by StuCo.</small></span></div>
              </aside>
            )}
          </div>
        </section>
      )}

      {view === "admin" && role === "admin" && (
        <section className="admin-page">
          <div className="page-intro admin-intro"><div><span className="eyebrow">StuCo workspace</span><h1>Community review</h1><p>Review weekly candidates, resolve reports, and keep Archive outcomes up to date.</p></div><div className="admin-summary"><div><strong>{candidates.length}</strong><small>candidates</small></div><div><strong>{reportQueue.length}</strong><small>reported posts</small></div><div><strong>{archive.filter((item) => item.status === "In Progress").length}</strong><small>in progress</small></div></div></div>
          <div className="admin-tabs">
            <button className={adminTab === "candidates" ? "active" : ""} onClick={() => setAdminTab("candidates")}>Weekly candidates <span>{candidates.length}</span></button>
            <button className={adminTab === "reports" ? "active" : ""} onClick={() => setAdminTab("reports")}>Reports <span>{reportQueue.length}</span></button>
            <button className={adminTab === "archive" ? "active" : ""} onClick={() => setAdminTab("archive")}>Archive updates <span>{archive.length}</span></button>
          </div>

          {adminTab === "candidates" && <div className="admin-stack">
            <div className="admin-section-head"><div><h2>This week&apos;s top ideas</h2><p>Ranked by likes at the weekly cutoff. Review each before publishing it to the Archive.</p></div><span className="cutoff-chip">Locked Sunday, 23:59</span></div>
            {candidates.length === 0 && <div className="empty-state"><span>✓</span><h3>All candidates reviewed</h3><p>The next weekly list will appear here on Sunday.</p></div>}
            {candidates.map((post, index) => <article className="candidate-card" key={post.id}><div className="rank-box">#{index + 1}</div><div className="candidate-copy"><span className="candidate-author">{post.author} · {post.likes} likes</span><h3>{post.title}</h3><p>{post.body}</p></div><div className="candidate-actions"><button className="approve" onClick={() => approveCandidate(post)}>Approve to Archive</button><button onClick={() => { setCandidateIds((current) => current.filter((id) => id !== post.id)); notify("Candidate skipped"); }}>Skip</button></div></article>)}
          </div>}

          {adminTab === "reports" && <div className="admin-stack">
            <div className="admin-section-head"><div><h2>Community reports</h2><p>Review context before hiding content or clearing a report.</p></div></div>
            {reportQueue.length === 0 && <div className="empty-state"><span>✓</span><h3>Report queue is clear</h3><p>New community reports will appear here.</p></div>}
            {reportQueue.map((post) => <article className="report-card" key={post.id}><div className="report-alert">{post.reports}</div><div className="candidate-copy"><span className="candidate-author">Reported post by {post.author}</span><h3>{post.title}</h3><p>{post.body}</p></div><div className="candidate-actions"><button className="danger" onClick={() => { setPosts((current) => current.map((entry) => entry.id === post.id ? { ...entry, hidden: true, reports: 0 } : entry)); notify("Post hidden from the community"); }}>Hide post</button><button onClick={() => { setPosts((current) => current.map((entry) => entry.id === post.id ? { ...entry, reports: 0 } : entry)); notify("Report resolved"); }}>Clear report</button></div></article>)}
          </div>}

          {adminTab === "archive" && <div className="admin-stack">
            <div className="admin-section-head"><div><h2>Publish outcome updates</h2><p>Only StuCo administrators can change an Archive status or outcome.</p></div></div>
            {archive.map((item) => <article className="archive-editor" key={item.id}><div className="editor-title"><div><span className="candidate-author">Selected {item.date}</span><h3>{item.title}</h3></div><select value={item.status} onChange={(event) => setArchiveStatus(item.id, event.target.value as Status)} aria-label={`Status for ${item.title}`}><option>Under Review</option><option>In Progress</option><option>Completed</option><option>Not Implemented</option></select></div><textarea value={adminDrafts[item.id] ?? item.outcome} onChange={(event) => setAdminDrafts((current) => ({ ...current, [item.id]: event.target.value }))} aria-label={`Outcome update for ${item.title}`} /><div className="editor-footer"><span>Visible to the whole school community</span><button onClick={() => saveOutcome(item)}>Publish update</button></div></article>)}
          </div>}
        </section>
      )}

      {newPostOpen && (
        <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setNewPostOpen(false); }}>
          <form className="modal-card" action={createPost}>
            <div className="modal-heading"><div><span className="eyebrow">New suggestion</span><h2>What could we improve?</h2></div><button type="button" onClick={() => setNewPostOpen(false)} aria-label="Close">×</button></div>
            <label>Title<input name="title" required maxLength={90} placeholder="A clear, specific title" /></label>
            <label>Explain the problem and your suggestion<textarea name="body" required maxLength={600} placeholder="What is happening, who does it affect, and what could make it better?" /></label>
            <div className="identity-note"><span className="avatar small">AC</span><span>This will be posted publicly as <strong>Alex Chen</strong>.</span></div>
            <div className="modal-actions"><button type="button" onClick={() => setNewPostOpen(false)}>Cancel</button><button type="submit" className="submit">Publish suggestion</button></div>
          </form>
        </div>
      )}

      {reportTarget !== null && (
        <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setReportTarget(null); }}>
          <form className="modal-card small-modal" action={submitReport}>
            <div className="modal-heading"><div><span className="eyebrow warning">Community safety</span><h2>Report this post</h2></div><button type="button" onClick={() => setReportTarget(null)} aria-label="Close">×</button></div>
            <p className="modal-description">Reports are private and reviewed by StuCo. Choose the reason that best applies.</p>
            <label>Reason<select name="reason" defaultValue="Off-topic or not a suggestion"><option>Off-topic or not a suggestion</option><option>Disrespectful or harmful language</option><option>Personal information</option><option>Spam or duplicate post</option><option>Other community guideline issue</option></select></label>
            <div className="modal-actions"><button type="button" onClick={() => setReportTarget(null)}>Cancel</button><button type="submit" className="submit danger-submit">Submit report</button></div>
          </form>
        </div>
      )}

      {toast && <div className="toast"><span>✓</span>{toast}</div>}
    </main>
  );
}

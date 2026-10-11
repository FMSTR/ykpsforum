"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent, Dispatch, FormEvent, SetStateAction } from "react";

export type CommunityRole = "member" | "organization" | "admin";

type CommunityReply = {
  id: number;
  author: string;
  identity: string;
  initials: string;
  text: string;
  owned?: boolean;
};

type CommunityComment = {
  id: number;
  author: string;
  identity: string;
  initials: string;
  text: string;
  owned?: boolean;
  replies: CommunityReply[];
};

export type Organization = {
  id: string;
  name: string;
  initials: string;
  description: string;
  color: string;
  avatar?: string;
  leaders: string[];
  active: boolean;
};

type MediaVideo = {
  id: number;
  organizationId: string;
  title?: string;
  description?: string;
  src: string;
  poster?: string;
  createdOrder: number;
  date: string;
  seen: boolean;
  localBlob?: boolean;
  comments: CommunityComment[];
};

type ClubPost = {
  id: number;
  organizationId: string;
  title: string;
  body: string;
  images: string[];
  date: string;
  createdOrder: number;
  status: "In Discussion" | "Closed";
  interestedOrganizationIds: string[];
  comments: CommunityComment[];
};

export type CommunityReport = {
  id: number;
  type: "Video" | "Media comment" | "Collaboration post" | "Club comment";
  targetId: number;
  parentId?: number;
  label: string;
  reportedBy: string;
};

export type CommunityHub = {
  organizations: Organization[];
  setOrganizations: Dispatch<SetStateAction<Organization[]>>;
  videos: MediaVideo[];
  setVideos: Dispatch<SetStateAction<MediaVideo[]>>;
  clubPosts: ClubPost[];
  setClubPosts: Dispatch<SetStateAction<ClubPost[]>>;
  reports: CommunityReport[];
  addReport: (report: Omit<CommunityReport, "id" | "reportedBy">) => void;
  keepReport: (id: number) => void;
  deleteReportedContent: (report: CommunityReport) => void;
  createOrganization: (organization: Omit<Organization, "id" | "initials" | "active">) => string | null;
  deleteOrganization: (id: string) => void;
  resetDemo: () => void;
};

const STORAGE_KEY = "ykps-community-prototype-v4";
const DEMO_ORG_ID = "green-pulse";

const initialOrganizations: Organization[] = [
  {
    id: "green-pulse",
    name: "Green Pulse",
    initials: "GP",
    description: "Student-led projects for a greener, lower-waste campus.",
    color: "#118254",
    leaders: ["maya.chen@school.edu"],
    active: true,
  },
  {
    id: "stagecraft",
    name: "Stagecraft Society",
    initials: "SS",
    description: "Theatre, performance, set design and backstage production.",
    color: "#7d5cc6",
    leaders: ["leo.wang@school.edu"],
    active: true,
  },
  {
    id: "student-media",
    name: "Student Media Lab",
    initials: "SM",
    description: "Stories, interviews and creative media made by students.",
    color: "#3274a8",
    leaders: ["nina.liu@school.edu"],
    active: true,
  },
  {
    id: "service-collective",
    name: "Service Collective",
    initials: "SC",
    description: "Connecting student volunteers with meaningful local action.",
    color: "#c0643d",
    leaders: ["ethan.zhao@school.edu"],
    active: true,
  },
];

const initialVideos: MediaVideo[] = [
  {
    id: 501,
    organizationId: "green-pulse",
    title: "One week without single-use cups",
    description: "A quick look at our dining hall waste challenge.",
    src: "/demo-media/green-pulse.mp4",
    poster: "/demo-media/green-pulse.jpg",
    createdOrder: 5,
    date: "Today",
    seen: false,
    comments: [
      { id: 5011, author: "Ava Lin", identity: "Student", initials: "AL", text: "Can tutor groups join next week?", replies: [] },
      { id: 5012, author: "Mr. Patel", identity: "Teacher", initials: "MP", text: "The visual comparison is very clear.", replies: [] },
    ],
  },
  {
    id: 502,
    organizationId: "stagecraft",
    title: "Behind the curtain",
    description: "Building the first set piece for our autumn production.",
    src: "/demo-media/stagecraft.mp4",
    poster: "/demo-media/stagecraft.jpg",
    createdOrder: 4,
    date: "Yesterday",
    seen: false,
    comments: [
      { id: 5021, author: "Jamie Xu", identity: "Student", initials: "JX", text: "The lighting test looks amazing.", replies: [] },
    ],
  },
  {
    id: 503,
    organizationId: "student-media",
    title: "Three questions with the robotics team",
    description: "A sixty-second campus interview.",
    src: "/demo-media/media-lab.mp4",
    poster: "/demo-media/media-lab.jpg",
    createdOrder: 3,
    date: "2 days ago",
    seen: false,
    comments: [
      { id: 5031, author: "Noah Chen", identity: "Student", initials: "NC", text: "Please interview the debate team next!", replies: [
        { id: 50311, author: "Student Media Lab", identity: "Organization", initials: "SM", text: "Added to our list.", owned: true },
      ] },
    ],
  },
  {
    id: 504,
    organizationId: "service-collective",
    title: "Saturday service recap",
    description: "Thank you to everyone who joined the book drive.",
    src: "/demo-media/service.mp4",
    poster: "/demo-media/service.jpg",
    createdOrder: 2,
    date: "3 days ago",
    seen: false,
    comments: [],
  },
  {
    id: 505,
    organizationId: "green-pulse",
    title: "Where does our recycling go?",
    description: "Follow the route from classroom bin to collection point.",
    src: "/demo-media/recycling.mp4",
    poster: "/demo-media/recycling.jpg",
    createdOrder: 1,
    date: "Last week",
    seen: false,
    comments: [],
  },
];

const initialClubPosts: ClubPost[] = [
  {
    id: 701,
    organizationId: "green-pulse",
    title: "Looking for a design partner for Earth Week",
    body: "We are planning a week-long campus challenge and would love to work with a creative club on posters, short videos and a visual installation in the atrium. Please comment with ideas or join as an interested organization.",
    images: ["/community-outcome.png"],
    date: "Today",
    createdOrder: 4,
    status: "In Discussion",
    interestedOrganizationIds: ["student-media"],
    comments: [
      { id: 7011, author: "Student Media Lab", identity: "Organization", initials: "SM", text: "We can help with the short video and interview students during the week.", replies: [] },
      { id: 7012, author: "Iris Zhou", identity: "Student", initials: "IZ", text: "A reusable-material sculpture could work well in the atrium.", replies: [] },
    ],
  },
  {
    id: 702,
    organizationId: "stagecraft",
    title: "Musicians wanted for the winter production",
    body: "We are looking for a student group that can perform a short live opening and help us develop simple transition music. Rehearsals begin later this month.",
    images: [],
    date: "Yesterday",
    createdOrder: 3,
    status: "In Discussion",
    interestedOrganizationIds: [],
    comments: [
      { id: 7021, author: "Emma Chen", identity: "Student", initials: "EC", text: "I can connect you with two students from the jazz ensemble.", replies: [] },
    ],
  },
  {
    id: 703,
    organizationId: "service-collective",
    title: "Joint book drive collection point",
    body: "We need one organization to host a second collection point and help sort donations after school. The main collection week is written in our shared planning document.",
    images: [],
    date: "3 days ago",
    createdOrder: 2,
    status: "In Discussion",
    interestedOrganizationIds: ["green-pulse", "stagecraft"],
    comments: [],
  },
  {
    id: 704,
    organizationId: "student-media",
    title: "Club spotlight series — first round complete",
    body: "Thank you to the organizations that joined our first club spotlight series. Filming and editing are complete, so this discussion is now closed.",
    images: [],
    date: "Last week",
    createdOrder: 1,
    status: "Closed",
    interestedOrganizationIds: ["stagecraft", "service-collective"],
    comments: [
      { id: 7041, author: "Stagecraft Society", identity: "Organization", initials: "SS", text: "Thanks for making the filming process so easy.", replies: [] },
    ],
  },
];

function initialsFor(name: string) {
  return name.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
}

function openVideoDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("ykps-forum-media", 1);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains("videos")) database.createObjectStore("videos");
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function saveVideoBlob(id: number, blob: Blob) {
  const database = await openVideoDatabase();
  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction("videos", "readwrite");
    transaction.objectStore("videos").put(blob, id);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
  database.close();
}

async function readVideoBlob(id: number) {
  const database = await openVideoDatabase();
  const result = await new Promise<Blob | undefined>((resolve, reject) => {
    const request = database.transaction("videos", "readonly").objectStore("videos").get(id);
    request.onsuccess = () => resolve(request.result as Blob | undefined);
    request.onerror = () => reject(request.error);
  });
  database.close();
  return result;
}

async function removeVideoBlob(id: number) {
  const database = await openVideoDatabase();
  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction("videos", "readwrite");
    transaction.objectStore("videos").delete(id);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
  database.close();
}

async function imageFilesToDataUrls(files: File[]) {
  return Promise.all(files.map((file) => new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  })));
}

async function inspectVideo(file: File) {
  return new Promise<{ duration: number; width: number; height: number }>((resolve, reject) => {
    const source = URL.createObjectURL(file);
    const element = document.createElement("video");
    element.preload = "metadata";
    element.onloadedmetadata = () => {
      resolve({ duration: element.duration, width: element.videoWidth, height: element.videoHeight });
      URL.revokeObjectURL(source);
    };
    element.onerror = () => {
      URL.revokeObjectURL(source);
      reject(new Error("Video metadata could not be read."));
    };
    element.src = source;
  });
}

async function capturePoster(file: File) {
  return new Promise<string>((resolve) => {
    const source = URL.createObjectURL(file);
    const element = document.createElement("video");
    element.preload = "auto";
    element.muted = true;
    element.onloadedmetadata = () => {
      element.currentTime = Math.min(1, Math.max(0, element.duration / 2));
    };
    element.onseeked = () => {
      const canvas = document.createElement("canvas");
      const ratio = Math.min(1, 720 / Math.max(1, element.videoHeight));
      canvas.width = Math.max(1, Math.round(element.videoWidth * ratio));
      canvas.height = Math.max(1, Math.round(element.videoHeight * ratio));
      canvas.getContext("2d")?.drawImage(element, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(source);
      resolve(canvas.toDataURL("image/jpeg", 0.78));
    };
    element.onerror = () => {
      URL.revokeObjectURL(source);
      resolve("");
    };
    element.src = source;
  });
}

export function useCommunityDemo(): CommunityHub {
  const [organizations, setOrganizations] = useState(initialOrganizations);
  const [videos, setVideos] = useState(initialVideos);
  const [clubPosts, setClubPosts] = useState(initialClubPosts);
  const [reports, setReports] = useState<CommunityReport[]>([
    { id: 901, type: "Media comment", targetId: 5011, parentId: 501, label: "Comment on One week without single-use cups", reportedBy: "Student report" },
  ]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as {
          organizations?: Organization[];
          videos?: MediaVideo[];
          clubPosts?: ClubPost[];
          reports?: CommunityReport[];
        };
        if (parsed.organizations) setOrganizations(parsed.organizations);
        if (parsed.videos) {
          setVideos(parsed.videos);
          Promise.all(parsed.videos.filter((video) => video.localBlob).map(async (video) => {
            const blob = await readVideoBlob(video.id);
            return blob ? { id: video.id, src: URL.createObjectURL(blob) } : null;
          })).then((sources) => setVideos((current) => current.map((video) => {
            const source = sources.find((entry) => entry?.id === video.id);
            return source ? { ...video, src: source.src } : video;
          })));
        }
        if (parsed.clubPosts) setClubPosts(parsed.clubPosts);
        if (parsed.reports) setReports(parsed.reports);
      }
    } catch {
      // The built-in examples remain available if local data cannot be read.
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    const safeVideos = videos.map((video) => video.localBlob ? { ...video, src: "" } : video);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ organizations, videos: safeVideos, clubPosts, reports }));
  }, [organizations, videos, clubPosts, reports, ready]);

  const addReport: CommunityHub["addReport"] = (report) => {
    setReports((current) => [...current, { ...report, id: Date.now(), reportedBy: "Alex Chen · Student" }]);
  };

  const keepReport = (id: number) => setReports((current) => current.filter((report) => report.id !== id));

  const deleteReportedContent = (report: CommunityReport) => {
    if (report.type === "Video") setVideos((current) => current.filter((video) => video.id !== report.targetId));
    if (report.type === "Collaboration post") setClubPosts((current) => current.filter((post) => post.id !== report.targetId));
    if (report.type === "Media comment" && report.parentId) {
      setVideos((current) => current.map((video) => video.id === report.parentId
        ? { ...video, comments: video.comments.filter((comment) => comment.id !== report.targetId) }
        : video));
    }
    if (report.type === "Club comment" && report.parentId) {
      setClubPosts((current) => current.map((post) => post.id === report.parentId
        ? { ...post, comments: post.comments.filter((comment) => comment.id !== report.targetId) }
        : post));
    }
    keepReport(report.id);
  };

  const createOrganization: CommunityHub["createOrganization"] = (organization) => {
    const normalizedLeaders = organization.leaders.map((leader) => leader.trim().toLowerCase()).filter(Boolean);
    const assigned = new Set(organizations.flatMap((entry) => entry.leaders.map((leader) => leader.toLowerCase())));
    if (normalizedLeaders.some((leader) => assigned.has(leader))) return "A leader can only manage one organization.";
    const idBase = organization.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || `organization-${Date.now()}`;
    const id = organizations.some((entry) => entry.id === idBase) ? `${idBase}-${Date.now()}` : idBase;
    setOrganizations((current) => [...current, {
      ...organization,
      id,
      initials: initialsFor(organization.name),
      leaders: normalizedLeaders,
      active: true,
    }]);
    return null;
  };

  const deleteOrganization = (id: string) => {
    setOrganizations((current) => current.filter((organization) => organization.id !== id));
    setVideos((current) => current.filter((video) => {
      if (video.organizationId === id && video.localBlob) void removeVideoBlob(video.id);
      return video.organizationId !== id;
    }));
    setClubPosts((current) => current.filter((post) => post.organizationId !== id));
  };

  const resetDemo = () => {
    window.localStorage.removeItem(STORAGE_KEY);
    indexedDB.deleteDatabase("ykps-forum-media");
  };

  return {
    organizations,
    setOrganizations,
    videos,
    setVideos,
    clubPosts,
    setClubPosts,
    reports,
    addReport,
    keepReport,
    deleteReportedContent,
    createOrganization,
    deleteOrganization,
    resetDemo,
  };
}

function OrganizationAvatar({ organization, small = false }: { organization: Organization; small?: boolean }) {
  return organization.avatar
    ? <img className={`organization-avatar ${small ? "small" : ""}`} src={organization.avatar} alt="" />
    : <span className={`organization-avatar initials ${small ? "small" : ""}`} style={{ background: organization.color }}>{organization.initials}</span>;
}

function commentCount(comments: CommunityComment[]) {
  return comments.reduce((total, comment) => total + 1 + comment.replies.length, 0);
}

function ViewerAvatar({ role, organization }: { role: CommunityRole; organization?: Organization }) {
  if (role === "organization" && organization) return <OrganizationAvatar organization={organization} small />;
  return <span className="avatar small">AC</span>;
}

function viewerIdentity(role: CommunityRole, organization?: Organization) {
  if (role === "organization" && organization) return { author: organization.name, identity: "Organization", initials: organization.initials };
  if (role === "admin") return { author: "Alex Chen", identity: "StuCo Admin", initials: "AC" };
  return { author: "Alex Chen", identity: "Student", initials: "AC" };
}

function MediaPlayer({ video, poster }: { video: MediaVideo; poster?: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    setBlocked(false);
    const element = ref.current;
    if (!element) return;
    element.currentTime = 0;
    element.volume = 1;
    element.play().catch(() => setBlocked(true));
  }, [video.id, video.src]);

  return (
    <div className="media-player-shell" onClick={() => {
      if (blocked) ref.current?.play().then(() => setBlocked(false)).catch(() => undefined);
    }}>
      {video.src ? (
        <video ref={ref} key={video.id} src={video.src} poster={poster} autoPlay playsInline loop preload="metadata" />
      ) : (
        <div className="media-unavailable"><strong>Video unavailable</strong><span>The local file could not be restored.</span></div>
      )}
      {blocked && <button className="sound-start" onClick={() => ref.current?.play().then(() => setBlocked(false))}>▶ Play with sound</button>}
    </div>
  );
}

function MediaVideoPanel({
  video,
  owner,
  onOpenOrganization,
  className = "",
}: {
  video: MediaVideo;
  owner: Organization;
  onOpenOrganization: (id: string) => void;
  className?: string;
}) {
  return (
    <div className={`media-video-slide ${className}`}>
      <MediaPlayer video={video} poster={video.poster} />
      <div className="media-caption">
        <button className="organization-byline" onClick={() => onOpenOrganization(owner.id)}>
          <OrganizationAvatar organization={owner} small />
          <span><strong>{owner.name}</strong><small>{video.date}</small></span>
        </button>
        {video.title && <h2>{video.title}</h2>}
        {video.description && <p>{video.description}</p>}
      </div>
    </div>
  );
}

export function MediaPage({
  hub,
  role,
  uploadOpen,
  setUploadOpen,
  onOpenOrganization,
  notify,
}: {
  hub: CommunityHub;
  role: CommunityRole;
  uploadOpen: boolean;
  setUploadOpen: (open: boolean) => void;
  onOpenOrganization: (id: string) => void;
  notify: (message: string) => void;
}) {
  const organization = hub.organizations.find((entry) => entry.id === DEMO_ORG_ID);
  const [search, setSearch] = useState("");
  const [randomOrder] = useState(() => initialVideos.map((video) => video.id).sort(() => Math.random() - 0.5));
  const [seenAtEntry] = useState(() => new Set(hub.videos.filter((video) => video.seen).map((video) => video.id)));
  const [activeId, setActiveId] = useState<number | null>(null);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [commentDraft, setCommentDraft] = useState("");
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyDraft, setReplyDraft] = useState("");
  const [reportMenu, setReportMenu] = useState<{ type: "video" | "comment"; id: number } | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadCover, setUploadCover] = useState<string>("");
  const [uploadError, setUploadError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [slideTransition, setSlideTransition] = useState<{ fromId: number; toId: number; direction: 1 | -1 } | null>(null);
  const wheelTotal = useRef(0);
  const wheelReset = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wheelUnlock = useRef<ReturnType<typeof setTimeout> | null>(null);
  const slideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wheelLocked = useRef(false);
  const moveFeed = useRef<(direction: number) => void>(() => undefined);

  const results = useMemo(() => {
    const activeVideos = hub.videos.filter((video) => hub.organizations.find((entry) => entry.id === video.organizationId)?.active !== false);
    const query = search.trim().toLowerCase();
    if (query) {
      return activeVideos.filter((video) => {
        const owner = hub.organizations.find((entry) => entry.id === video.organizationId);
        return [owner?.name, video.title, video.description].some((value) => value?.toLowerCase().includes(query));
      }).sort((a, b) => b.createdOrder - a.createdOrder);
    }
    return activeVideos.sort((a, b) => {
      const aSeen = seenAtEntry.has(a.id);
      const bSeen = seenAtEntry.has(b.id);
      if (aSeen !== bSeen) return aSeen ? 1 : -1;
      return randomOrder.indexOf(a.id) - randomOrder.indexOf(b.id);
    });
  }, [hub.videos, hub.organizations, randomOrder, search, seenAtEntry]);

  const currentId = activeId && results.some((video) => video.id === activeId) ? activeId : results[0]?.id;
  const currentIndex = results.findIndex((video) => video.id === currentId);
  const video = results[currentIndex];
  const owner = video ? hub.organizations.find((entry) => entry.id === video.organizationId) : undefined;
  const outgoingVideo = slideTransition ? results.find((entry) => entry.id === slideTransition.fromId) : undefined;
  const outgoingOwner = outgoingVideo ? hub.organizations.find((entry) => entry.id === outgoingVideo.organizationId) : undefined;

  useEffect(() => {
    if (!video) return;
    if (activeId === null) setActiveId(video.id);
    if (!video.seen) hub.setVideos((current) => current.map((entry) => entry.id === video.id ? { ...entry, seen: true } : entry));
  }, [video?.id]);

  const move = (direction: number) => {
    if (!results.length || slideTransition) return;
    const next = Math.max(0, Math.min(results.length - 1, currentIndex + direction));
    if (next === currentIndex || !video) return;
    const nextVideo = results[next];
    setSlideTransition({ fromId: video.id, toId: nextVideo.id, direction: direction > 0 ? 1 : -1 });
    setActiveId(nextVideo.id);
    setReplyingTo(null);
    if (slideTimer.current) clearTimeout(slideTimer.current);
    slideTimer.current = setTimeout(() => setSlideTransition(null), 390);
  };
  moveFeed.current = move;

  useEffect(() => {
    const handleWheel = (event: WheelEvent) => {
      const target = event.target instanceof HTMLElement ? event.target : null;
      if (target?.closest(".media-comments, .modal-backdrop, input, textarea, select")) return;
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;

      event.preventDefault();
      if (wheelLocked.current) return;
      wheelTotal.current += event.deltaY;
      if (wheelReset.current) clearTimeout(wheelReset.current);
      wheelReset.current = setTimeout(() => { wheelTotal.current = 0; }, 180);
      if (Math.abs(wheelTotal.current) < 45) return;

      const direction = wheelTotal.current > 0 ? 1 : -1;
      moveFeed.current(direction);
      wheelTotal.current = 0;
      wheelLocked.current = true;
      wheelUnlock.current = setTimeout(() => { wheelLocked.current = false; }, 520);
    };

    window.addEventListener("wheel", handleWheel, { passive: false, capture: true });
    return () => window.removeEventListener("wheel", handleWheel, true);
  }, []);

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const previous = {
      htmlOverflow: html.style.overflow,
      htmlScrollBehavior: html.style.scrollBehavior,
      htmlOverscrollBehavior: html.style.overscrollBehavior,
      bodyOverflow: body.style.overflow,
      bodyOverscrollBehavior: body.style.overscrollBehavior,
    };
    html.style.scrollBehavior = "auto";
    window.scrollTo(0, 0);
    html.style.overflow = "hidden";
    html.style.overscrollBehavior = "none";
    body.style.overflow = "hidden";
    body.style.overscrollBehavior = "none";
    return () => {
      html.style.overflow = previous.htmlOverflow;
      html.style.scrollBehavior = previous.htmlScrollBehavior;
      html.style.overscrollBehavior = previous.htmlOverscrollBehavior;
      body.style.overflow = previous.bodyOverflow;
      body.style.overscrollBehavior = previous.bodyOverscrollBehavior;
    };
  }, []);

  useEffect(() => () => {
    if (wheelReset.current) clearTimeout(wheelReset.current);
    if (wheelUnlock.current) clearTimeout(wheelUnlock.current);
    if (slideTimer.current) clearTimeout(slideTimer.current);
  }, []);

  const addComment = () => {
    if (!video || !commentDraft.trim()) return;
    const identity = viewerIdentity(role, organization);
    hub.setVideos((current) => current.map((entry) => entry.id === video.id ? {
      ...entry,
      comments: [...entry.comments, { id: Date.now(), ...identity, text: commentDraft.trim(), owned: true, replies: [] }],
    } : entry));
    setCommentDraft("");
    notify("Comment posted");
  };

  const addReply = (commentId: number) => {
    if (!video || !replyDraft.trim()) return;
    const identity = viewerIdentity(role, organization);
    hub.setVideos((current) => current.map((entry) => entry.id === video.id ? {
      ...entry,
      comments: entry.comments.map((comment) => comment.id === commentId
        ? { ...comment, replies: [...comment.replies, { id: Date.now(), ...identity, text: replyDraft.trim(), owned: true }] }
        : comment),
    } : entry));
    setReplyDraft("");
    setReplyingTo(null);
    notify("Reply posted");
  };

  const deleteComment = (commentId: number, replyId?: number) => {
    if (!video) return;
    hub.setVideos((current) => current.map((entry) => entry.id === video.id ? {
      ...entry,
      comments: replyId
        ? entry.comments.map((comment) => comment.id === commentId ? { ...comment, replies: comment.replies.filter((reply) => reply.id !== replyId) } : comment)
        : entry.comments.filter((comment) => comment.id !== commentId),
    } : entry));
  };

  const report = () => {
    if (!video || !reportMenu) return;
    if (reportMenu.type === "video") {
      hub.addReport({ type: "Video", targetId: video.id, label: video.title || `${owner?.name ?? "Organization"} video` });
    } else {
      hub.addReport({ type: "Media comment", targetId: reportMenu.id, parentId: video.id, label: `Comment on ${video.title || "video"}` });
    }
    setReportMenu(null);
    notify("Report sent to StuCo");
  };

  const publishVideo = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!organization || !uploadFile) {
      setUploadError("Choose a video first.");
      return;
    }
    if (uploadFile.size > 500 * 1024 * 1024) {
      setUploadError("The video must be 500 MB or smaller.");
      return;
    }
    setUploading(true);
    setUploadError("");
    try {
      const metadata = await inspectVideo(uploadFile);
      if (metadata.duration > 1200) throw new Error("The video must be 20 minutes or shorter.");
      if (metadata.width <= metadata.height) throw new Error("Only landscape videos are supported.");
      const data = new FormData(event.currentTarget);
      const id = Date.now();
      const automaticPoster = uploadCover || await capturePoster(uploadFile);
      await saveVideoBlob(id, uploadFile);
      const source = URL.createObjectURL(uploadFile);
      hub.setVideos((current) => [{
        id,
        organizationId: organization.id,
        title: String(data.get("title") ?? "").trim() || undefined,
        description: String(data.get("description") ?? "").trim() || undefined,
        src: source,
        poster: automaticPoster || undefined,
        createdOrder: Math.max(0, ...current.map((entry) => entry.createdOrder)) + 1,
        date: "Just now",
        seen: false,
        localBlob: true,
        comments: [],
      }, ...current]);
      setUploadFile(null);
      setUploadCover("");
      setUploadOpen(false);
      setActiveId(id);
      notify("Video published");
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "The video could not be uploaded.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <section className="media-page">
      <div className="media-toolbar">
        <div><span className="eyebrow">CAMPUS MEDIA</span><h1>Media</h1></div>
        <label className="community-search"><span>⌕</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search organizations or videos" /></label>
      </div>

      {video && owner ? (
        <div
          className={`media-workspace ${commentsOpen ? "comments-visible" : ""}`}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown") move(1);
            if (event.key === "ArrowUp") move(-1);
          }}
          tabIndex={0}
          aria-label="Media feed. Scroll up or down to browse videos."
        >
          <div className="media-scroll-position" aria-label={`Video ${currentIndex + 1} of ${results.length}`}>
            <span>{currentIndex + 1}</span><i /><small>{results.length}</small>
          </div>
          <div className={`media-video-stack ${slideTransition ? (slideTransition.direction > 0 ? "sliding-next" : "sliding-previous") : ""}`}>
            {slideTransition && outgoingVideo && outgoingOwner && (
              <MediaVideoPanel key={outgoingVideo.id} video={outgoingVideo} owner={outgoingOwner} onOpenOrganization={onOpenOrganization} className="outgoing" />
            )}
            <MediaVideoPanel key={video.id} video={video} owner={owner} onOpenOrganization={onOpenOrganization} className={slideTransition ? "incoming" : "current"} />
          </div>
          <div className="media-actions-rail">
            <button className={commentsOpen ? "active" : ""} onClick={() => setCommentsOpen((open) => !open)}><span>◯</span><small>{commentCount(video.comments)}</small></button>
            <button onClick={() => setReportMenu({ type: "video", id: video.id })}><span>!</span><small>Report</small></button>
            {role === "organization" && video.organizationId === DEMO_ORG_ID && (
              <button className="danger-action" onClick={() => {
                hub.setVideos((current) => current.filter((entry) => entry.id !== video.id));
                if (video.localBlob) void removeVideoBlob(video.id);
                notify("Video deleted");
              }}><span>×</span><small>Delete</small></button>
            )}
          </div>

          {commentsOpen && (
            <aside className="media-comments">
              <div className="comments-heading"><strong>Comments</strong><span>{commentCount(video.comments)}</span><button onClick={() => setCommentsOpen(false)} aria-label="Close comments">×</button></div>
              <div className="media-comment-list">
                {video.comments.length === 0 && <div className="community-empty compact"><strong>No comments yet</strong><span>Start the conversation.</span></div>}
                {video.comments.map((comment) => (
                  <div className="social-comment" key={comment.id}>
                    <span className="avatar small">{comment.initials}</span>
                    <div>
                      <div className="social-comment-meta"><strong>{comment.author}</strong><small>{comment.identity}</small></div>
                      <p>{comment.text}</p>
                      <div className="social-comment-actions">
                        <button onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}>Reply</button>
                        {comment.owned && <button onClick={() => deleteComment(comment.id)}>Delete</button>}
                        {!comment.owned && <button onClick={() => setReportMenu({ type: "comment", id: comment.id })}>Report</button>}
                      </div>
                      {comment.replies.map((reply) => (
                        <div className="social-reply" key={reply.id}>
                          <span className="avatar tiny">{reply.initials}</span>
                          <div><span><strong>{reply.author}</strong> · {reply.identity}</span><p>{reply.text}</p>{reply.owned && <button onClick={() => deleteComment(comment.id, reply.id)}>Delete</button>}</div>
                        </div>
                      ))}
                      {replyingTo === comment.id && (
                        <div className="inline-reply"><input autoFocus value={replyDraft} onChange={(event) => setReplyDraft(event.target.value)} placeholder={`Reply to ${comment.author}`} /><button onClick={() => addReply(comment.id)}>Post</button></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="social-comment-composer">
                <ViewerAvatar role={role} organization={organization} />
                <input value={commentDraft} onChange={(event) => setCommentDraft(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") addComment(); }} placeholder="Add a comment" />
                <button onClick={addComment}>Post</button>
              </div>
            </aside>
          )}
        </div>
      ) : (
        <div className="community-empty"><strong>No videos found</strong><span>Try a different search.</span></div>
      )}

      {uploadOpen && role === "organization" && (
        <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setUploadOpen(false); }}>
          <form className="modal-card media-upload-modal" onSubmit={publishVideo}>
            <div className="modal-heading"><div><span className="eyebrow">ORGANIZATION VIDEO</span><h2>Publish to Media</h2></div><button type="button" onClick={() => setUploadOpen(false)} aria-label="Close">×</button></div>
            <label className="video-file-drop">Landscape video<input type="file" accept="video/mp4,video/quicktime,.mp4,.mov" required onChange={(event) => setUploadFile(event.target.files?.[0] ?? null)} /><span>{uploadFile ? uploadFile.name : "Choose an MP4 or MOV file"}</span><small>16:9 recommended · Up to 20 minutes · 500 MB</small></label>
            <div className="form-two-column">
              <label>Title <span>Optional</span><input name="title" maxLength={80} placeholder="Add a title" /></label>
              <label>Custom cover <span>Optional</span><input type="file" accept="image/*" onChange={async (event) => {
                const file = event.target.files?.[0];
                if (file) setUploadCover((await imageFilesToDataUrls([file]))[0]);
              }} /></label>
            </div>
            <label>Description <span>Optional</span><textarea name="description" maxLength={240} placeholder="Add context for your video" /></label>
            {uploadCover && <img className="cover-preview" src={uploadCover} alt="Custom cover preview" />}
            {uploadError && <p className="form-error">{uploadError}</p>}
            <div className="identity-note"><OrganizationAvatar organization={organization!} small /><span>Publishing as <strong>{organization?.name}</strong></span></div>
            <div className="modal-actions"><button type="button" onClick={() => setUploadOpen(false)}>Cancel</button><button className="submit" disabled={uploading}>{uploading ? "Saving…" : "Publish video"}</button></div>
          </form>
        </div>
      )}

      {reportMenu && (
        <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setReportMenu(null); }}>
          <div className="modal-card small-modal">
            <div className="modal-heading"><div><span className="eyebrow warning">PRIVATE</span><h2>Send report?</h2></div><button onClick={() => setReportMenu(null)} aria-label="Close">×</button></div>
            <p className="modal-note">StuCo will review the content manually. It stays visible until a decision is made.</p>
            <div className="modal-actions"><button onClick={() => setReportMenu(null)}>Cancel</button><button className="submit danger-submit" onClick={report}>Report</button></div>
          </div>
        </div>
      )}
    </section>
  );
}

export function ClubsPage({
  hub,
  role,
  composeOpen,
  setComposeOpen,
  onOpenOrganization,
  notify,
}: {
  hub: CommunityHub;
  role: CommunityRole;
  composeOpen: boolean;
  setComposeOpen: (open: boolean) => void;
  onOpenOrganization: (id: string) => void;
  notify: (message: string) => void;
}) {
  const organization = hub.organizations.find((entry) => entry.id === DEMO_ORG_ID);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<number | null>(701);
  const [commentDrafts, setCommentDrafts] = useState<Record<number, string>>({});
  const [editTarget, setEditTarget] = useState<number | null>(null);
  const [closeTarget, setCloseTarget] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const [reportTarget, setReportTarget] = useState<{ type: "post" | "comment"; postId: number; id: number } | null>(null);
  const [draftImages, setDraftImages] = useState<string[]>([]);

  const posts = useMemo(() => {
    const query = search.trim().toLowerCase();
    return [...hub.clubPosts].filter((post) => {
      const owner = hub.organizations.find((entry) => entry.id === post.organizationId);
      return !query || [post.title, post.body, owner?.name].some((value) => value?.toLowerCase().includes(query));
    }).sort((a, b) => b.createdOrder - a.createdOrder);
  }, [hub.clubPosts, hub.organizations, search]);

  const collectPostImages = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []).slice(0, Math.max(0, 3 - draftImages.length));
    const images = await imageFilesToDataUrls(files);
    setDraftImages((current) => [...current, ...images].slice(0, 3));
    event.target.value = "";
  };

  const createPost = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!organization) return;
    const data = new FormData(event.currentTarget);
    const title = String(data.get("title") ?? "").trim();
    const body = String(data.get("body") ?? "").trim();
    if (!title || !body) return;
    const id = Date.now();
    hub.setClubPosts((current) => [{
      id,
      organizationId: organization.id,
      title,
      body,
      images: draftImages,
      date: "Just now",
      createdOrder: Math.max(0, ...current.map((post) => post.createdOrder)) + 1,
      status: "In Discussion",
      interestedOrganizationIds: [],
      comments: [],
    }, ...current]);
    setDraftImages([]);
    setComposeOpen(false);
    setExpanded(id);
    notify("Collaboration post published");
  };

  const savePost = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (editTarget === null) return;
    const data = new FormData(event.currentTarget);
    hub.setClubPosts((current) => current.map((post) => post.id === editTarget ? {
      ...post,
      title: String(data.get("title") ?? post.title).trim(),
      body: String(data.get("body") ?? post.body).trim(),
      images: draftImages,
    } : post));
    setEditTarget(null);
    setDraftImages([]);
    notify("Post updated");
  };

  const addComment = (postId: number) => {
    const text = (commentDrafts[postId] ?? "").trim();
    if (!text) return;
    const identity = viewerIdentity(role, organization);
    hub.setClubPosts((current) => current.map((post) => post.id === postId && post.status !== "Closed" ? {
      ...post,
      comments: [...post.comments, { id: Date.now(), ...identity, text, owned: true, replies: [] }],
    } : post));
    setCommentDrafts((current) => ({ ...current, [postId]: "" }));
    notify("Comment posted");
  };

  const deleteComment = (postId: number, commentId: number) => {
    hub.setClubPosts((current) => current.map((post) => post.id === postId && post.status !== "Closed"
      ? { ...post, comments: post.comments.filter((comment) => comment.id !== commentId) }
      : post));
  };

  const toggleInterest = (post: ClubPost) => {
    if (!organization || post.status === "Closed" || post.organizationId === organization.id) return;
    const interested = post.interestedOrganizationIds.includes(organization.id);
    hub.setClubPosts((current) => current.map((entry) => entry.id === post.id ? {
      ...entry,
      interestedOrganizationIds: interested
        ? entry.interestedOrganizationIds.filter((id) => id !== organization.id)
        : [...entry.interestedOrganizationIds, organization.id],
    } : entry));
    notify(interested ? "Interest removed" : "Organization added as interested");
  };

  const submitReport = () => {
    if (!reportTarget) return;
    const post = hub.clubPosts.find((entry) => entry.id === reportTarget.postId);
    if (!post) return;
    hub.addReport(reportTarget.type === "post"
      ? { type: "Collaboration post", targetId: post.id, label: post.title }
      : { type: "Club comment", targetId: reportTarget.id, parentId: post.id, label: `Comment on ${post.title}` });
    setReportTarget(null);
    notify("Report sent to StuCo");
  };

  return (
    <section className="clubs-page">
      <div className="page-heading clubs-heading">
        <div><span className="eyebrow">WORK TOGETHER</span><h1>Clubs</h1><p>Find partners for projects, events and campus initiatives.</p></div>
        <label className="community-search wide"><span>⌕</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search posts or organizations" /></label>
      </div>

      <div className="clubs-layout">
        <div className="clubs-feed">
          <div className="clubs-count"><strong>{posts.length}</strong> collaboration posts</div>
          {posts.map((post) => {
            const owner = hub.organizations.find((entry) => entry.id === post.organizationId);
            if (!owner) return null;
            const isOwner = role === "organization" && post.organizationId === DEMO_ORG_ID;
            const isInterested = !!organization && post.interestedOrganizationIds.includes(organization.id);
            return (
              <article className={`club-card ${post.status === "Closed" ? "closed" : ""}`} key={post.id}>
                <div className="club-card-top">
                  <button className="organization-byline" onClick={() => onOpenOrganization(owner.id)}>
                    <OrganizationAvatar organization={owner} small />
                    <span><strong>{owner.name}</strong><small>{post.date}</small></span>
                  </button>
                  <span className={`club-status ${post.status === "Closed" ? "closed" : "discussion"}`}>{post.status}</span>
                </div>
                <h2>{post.title}</h2>
                <p className="club-body">{post.body}</p>
                {post.images.length > 0 && <div className={`club-images images-${post.images.length}`}>{post.images.map((image, index) => <img src={image} alt={`Attachment ${index + 1} for ${post.title}`} key={`${post.id}-${index}`} />)}</div>}
                <div className="interest-panel">
                  <div><strong>Interested organizations</strong><span>{post.interestedOrganizationIds.length ? post.interestedOrganizationIds.map((id) => hub.organizations.find((entry) => entry.id === id)?.name).filter(Boolean).join(" · ") : "None yet"}</span></div>
                  {role === "organization" && !isOwner && post.status !== "Closed" && <button className={isInterested ? "interested" : ""} onClick={() => toggleInterest(post)}>{isInterested ? "✓ Interested" : "Interested"}</button>}
                </div>
                <div className="club-actions">
                  <button onClick={() => setExpanded(expanded === post.id ? null : post.id)}>◯ {commentCount(post.comments)} comments</button>
                  <button onClick={() => setReportTarget({ type: "post", postId: post.id, id: post.id })}>Report</button>
                  {isOwner && post.status !== "Closed" && <>
                    <button onClick={() => { setEditTarget(post.id); setDraftImages(post.images); }}>Edit</button>
                    <button onClick={() => setCloseTarget(post.id)}>Close</button>
                    <button className="danger-text" onClick={() => setDeleteTarget(post.id)}>Delete</button>
                  </>}
                  {post.status === "Closed" && <span className="permanent-lock">⌁ Permanently locked</span>}
                </div>

                {expanded === post.id && (
                  <div className="club-comments">
                    {post.comments.map((comment) => (
                      <div className="social-comment" key={comment.id}>
                        <span className="avatar small">{comment.initials}</span>
                        <div><div className="social-comment-meta"><strong>{comment.author}</strong><small>{comment.identity}</small></div><p>{comment.text}</p>
                          {post.status !== "Closed" && <div className="social-comment-actions">{comment.owned && <button onClick={() => deleteComment(post.id, comment.id)}>Delete</button>}{!comment.owned && <button onClick={() => setReportTarget({ type: "comment", postId: post.id, id: comment.id })}>Report</button>}</div>}
                        </div>
                      </div>
                    ))}
                    {post.status !== "Closed" ? (
                      <div className="club-comment-composer"><ViewerAvatar role={role} organization={organization} /><input value={commentDrafts[post.id] ?? ""} onChange={(event) => setCommentDrafts((current) => ({ ...current, [post.id]: event.target.value }))} onKeyDown={(event) => { if (event.key === "Enter") addComment(post.id); }} placeholder="Add a public comment" /><button onClick={() => addComment(post.id)}>Post</button></div>
                    ) : <div className="closed-note">This discussion is closed. Posts and comments are read-only.</div>}
                  </div>
                )}
              </article>
            );
          })}
          {posts.length === 0 && <div className="community-empty"><strong>No collaboration posts found</strong><span>Try another search.</span></div>}
        </div>

        <aside className="clubs-side">
          <div className="clubs-guide"><span>HOW IT WORKS</span><strong>Start with a clear idea.</strong><p>Organizations post a proposal. Others can show interest, and everyone may join the public discussion.</p></div>
          <div className="organization-list"><strong>Organizations</strong>{hub.organizations.filter((entry) => entry.active).map((entry) => <button key={entry.id} onClick={() => onOpenOrganization(entry.id)}><OrganizationAvatar organization={entry} small /><span>{entry.name}<small>{hub.videos.filter((video) => video.organizationId === entry.id).length} videos · {hub.clubPosts.filter((post) => post.organizationId === entry.id).length} posts</small></span></button>)}</div>
        </aside>
      </div>

      {composeOpen && role === "organization" && (
        <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setComposeOpen(false); }}>
          <form className="modal-card" onSubmit={createPost}>
            <div className="modal-heading"><div><span className="eyebrow">NEW COLLABORATION</span><h2>Find a partner</h2></div><button type="button" onClick={() => setComposeOpen(false)} aria-label="Close">×</button></div>
            <label>Title<input name="title" required maxLength={100} placeholder="What are you hoping to do together?" /></label>
            <label>Post<textarea name="body" required maxLength={900} placeholder="Describe the project, timing and support you need." /></label>
            <div className="upload-block"><div><strong>Images</strong><small>Optional · up to 3</small></div><label className="upload-button">＋ Add images<input type="file" accept="image/*" multiple onChange={collectPostImages} /></label></div>
            {draftImages.length > 0 && <div className="upload-previews">{draftImages.map((image, index) => <div key={image}><img src={image} alt={`Upload ${index + 1}`} /><button type="button" onClick={() => setDraftImages((current) => current.filter((entry) => entry !== image))}>×</button></div>)}</div>}
            <div className="identity-note"><OrganizationAvatar organization={organization!} small /><span>Publishing as <strong>{organization?.name}</strong></span></div>
            <div className="modal-actions"><button type="button" onClick={() => setComposeOpen(false)}>Cancel</button><button className="submit">Publish post</button></div>
          </form>
        </div>
      )}

      {editTarget !== null && (() => {
        const post = hub.clubPosts.find((entry) => entry.id === editTarget);
        if (!post) return null;
        return <div className="modal-backdrop"><form className="modal-card" onSubmit={savePost}>
          <div className="modal-heading"><div><span className="eyebrow">IN DISCUSSION</span><h2>Edit collaboration post</h2></div><button type="button" onClick={() => setEditTarget(null)} aria-label="Close">×</button></div>
          <label>Title<input name="title" required maxLength={100} defaultValue={post.title} /></label>
          <label>Post<textarea name="body" required maxLength={900} defaultValue={post.body} /></label>
          <div className="upload-block"><div><strong>Images</strong><small>Up to 3</small></div><label className="upload-button">＋ Add images<input type="file" accept="image/*" multiple onChange={collectPostImages} /></label></div>
          {draftImages.length > 0 && <div className="upload-previews">{draftImages.map((image) => <div key={image}><img src={image} alt="Post attachment" /><button type="button" onClick={() => setDraftImages((current) => current.filter((entry) => entry !== image))}>×</button></div>)}</div>}
          <div className="modal-actions"><button type="button" onClick={() => setEditTarget(null)}>Cancel</button><button className="submit">Save changes</button></div>
        </form></div>;
      })()}

      {closeTarget !== null && <div className="modal-backdrop"><div className="modal-card small-modal"><div className="modal-heading"><div><span className="eyebrow warning">PERMANENT</span><h2>Close this discussion?</h2></div><button onClick={() => setCloseTarget(null)}>×</button></div><p className="modal-note">The post, interested list and comments will become permanently read-only. It cannot be reopened.</p><div className="modal-actions"><button onClick={() => setCloseTarget(null)}>Cancel</button><button className="submit danger-submit" onClick={() => { hub.setClubPosts((current) => current.map((post) => post.id === closeTarget ? { ...post, status: "Closed" } : post)); setCloseTarget(null); notify("Discussion permanently closed"); }}>Close permanently</button></div></div></div>}

      {deleteTarget !== null && <div className="modal-backdrop"><div className="modal-card small-modal"><div className="modal-heading"><div><span className="eyebrow warning">DELETE</span><h2>Delete this post?</h2></div><button onClick={() => setDeleteTarget(null)}>×</button></div><p className="modal-note">The post and all comments will be removed.</p><div className="modal-actions"><button onClick={() => setDeleteTarget(null)}>Cancel</button><button className="submit danger-submit" onClick={() => { hub.setClubPosts((current) => current.filter((post) => post.id !== deleteTarget)); setDeleteTarget(null); notify("Post deleted"); }}>Delete</button></div></div></div>}

      {reportTarget && <div className="modal-backdrop"><div className="modal-card small-modal"><div className="modal-heading"><div><span className="eyebrow warning">PRIVATE</span><h2>Send report?</h2></div><button onClick={() => setReportTarget(null)}>×</button></div><p className="modal-note">StuCo will review the content manually.</p><div className="modal-actions"><button onClick={() => setReportTarget(null)}>Cancel</button><button className="submit danger-submit" onClick={submitReport}>Report</button></div></div></div>}
    </section>
  );
}

export function OrganizationPage({
  hub,
  organizationId,
  role,
  onOpenMedia,
  onBack,
  notify,
}: {
  hub: CommunityHub;
  organizationId: string;
  role: CommunityRole;
  onOpenMedia: () => void;
  onBack: () => void;
  notify: (message: string) => void;
}) {
  const organization = hub.organizations.find((entry) => entry.id === organizationId);
  const [tab, setTab] = useState<"videos" | "posts">("videos");
  const [editing, setEditing] = useState(false);
  const [avatarDraft, setAvatarDraft] = useState(organization?.avatar ?? "");
  if (!organization) return <section className="organization-page"><div className="community-empty"><strong>Organization not found</strong><button onClick={onBack}>Back to Clubs</button></div></section>;
  const canEdit = role === "organization" && organization.id === DEMO_ORG_ID;
  const videos = hub.videos.filter((video) => video.organizationId === organization.id).sort((a, b) => b.createdOrder - a.createdOrder);
  const posts = hub.clubPosts.filter((post) => post.organizationId === organization.id).sort((a, b) => b.createdOrder - a.createdOrder);

  const saveProfile = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    hub.setOrganizations((current) => current.map((entry) => entry.id === organization.id ? {
      ...entry,
      name: String(data.get("name") ?? entry.name).trim(),
      description: String(data.get("description") ?? entry.description).trim(),
      avatar: avatarDraft || undefined,
    } : entry));
    setEditing(false);
    notify("Organization profile updated");
  };

  return (
    <section className="organization-page">
      <button className="back-link" onClick={onBack}>← Back</button>
      <div className="organization-hero">
        <OrganizationAvatar organization={organization} />
        <div><span className="eyebrow">ORGANIZATION</span><h1>{organization.name}</h1><p>{organization.description}</p><span className={`account-state ${organization.active ? "active" : "paused"}`}>{organization.active ? "Active organization" : "Publishing paused"}</span></div>
        {canEdit && <button className="secondary-button" onClick={() => { setAvatarDraft(organization.avatar ?? ""); setEditing(true); }}>Edit profile</button>}
      </div>
      <div className="profile-stats"><span><strong>{videos.length}</strong> videos</span><span><strong>{posts.length}</strong> collaboration posts</span><span><strong>{organization.leaders.length}</strong> leader{organization.leaders.length === 1 ? "" : "s"}</span></div>
      <div className="profile-tabs"><button className={tab === "videos" ? "active" : ""} onClick={() => setTab("videos")}>Videos</button><button className={tab === "posts" ? "active" : ""} onClick={() => setTab("posts")}>Collaboration Posts</button></div>
      {tab === "videos" ? <div className="profile-video-grid">{videos.map((video) => <button key={video.id} onClick={onOpenMedia}><div>{video.poster ? <img src={video.poster} alt="" /> : <span>▶</span>}<b>▶</b></div><strong>{video.title || "Untitled video"}</strong><small>{video.date} · {commentCount(video.comments)} comments</small></button>)}</div>
        : <div className="profile-post-list">{posts.map((post) => <article key={post.id}><span className={`club-status ${post.status === "Closed" ? "closed" : "discussion"}`}>{post.status}</span><h2>{post.title}</h2><p>{post.body}</p><small>{post.date} · {commentCount(post.comments)} comments · {post.interestedOrganizationIds.length} interested</small></article>)}</div>}

      {editing && <div className="modal-backdrop"><form className="modal-card" onSubmit={saveProfile}><div className="modal-heading"><div><span className="eyebrow">ORGANIZATION PROFILE</span><h2>Edit profile</h2></div><button type="button" onClick={() => setEditing(false)}>×</button></div><label>Name<input name="name" required maxLength={60} defaultValue={organization.name} /></label><label>Description<textarea name="description" required maxLength={240} defaultValue={organization.description} /></label><label>Avatar<input type="file" accept="image/*" onChange={async (event) => { const file = event.target.files?.[0]; if (file) setAvatarDraft((await imageFilesToDataUrls([file]))[0]); }} /></label>{avatarDraft && <img className="avatar-preview" src={avatarDraft} alt="New organization avatar" />}<div className="modal-actions"><button type="button" onClick={() => setEditing(false)}>Cancel</button><button className="submit">Save profile</button></div></form></div>}
    </section>
  );
}

export function OrganizationsAdmin({ hub, notify }: { hub: CommunityHub; notify: (message: string) => void }) {
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [leaderTarget, setLeaderTarget] = useState<string | null>(null);
  const [leaderDraft, setLeaderDraft] = useState("");
  const [error, setError] = useState("");
  const [avatarDraft, setAvatarDraft] = useState("");

  const create = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const description = String(data.get("description") ?? "").trim();
    const leaders = String(data.get("leaders") ?? "").split(",");
    const result = hub.createOrganization({ name, description, leaders, color: "#118254", avatar: avatarDraft });
    if (result) {
      setError(result);
      return;
    }
    setError("");
    setAvatarDraft("");
    setCreateOpen(false);
    notify("Organization account created");
  };

  return <>
    <div className="admin-stack">
      <div className="admin-section-head"><div><h2>Organization accounts</h2><span>Created and assigned by StuCo</span></div><button className="primary-small" onClick={() => { setAvatarDraft(""); setCreateOpen(true); }}>＋ Create organization</button></div>
      {hub.organizations.map((organization) => <article className="organization-admin-row" key={organization.id}><OrganizationAvatar organization={organization} /><div><h3>{organization.name}</h3><p>{organization.description}</p><small>{organization.leaders.join(" · ")}</small></div><span className={`account-state ${organization.active ? "active" : "paused"}`}>{organization.active ? "Active" : "Paused"}</span><div className="organization-admin-actions"><button onClick={() => { setError(""); setLeaderTarget(organization.id); setLeaderDraft(organization.leaders.join(", ")); }}>Leaders</button><button onClick={() => { hub.setOrganizations((current) => current.map((entry) => entry.id === organization.id ? { ...entry, active: !entry.active } : entry)); notify(organization.active ? "Organization paused" : "Organization resumed"); }}>{organization.active ? "Pause" : "Resume"}</button><button className="danger-text" onClick={() => setDeleteTarget(organization.id)}>Delete</button></div></article>)}
    </div>
    {createOpen && <div className="modal-backdrop"><form className="modal-card" onSubmit={create}><div className="modal-heading"><div><span className="eyebrow">NEW ACCOUNT</span><h2>Create organization</h2></div><button type="button" onClick={() => setCreateOpen(false)}>×</button></div><label>Organization name<input name="name" required maxLength={60} /></label><label>Description<textarea name="description" required maxLength={240} /></label><label>Organization avatar<input type="file" required accept="image/*" onChange={async (event) => { const file = event.target.files?.[0]; if (file) setAvatarDraft((await imageFilesToDataUrls([file]))[0]); }} /></label>{avatarDraft && <img className="avatar-preview" src={avatarDraft} alt="Organization avatar preview" />}<label>Leader school email(s)<input name="leaders" required placeholder="name@school.edu, second@school.edu" /></label><p className="modal-note">Every assigned leader has the same permissions. One student can only manage one organization.</p>{error && <p className="form-error">{error}</p>}<div className="modal-actions"><button type="button" onClick={() => setCreateOpen(false)}>Cancel</button><button className="submit">Create account</button></div></form></div>}
    {leaderTarget && <div className="modal-backdrop"><form className="modal-card small-modal" onSubmit={(event) => {
      event.preventDefault();
      const leaders = leaderDraft.split(",").map((leader) => leader.trim().toLowerCase()).filter(Boolean);
      const usedElsewhere = new Set(hub.organizations.filter((entry) => entry.id !== leaderTarget).flatMap((entry) => entry.leaders.map((leader) => leader.toLowerCase())));
      if (leaders.some((leader) => usedElsewhere.has(leader))) { setError("A leader can only manage one organization."); return; }
      hub.setOrganizations((current) => current.map((entry) => entry.id === leaderTarget ? { ...entry, leaders } : entry));
      setLeaderTarget(null);
      setError("");
      notify("Organization leaders updated");
    }}><div className="modal-heading"><div><span className="eyebrow">ACCESS</span><h2>Manage leaders</h2></div><button type="button" onClick={() => setLeaderTarget(null)}>×</button></div><label>School email(s)<textarea required value={leaderDraft} onChange={(event) => setLeaderDraft(event.target.value)} placeholder="name@school.edu, second@school.edu" /></label><p className="modal-note">Separate multiple leaders with commas. All leaders receive the same permissions.</p>{error && <p className="form-error">{error}</p>}<div className="modal-actions"><button type="button" onClick={() => setLeaderTarget(null)}>Cancel</button><button className="submit">Save leaders</button></div></form></div>}
    {deleteTarget && <div className="modal-backdrop"><div className="modal-card small-modal"><div className="modal-heading"><div><span className="eyebrow warning">DELETE ACCOUNT</span><h2>Delete organization?</h2></div><button onClick={() => setDeleteTarget(null)}>×</button></div><p className="modal-note">The account, all videos, collaboration posts and comments owned by the organization will be removed.</p><div className="modal-actions"><button onClick={() => setDeleteTarget(null)}>Cancel</button><button className="submit danger-submit" onClick={() => { hub.deleteOrganization(deleteTarget); setDeleteTarget(null); notify("Organization and its content deleted"); }}>Delete everything</button></div></div></div>}
  </>;
}

export function CommunityReportsAdmin({ hub, notify }: { hub: CommunityHub; notify: (message: string) => void }) {
  return <div className="admin-stack">
    <div className="admin-section-head"><h2>Media & Clubs reports</h2><span>Manual review only</span></div>
    {hub.reports.length === 0 && <div className="empty-state"><span>✓</span><h3>All clear</h3></div>}
    {hub.reports.map((report) => <article className="community-report-row" key={report.id}><span className="report-type">{report.type}</span><div><h3>{report.label}</h3><small>{report.reportedBy}</small></div><div><button onClick={() => { hub.keepReport(report.id); notify("Content kept"); }}>Keep content</button><button className="danger" onClick={() => { hub.deleteReportedContent(report); notify("Content deleted"); }}>Delete content</button></div></article>)}
  </div>;
}

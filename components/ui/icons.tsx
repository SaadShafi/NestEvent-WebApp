import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement> & { size?: number };
const base = (size = 20) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
});

export const IconDashboard = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p} fill="currentColor" stroke="none">
    <path d="M8.5 3h-3A2.5 2.5 0 0 0 3 5.5v3A2.5 2.5 0 0 0 5.5 11h3A2.5 2.5 0 0 0 11 8.5v-3A2.5 2.5 0 0 0 8.5 3Zm10 0h-3A2.5 2.5 0 0 0 13 5.5v3a2.5 2.5 0 0 0 2.5 2.5h3A2.5 2.5 0 0 0 21 8.5v-3A2.5 2.5 0 0 0 18.5 3Zm-10 10h-3A2.5 2.5 0 0 0 3 15.5v3A2.5 2.5 0 0 0 5.5 21h3a2.5 2.5 0 0 0 2.5-2.5v-3A2.5 2.5 0 0 0 8.5 13Zm10 0h-3a2.5 2.5 0 0 0-2.5 2.5v3a2.5 2.5 0 0 0 2.5 2.5h3a2.5 2.5 0 0 0 2.5-2.5v-3a2.5 2.5 0 0 0-2.5-2.5Z" />
  </svg>
);
export const IconSearch = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
);
export const IconSocial = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <circle cx="12" cy="11" r="3" />
    <path d="M7.5 15.5a6.5 6.5 0 0 1 0-9M16.5 6.5a6.5 6.5 0 0 1 0 9M5 18a10 10 0 0 1 0-14M19 4a10 10 0 0 1 0 14M12 14v6" />
  </svg>
);
export const IconTicket = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="M3 9V7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a2.5 2.5 0 0 0 0 5v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3a2.5 2.5 0 0 0 0-5Z" />
    <path d="m12 8 .9 1.9 2.1.3-1.5 1.5.4 2.1L12 12.8l-1.9 1 .4-2.1L9 10.2l2.1-.3Z" />
  </svg>
);
export const IconMessage = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H9l-5 4Z" />
    <path d="M8 9h8M8 12.5h5" />
  </svg>
);
export const IconUser = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21a8 8 0 0 1 16 0" />
  </svg>
);
export const IconEvents = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z" />
    <path d="M14 3v5h5M9 13h6M9 17h6" />
  </svg>
);
export const IconLogout = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="M10 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4M15 8l4 4-4 4M9 12h10" />
  </svg>
);
export const IconBell = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="M6 9a6 6 0 0 1 12 0v4l1.5 3h-15L6 13Z" />
    <path d="M10 19a2 2 0 0 0 4 0" />
  </svg>
);
export const IconChevronDown = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p} strokeWidth={2.2}>
    <path d="m6 9 6 6 6-6" />
  </svg>
);
export const IconChevronRight = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p} strokeWidth={2}>
    <path d="m9 6 6 6-6 6" />
  </svg>
);
export const IconArrowLeft = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p} strokeWidth={2}>
    <path d="M19 12H5M11 6l-6 6 6 6" />
  </svg>
);
export const IconClose = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p} strokeWidth={2.2}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);
export const IconPlus = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p} strokeWidth={2.4}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);
export const IconMinus = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p} strokeWidth={2.4}>
    <path d="M5 12h14" />
  </svg>
);
export const IconCheck = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p} strokeWidth={2.6}>
    <path d="m5 12 5 5 9-10" />
  </svg>
);
export const IconCheckCircle = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p} fill="currentColor" stroke="none">
    <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm-1.2 14.4-4.1-4.1 1.6-1.6 2.5 2.5 5.3-5.3 1.6 1.6Z" />
  </svg>
);
export const IconHeart = ({ size, filled, ...p }: P & { filled?: boolean }) => (
  <svg {...base(size)} {...p} fill={filled ? "currentColor" : "none"}>
    <path d="M12 21s-7.5-4.6-9.5-9.5C1.2 8.2 3.5 4.5 7.2 4.5c2 0 3.5 1 4.8 2.7 1.3-1.7 2.8-2.7 4.8-2.7 3.7 0 6 3.7 4.7 7-2 4.9-9.5 9.5-9.5 9.5Z" />
  </svg>
);
export const IconComment = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p} fill="currentColor" stroke="none">
    <path d="M12 3C6.5 3 2 6.6 2 11c0 2.3 1.2 4.4 3.2 5.9L4 21l4.6-2.1c1.1.3 2.2.4 3.4.4 5.5 0 10-3.6 10-8.3S17.5 3 12 3Zm-4 9.3a1.3 1.3 0 1 1 0-2.6 1.3 1.3 0 0 1 0 2.6Zm4 0a1.3 1.3 0 1 1 0-2.6 1.3 1.3 0 0 1 0 2.6Zm4 0a1.3 1.3 0 1 1 0-2.6 1.3 1.3 0 0 1 0 2.6Z" />
  </svg>
);
export const IconShare = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p} fill="currentColor" stroke="none">
    <path d="M14 5v4C7.5 9.5 4.5 13.5 3 19c2.8-3.8 6.4-5.5 11-5.5V18l7-6.5Z" />
  </svg>
);
export const IconShareNodes = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4" />
  </svg>
);
export const IconBookmark = ({ size, filled, ...p }: P & { filled?: boolean }) => (
  <svg {...base(size)} {...p} fill={filled ? "currentColor" : "none"}>
    <path d="M6 3h12v18l-6-4-6 4Z" />
  </svg>
);
export const IconCalendar = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <rect x="3" y="5" width="18" height="16" rx="3" />
    <path d="M3 10h18M8 3v4M16 3v4" />
  </svg>
);
export const IconCalendarSolid = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p} fill="currentColor" stroke="none">
    <path d="M7 2h2v2h6V2h2v2h2a2 2 0 0 1 2 2v3H3V6a2 2 0 0 1 2-2h2Zm14 9v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-9Zm-12 3H7v2h2Zm4 0h-2v2h2Zm4 0h-2v2h2Z" />
  </svg>
);
export const IconClock = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
);
export const IconPin = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p} fill="currentColor" stroke="none">
    <path d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7Zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5Z" />
  </svg>
);
export const IconPinOutline = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="M12 21s-7-7.8-7-12a7 7 0 0 1 14 0c0 4.2-7 12-7 12Z" />
    <circle cx="12" cy="9" r="2.5" />
  </svg>
);
export const IconTarget = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <circle cx="12" cy="12" r="7" />
    <circle cx="12" cy="12" r="2.5" fill="currentColor" stroke="none" />
    <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
  </svg>
);
export const IconDoc = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z" />
    <path d="M14 3v5h5M9 13h6M9 17h6" />
  </svg>
);
export const IconStar = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p} fill="currentColor" stroke="none">
    <path d="m12 2 3 6.6 7 .8-5.2 4.8 1.4 7L12 17.7 5.8 21.2l1.4-7L2 9.4l7-.8Z" />
  </svg>
);
export const IconEye = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
export const IconEyeOff = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="M3 3l18 18M10.5 6.3A10.6 10.6 0 0 1 12 6c6.5 0 10 6 10 6a17 17 0 0 1-3.2 3.7M6.6 6.6C3.9 8.4 2 12 2 12s3.5 6 10 6c1.6 0 3-.3 4.2-.9" />
    <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
  </svg>
);
export const IconDownload = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p} strokeWidth={2}>
    <path d="M12 4v11M7 10l5 5 5-5M4 19h16" />
  </svg>
);
export const IconUpload = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p} strokeWidth={2}>
    <path d="M12 16V5M7 10l5-5 5 5M4 19h16" />
  </svg>
);
export const IconAttachment = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="m21 11-8.5 8.5a5 5 0 0 1-7-7L14 4a3.5 3.5 0 0 1 5 5l-8.5 8.5a2 2 0 0 1-3-3L15 7" />
  </svg>
);
export const IconSmile = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01" />
  </svg>
);
export const IconSend = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p} fill="currentColor" stroke="none">
    <path d="M3 11.5 21 3l-7 18-2.5-7.5Z" />
  </svg>
);
export const IconDots = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p} fill="currentColor" stroke="none">
    <circle cx="12" cy="5" r="1.8" />
    <circle cx="12" cy="12" r="1.8" />
    <circle cx="12" cy="19" r="1.8" />
  </svg>
);
export const IconFilter = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p} strokeWidth={2}>
    <path d="M4 7h16M4 17h16" />
    <circle cx="9" cy="7" r="2.5" fill="#0d0d0d" />
    <circle cx="15" cy="17" r="2.5" fill="#0d0d0d" />
  </svg>
);
export const IconLock = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p} fill="currentColor" stroke="none">
    <path d="M17 9V7A5 5 0 0 0 7 7v2a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2ZM9 7a3 3 0 0 1 6 0v2H9Z" />
  </svg>
);
export const IconGlobe = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p} fill="currentColor" stroke="none">
    <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm6.9 6h-3a15 15 0 0 0-1.4-3.6A8 8 0 0 1 18.9 8ZM12 4c.8 1.2 1.5 2.6 1.9 4h-3.8c.4-1.4 1.1-2.8 1.9-4ZM4.3 14a8 8 0 0 1 0-4h3.4a16 16 0 0 0 0 4Zm.8 2h3a15 15 0 0 0 1.4 3.6A8 8 0 0 1 5.1 16Zm3-8h-3a8 8 0 0 1 4.4-3.6A15 15 0 0 0 8.1 8ZM12 20c-.8-1.2-1.5-2.6-1.9-4h3.8c-.4 1.4-1.1 2.8-1.9 4Zm2.3-6H9.7a14 14 0 0 1 0-4h4.6a14 14 0 0 1 0 4Zm.2 5.6a15 15 0 0 0 1.4-3.6h3a8 8 0 0 1-4.4 3.6Zm1.8-5.6a16 16 0 0 0 0-4h3.4a8 8 0 0 1 0 4Z" />
  </svg>
);
export const IconUserLock = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p} fill="currentColor" stroke="none">
    <path d="M10 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-8 9a8 8 0 0 1 12.7-6.5A4 4 0 0 0 13 16v4Zm16-6a2 2 0 0 1 2 2v1h.5a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-5a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h.5v-1a2 2 0 0 1 2-2Zm0 1.5a.5.5 0 0 0-.5.5v1h1v-1a.5.5 0 0 0-.5-.5Z" />
  </svg>
);
export const IconKey = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p} fill="currentColor" stroke="none">
    <path d="M5 10h2v2H5zM11 10h2v2h-2zM17 10h2v2h-2z" />
    <path d="M4 9h2v4H4zM10 9h2v4h-2zM16 9h2v4h-2z" opacity=".6" />
  </svg>
);
export const IconTrash = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />
  </svg>
);
export const IconEdit = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="M4 20h4l10-10-4-4L4 16Z" />
    <path d="m12.5 7.5 4 4" />
  </svg>
);
export const IconSettingsSliders = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p} strokeWidth={2}>
    <path d="M4 8h9M17 8h3M4 16h3M11 16h9" />
    <circle cx="15" cy="8" r="2" />
    <circle cx="9" cy="16" r="2" />
  </svg>
);
export const IconPlay = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="M7 5v14l11-7Z" />
  </svg>
);
export const IconImage = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <rect x="3" y="4" width="18" height="16" rx="3" />
    <circle cx="9" cy="9" r="1.6" />
    <path d="m4 18 5-5 4 4 3-3 4 4" />
  </svg>
);
export const IconGrid = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <rect x="3" y="3" width="18" height="18" rx="3" />
    <path d="M8 8v8M12 6v12M16 9v6" />
  </svg>
);
export const IconBuilding = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="M4 21V5a2 2 0 0 1 2-2h7v18M13 9h5a2 2 0 0 1 2 2v10M8 7h2M8 11h2M8 15h2M16 13h2M16 17h2" />
  </svg>
);
export const IconTeam = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p} fill="currentColor" stroke="none">
    <path d="M12 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm-6 1a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Zm12 0a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM12 12.5c-3 0-6 1.5-6 4V20h12v-3.5c0-2.5-3-4-6-4ZM6 13.5c-2.2 0-4 1.2-4 3V20h3v-3.5c0-1 .4-2 1.2-2.9Zm12 0c-.1 0-.2 0-.2.1.8.8 1.2 1.8 1.2 2.9V20h3v-3.5c0-1.8-1.8-3-4-3Z" />
  </svg>
);
export const IconTicketStar = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p} fill="currentColor" stroke="none">
    <path d="M22 9V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v2a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6Zm-8.3 6.4L12 14.1l-1.7 1.3.6-2.1-1.7-1.3h2.1l.7-2 .7 2h2.1l-1.7 1.3Z" />
  </svg>
);
export const IconRsvp = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p} fill="currentColor" stroke="none">
    <path fillRule="evenodd" d="M7 2h2v2h6V2h2v2h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2Zm5 16.5s-4-2.7-4-5.3a2.2 2.2 0 0 1 4-1.3 2.2 2.2 0 0 1 4 1.3c0 2.6-4 5.3-4 5.3Z" />
  </svg>
);
export const IconAnalytics = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p} fill="currentColor" stroke="none">
    <path d="M4 3h16a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Zm3 8v6h2v-6Zm4-4v10h2V7Zm4 6v4h2v-4Z" />
  </svg>
);
export const IconLink = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p} strokeWidth={2.2}>
    <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1.5 1.5M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1.5-1.5" />
  </svg>
);
export const IconPromo = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p} fill="currentColor" stroke="none">
    <path d="M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2.5a2.5 2.5 0 0 0 0 5V17a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2.5a2.5 2.5 0 0 0 0-5Zm6 2.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Zm6 3a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Zm-6.3 3.6 7-7-1.4-1.4-7 7Z" />
  </svg>
);
export const IconWarn = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v6M12 16v.5" />
  </svg>
);
export const IconVerified = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p} fill="currentColor" stroke="none">
    <path d="M12 1.5 14.6 4l3.5-.5.9 3.4 3 1.8-1.4 3.3 1.4 3.3-3 1.8-.9 3.4-3.5-.5L12 22.5 9.4 20l-3.5.5-.9-3.4-3-1.8L3.4 12 2 8.7l3-1.8.9-3.4L9.4 4Zm-1.3 13.9 5.6-5.6-1.4-1.4-4.2 4.2-2-2-1.4 1.4Z" />
  </svg>
);
export const IconMail = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p} fill="currentColor" stroke="none">
    <path d="M3 5h18a1 1 0 0 1 1 1v.6l-10 6.2L2 6.6V6a1 1 0 0 1 1-1Zm-1 4 10 6.2L22 9v9a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1Z" />
  </svg>
);
export const IconPhone = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p} fill="currentColor" stroke="none">
    <path d="M6.6 10.8a15.2 15.2 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25c1.1.37 2.3.57 3.6.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1Z" />
  </svg>
);
export const IconAppleLogo = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p} fill="currentColor" stroke="none">
    <path d="M16.4 12.6c0-2.4 2-3.5 2-3.6-1.1-1.6-2.8-1.8-3.4-1.8-1.4-.1-2.8.9-3.5.9-.7 0-1.8-.8-3-.8-1.5 0-3 .9-3.8 2.3-1.6 2.8-.4 7 1.2 9.3.8 1.1 1.7 2.4 2.9 2.3 1.2 0 1.6-.8 3-.8s1.8.8 3 .7c1.3 0 2.1-1.1 2.8-2.3.9-1.3 1.3-2.6 1.3-2.7 0 0-2.5-1-2.5-3.5ZM14.1 5.7c.6-.8 1.1-1.9.9-3-.9 0-2 .6-2.7 1.4-.6.7-1.1 1.8-1 2.9 1.1.1 2.1-.5 2.8-1.3Z" />
  </svg>
);
export const IconGoogleLogo = ({ size = 20 }: P) => (
  <svg width={size} height={size} viewBox="0 0 48 48">
    <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.4-.4-3.5Z" />
    <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7Z" />
    <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44Z" />
    <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3a12 12 0 0 1-4.1 5.6l6.2 5.2C36.9 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5Z" />
  </svg>
);
export const IconInstagram = ({ size = 20 }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <defs>
      <linearGradient id="ig" x1="0" y1="1" x2="1" y2="0">
        <stop offset="0" stopColor="#f9ce34" />
        <stop offset=".5" stopColor="#ee2a7b" />
        <stop offset="1" stopColor="#6228d7" />
      </linearGradient>
    </defs>
    <circle cx="12" cy="12" r="12" fill="url(#ig)" />
    <rect x="6.5" y="6.5" width="11" height="11" rx="3.2" fill="none" stroke="#fff" strokeWidth="1.5" />
    <circle cx="12" cy="12" r="2.6" fill="none" stroke="#fff" strokeWidth="1.5" />
    <circle cx="15.3" cy="8.7" r=".8" fill="#fff" />
  </svg>
);
export const IconX = ({ size = 20 }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="12" fill="#1d1d1d" />
    <path fill="#fff" d="m7 7 4 5.2L7 17h1.6l3.1-3.8 2.9 3.8H17.5l-4.2-5.5L17 7h-1.6l-2.8 3.4L10 7Z" />
  </svg>
);
export const IconYoutube = ({ size = 20 }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="12" fill="#ff0000" />
    <path fill="#fff" d="M17.5 9.2a1.5 1.5 0 0 0-1-1C15.6 8 12 8 12 8s-3.6 0-4.5.2a1.5 1.5 0 0 0-1 1C6.3 10.1 6.3 12 6.3 12s0 1.9.2 2.8a1.5 1.5 0 0 0 1 1c.9.2 4.5.2 4.5.2s3.6 0 4.5-.2a1.5 1.5 0 0 0 1-1c.2-.9.2-2.8.2-2.8s0-1.9-.2-2.8ZM10.8 13.9V10l3.4 1.9Z" />
  </svg>
);
export const IconSnapchat = ({ size = 20 }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="12" fill="#fffc00" />
    <path fill="#111" d="M12 6c-2 0-3.3 1.4-3.3 3.3v1.6c-.3.1-.7 0-1 0-.3 0-.5.2-.4.5.1.4.9.6 1.3.8-.2.7-1 2-2.6 2.4v.6c1 .2 1.2.4 1.4 1 .7-.1 1.4-.2 2 .3.6.5 1.4 1 2.6 1s2-.5 2.6-1c.6-.5 1.3-.4 2-.3.2-.6.4-.8 1.4-1v-.6c-1.6-.4-2.4-1.7-2.6-2.4.4-.2 1.2-.4 1.3-.8.1-.3-.1-.5-.4-.5-.3 0-.7.1-1 0V9.3C15.3 7.4 14 6 12 6Z" />
  </svg>
);
export const IconMastercard = ({ size = 28 }: P) => (
  <svg width={size} height={size * 0.62} viewBox="0 0 32 20">
    <circle cx="12" cy="10" r="8" fill="#eb001b" />
    <circle cx="20" cy="10" r="8" fill="#f79e1b" fillOpacity=".95" />
  </svg>
);
export const IconTicketedEvent = ({ size = 44 }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="#ff6a00">
    <path d="M22 9V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v2a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6Zm-8.3 6.4L12 14.1l-1.7 1.3.6-2.1-1.7-1.3h2.1l.7-2 .7 2h2.1l-1.7 1.3Z" />
  </svg>
);
export const IconExplore = ({ size = 40 }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="#ff6a00">
    <path d="M13.5 3a3.5 3.5 0 0 1 3.5 3.5c0 .6-.15 1.2-.4 1.7l3.6 3.6-1.4 1.4-3.6-3.6a3.5 3.5 0 1 1-1.7-6.6ZM5 12l4 4-6 5 5-6-4-4ZM3 21l2-2 1 1-2 2Zm7-6.5 1.5 1.5-7.5 5-1-1Z" />
  </svg>
);
export const IconOrganizerMask = ({ size = 40 }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="#ff6a00">
    <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20ZM8.5 9.5A1.5 1.5 0 1 1 8.5 12.5a1.5 1.5 0 0 1 0-3Zm7 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 18c-2.5 0-4.5-1.6-5-3.6h10c-.5 2-2.5 3.6-5 3.6Z" />
  </svg>
);

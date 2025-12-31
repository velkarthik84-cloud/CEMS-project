// Event Categories
export const EVENT_CATEGORIES = [
  { value: 'workshop', label: 'Workshop' },
  { value: 'seminar', label: 'Seminar' },
  { value: 'exam', label: 'Exam' },
  { value: 'cultural', label: 'Cultural' },
  { value: 'training', label: 'Training' },
  { value: 'conference', label: 'Conference' },
  { value: 'webinar', label: 'Webinar' },
];

// Event Types
export const EVENT_TYPES = [
  { value: 'online', label: 'Online' },
  { value: 'offline', label: 'Offline' },
];

// Event Status
export const EVENT_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  CLOSED: 'closed',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

// Payment Status
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded',
};

// Attendance Status
export const ATTENDANCE_STATUS = {
  NOT_CHECKED_IN: 'not_checked_in',
  CHECKED_IN: 'checked_in',
  CHECKED_OUT: 'checked_out',
};

// User Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
};

// Registration Status
export const REGISTRATION_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
};

// Sidebar Navigation Items
export const ADMIN_NAV_ITEMS = [
  { path: '/admin', label: 'Dashboard', icon: 'LayoutDashboard' },
  { path: '/admin/events', label: 'Events', icon: 'Calendar' },
  { path: '/admin/events/create', label: 'Create Event', icon: 'PlusCircle' },
  { path: '/admin/participants', label: 'Participants', icon: 'Users' },
  { path: '/admin/attendance', label: 'Attendance', icon: 'UserCheck' },
  { path: '/admin/payments', label: 'Payments', icon: 'CreditCard' },
  { path: '/admin/analytics', label: 'Analytics', icon: 'BarChart3' },
  { path: '/admin/settings', label: 'Settings', icon: 'Settings' },
];

// Date Format
export const DATE_FORMAT = 'MMM dd, yyyy';
export const TIME_FORMAT = 'hh:mm a';
export const DATETIME_FORMAT = 'MMM dd, yyyy hh:mm a';

// Pagination
export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

// File Upload
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
export const ALLOWED_DOCUMENT_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];

// Validation Messages
export const VALIDATION_MESSAGES = {
  REQUIRED: 'This field is required',
  INVALID_EMAIL: 'Please enter a valid email address',
  INVALID_PHONE: 'Please enter a valid 10-digit mobile number',
  MIN_LENGTH: (min) => `Minimum ${min} characters required`,
  MAX_LENGTH: (max) => `Maximum ${max} characters allowed`,
  INVALID_DATE: 'Please enter a valid date',
  FUTURE_DATE: 'Date must be in the future',
  FILE_TOO_LARGE: 'File size must be less than 5MB',
  INVALID_FILE_TYPE: 'Invalid file type',
};

// API Endpoints (for future use)
export const API_ENDPOINTS = {
  EVENTS: 'events',
  REGISTRATIONS: 'registrations',
  PAYMENTS: 'payments',
  USERS: 'users',
};

// Status Badge Colors
export const STATUS_COLORS = {
  draft: { bg: 'bg-gray-100', text: 'text-gray-700' },
  published: { bg: 'bg-green-100', text: 'text-green-700' },
  closed: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  completed: { bg: 'bg-blue-100', text: 'text-blue-700' },
  cancelled: { bg: 'bg-red-100', text: 'text-red-700' },
  pending: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  confirmed: { bg: 'bg-green-100', text: 'text-green-700' },
  failed: { bg: 'bg-red-100', text: 'text-red-700' },
};

// Chart Colors
export const CHART_COLORS = [
  '#1E3A5F',
  '#E91E63',
  '#10B981',
  '#F59E0B',
  '#3B82F6',
  '#8B5CF6',
  '#EC4899',
  '#14B8A6',
];

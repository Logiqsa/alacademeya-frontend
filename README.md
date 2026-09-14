# 🎓 Alacademeya Frontend

The web application for **Alacademeya**, an educational platform built with React and Vite. It provides dedicated experiences for students, parents, teachers, instructors, and administrators.

## ✨ Features

- 📚 Browse and purchase courses and manage educational content.
- 🧑‍🏫 Dedicated teacher and instructor dashboards for managing students and earnings.
- 🛡️ Administration tools for users, course reviews, payments, and media security.
- 🎬 Custom video and audio player with keyboard shortcuts.
- 🔔 Real-time notifications with read and unread states.
- 💬 Real-time messaging, groups, sessions, schedules, and assignments.
- 🌍 Responsive Arabic-first RTL interface across desktop and mobile devices.

## 🧰 Technology Stack

| Area | Technologies |
| --- | --- |
| UI | React 19, React Router |
| Build tooling | Vite 8 |
| Styling | Tailwind CSS 4, Lucide React |
| Data fetching | Axios, TanStack Query |
| Forms and validation | React Hook Form, Zod |
| Real-time communication | Socket.IO Client |
| Testing | Node.js Test Runner |

## 🚀 Getting Started

### Prerequisites

- A recent Node.js version compatible with Vite 8.
- npm.
- A running instance of the [Alacademeya Backend](https://github.com/Logiqsa/alacademeya-backend).

### Installation

```bash
git clone https://github.com/Logiqsa/alacademeya-frontend.git
cd alacademeya-frontend
npm install
npm run dev
```

## 📜 Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run code-quality checks |
| `npm test` | Run the test suite |

## 🗂️ Project Structure

```text
src/
├── components/   # Shared and role-specific components
├── features/     # Course, finance, and earnings features
├── pages/        # Application pages
├── services/     # API requests and URL configuration
├── api/          # Socket hooks and data interfaces
├── context/      # Shared authentication state
├── guards/       # Route and permission guards
└── utils/        # Formatting and utility helpers
```

## 🔐 Security Notes

- Media playback sessions and temporary media URLs are issued by the backend.
- The backend remains the source of truth for authentication and authorization.
- Keep dependencies updated and run security checks before production deployments.

## ✅ Before Submitting Changes

```bash
npm test
npm run build
npm run lint
```

## 📄 License

This is proprietary software developed for Alacademeya. All rights reserved.

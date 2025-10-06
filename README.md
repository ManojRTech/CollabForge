# CollabForge

**CollabForge** is a web-based platform connecting clients with tech professionals for project-based work. Users can post projects, manage projects, track progress, communicate via chat, and handle requests seamlessly.

---

## Features

- **User Authentication:** Sign up, login, and manage profiles securely.
- **Project Management:** Create, edit, and delete tasks/projects with deadlines, categories, and status.
- **Requests System:** Accept or send project collaboration requests.
- **Progress Tracking:** Track task progress and mark tasks as completed.
- **Real-time Chat:** Communicate with collaborators for each task.
- **Responsive Layout:** Intuitive UI for both desktop and mobile users.

---

## Tech Stack

- **Frontend:** React, Tailwind CSS, Lucide Icons
- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL
- **Authentication:** JWT (JSON Web Tokens)
- **WebSocket:** Real-time chat support
- **Version Control:** Git & GitHub

---

## Installation

1. **Clone the repository**
```bash
git clone https://github.com/ManojRTech/CollabForge.git
cd CollabForge
Backend setup

bash
Copy code
cd backend
npm install
cp .env.example .env
# Configure your database credentials in .env
npm start
Frontend setup

bash
Copy code
cd ../frontend
npm install
npm run dev
Access the app

Frontend: http://localhost:5173

Backend: http://localhost:5000

Usage
Sign up or login.

Create new tasks/projects and manage existing ones.

Send or approve collaboration requests.

Track task progress and communicate using the chat feature.

Future Enhancements
Notifications and email alerts.

Advanced analytics for task performance.


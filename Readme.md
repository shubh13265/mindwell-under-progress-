TEAM - ERROR_404 || 
LEADER- SHUBHAM KUMAR

 # Video link :

https://drive.google.com/file/d/1_U2js8KEHa6gfOaeAkOwB9R3iiSkv_pm/view?usp=drivesdk 

# MindWell

MindWell is a comprehensive wellness application designed to help users track their mood, engage in wellness exercises, chat with an AI assistant, and monitor their progress over time. The app aims to support mental and physical well-being through an intuitive and interactive interface.

## Features

- *Mood Tracking:* Record and monitor your daily mood with notes and visual indicators.
- *Wellness Exercises:* Access a variety of exercises to promote relaxation and mindfulness.
- *AI Chat Assistant:* Interact with an AI companion for support and guidance.
- *Progress Dashboard:* View your wellness journey with stats, streaks, and recent activities.
- *User Authentication:* Secure login and personalized experience.
- *Responsive Design:* Works seamlessly on desktop and mobile devices.
- *Dark Mode Support:* Comfortable viewing in low-light environments.

## Tech Stack

- *Frontend:*
  - React 18 with TypeScript
  - Vite for fast development and build
  - Tailwind CSS for styling
  - Radix UI components for accessible UI primitives
  - Framer Motion for animations
  - React Query for data fetching and caching
  - Wouter for routing

- *Backend:*
  - Node.js with Express framework
  - TypeScript for type safety
  - Drizzle ORM for database interactions
  - OpenAI API integration for AI chat assistant
  - Passport.js for authentication
  - PostgreSQL (via @neondatabase/serverless)

- *Other Tools:*
  - ESLint and Prettier for code quality
  - Cross-env for environment variable management
  - Esbuild for server bundling
  - Replit plugins for development environment enhancements

## Getting Started

### Prerequisites

- Node.js (v18 or later recommended)
- npm (comes with Node.js)
- PostgreSQL database (or use Neon serverless PostgreSQL)

### Installation

1. Clone the repository:

   bash
   git clone <repository-url>
   cd MindMate
   

2. Install dependencies:

   bash
   npm install
   

3. Set up environment variables:

   Create a .env file in the root directory and add necessary variables such as database connection strings, OpenAI API keys, and session secrets.

4. Run database migrations:

   bash
   npm run db:push
   

### Running the Project

- *Development Mode:*

  Starts the backend server with Vite dev server for frontend hot reloading.

  bash
  npm run dev
  

  On Windows, use:

  bash
  npm run dev:win
  

- *Production Mode:*

  Build the frontend and bundle the backend, then start the server.

  bash
  npm run build
  npm start
  

## Folder Structure

- client/ - React frontend source code
- server/ - Express backend source code
- shared/ - Shared schemas and types between client and server

## Thank You

Thank you for exploring MindWell! We hope this app supports your wellness journey and helps you maintain a balanced and healthy lifestyle. Contributions and feedback are always welcome.

---

Made by the team ERROR_404

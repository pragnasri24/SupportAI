# 🚀 SupportAI

SupportAI is a full-stack customer support ticket management platform that allows customers to create, manage, and track support requests while providing support agents with tools to assign, respond to, update, and resolve tickets.

The application includes secure authentication, role-based dashboards, ticket analytics, customer-agent conversations, ticket assignment, status management, priority tracking, search, and filtering.

---

## 🌐 Live Demo

### Frontend

https://support-ai-sable.vercel.app

### Backend API

https://supportai-3v3x.onrender.com

---

## ✨ Features

### 👤 Customer Features

- 🔐 Secure registration and login
- 🎫 Create support tickets
- 📋 View and manage personal tickets
- 🔎 Search tickets by title or description
- 🎯 Filter tickets by status and priority
- 📊 View ticket statistics
- 💬 Reply to support agents
- 👀 View agent responses
- 🔄 Track ticket status
- ⚡ View Open, Pending, and Closed tickets
- 📝 Edit ticket information
- 🗑️ Delete tickets

### 👨‍💼 Support Agent Features

- 🔐 Role-based agent login
- 📊 Dedicated Agent Dashboard
- 🎫 View customer support tickets
- 🔎 Search tickets, customers, agents, and emails
- 🎯 Filter tickets by status, priority, and assignment
- 👤 Assign tickets to yourself
- 🔓 Unassign tickets
- 💬 Respond directly to customers
- 🔄 Update ticket status
- 📌 Manage ticket priority
- 📈 View support ticket statistics
- 📋 Track assigned and unassigned tickets
- 🕒 Review recent support activity

---

## 🔄 Ticket Workflow

SupportAI supports an end-to-end customer support workflow:

1. A customer registers or logs into SupportAI.
2. The customer creates a support ticket.
3. The ticket appears on the Agent Dashboard.
4. A support agent can assign the ticket to themselves.
5. The agent reviews the customer's issue.
6. The agent replies to the customer through the ticket conversation.
7. The customer can view the response and reply back.
8. The agent can update the ticket status to Open, Pending, or Closed.
9. Both the customer and agent can track the conversation and ticket status.
10. The ticket can be closed once the issue has been resolved.

---

## 🛠️ Tech Stack

### Frontend

- React
- TypeScript
- Vite
- React Router
- CSS

### Backend

- Node.js
- Express.js
- TypeScript
- REST API
- JWT Authentication
- bcrypt
- Prisma ORM

### Database

- PostgreSQL
- Supabase

### Deployment

- Vercel
- Render

### Development Tools

- Visual Studio Code
- Git
- GitHub
- npm
- Prisma CLI

---

## 🏗️ Application Architecture

SupportAI follows a full-stack client-server architecture.

```text
React + TypeScript Frontend
            │
            │ HTTP / REST API
            ▼
Node.js + Express Backend
            │
            │ Prisma ORM
            ▼
      PostgreSQL Database
```

The React frontend handles the user interface and communicates with the Express backend through REST API requests.

The backend handles authentication, authorization, ticket operations, comments, agent assignments, and database communication.

Prisma ORM provides the data access layer between the backend and PostgreSQL.

---

## 👥 User Roles

SupportAI supports three application roles:

### CUSTOMER

Customers can:

- Create tickets
- View their tickets
- Search and filter tickets
- Reply to support agents
- Track ticket status
- Edit supported ticket information
- Delete supported tickets

### AGENT

Support agents can:

- Access the Agent Dashboard
- View customer tickets
- Assign and unassign tickets
- Respond to customers
- Update ticket status
- Manage support requests

### ADMIN

The database and authentication architecture also supports an `ADMIN` role for future administrative functionality.

---

## 🎫 Ticket Statuses

SupportAI supports three ticket statuses:

```text
OPEN
PENDING
CLOSED
```

### OPEN

The ticket is active and requires attention.

### PENDING

The ticket is waiting for additional action or information.

### CLOSED

The support request has been resolved or completed.

---

## 🎯 Ticket Priorities

SupportAI supports three ticket priority levels:

```text
LOW
MEDIUM
HIGH
```

These priority levels allow customers and support agents to identify the urgency of support requests.

---

## 💬 Customer-Agent Conversations

Each support ticket includes a conversation section where customers and support agents can communicate.

Replies display:

- User name
- Customer or Agent role
- Message
- Date and time

This creates a complete conversation history for each support request.

---

## 📊 Dashboard Analytics

### Customer Dashboard

The customer dashboard displays:

- Total Tickets
- Open Tickets
- Pending Tickets
- Closed Tickets

Customers can also search, filter, and sort their tickets.

### Agent Dashboard

The agent dashboard provides support-ticket visibility and tools for managing customer requests.

Agents can:

- Search tickets
- Filter by status
- Filter by priority
- Filter by assignment
- Sort tickets
- View customer information
- View reply counts
- Assign tickets
- Open ticket details

---

## 🔐 Authentication & Authorization

SupportAI uses JWT-based authentication.

After successful login:

1. The backend validates the user's credentials.
2. A JWT authentication token is generated.
3. The frontend stores the authenticated user information.
4. Protected routes check authentication and user roles.
5. Customers and agents are redirected to their appropriate dashboards.

Role-based routing prevents users from accessing dashboards that are not available to their role.

---

## 🗄️ Database Models

The application uses three primary Prisma models.

### User

Stores:

- Name
- Email
- Password
- Role
- Created tickets
- Comments
- Assigned tickets

### Ticket

Stores:

- Title
- Description
- Status
- Priority
- Customer
- Assigned agent
- Comments
- Created date
- Updated date

### Comment

Stores:

- Message
- Ticket
- User
- Created date
- Updated date

---

## 📂 Project Structure

```text
SupportAI/
│
├── client/
│   ├── public/
│   │
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── Navbar.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   │
│   │   ├── pages/
│   │   │   ├── AgentDashboard.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Home.tsx
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   └── TicketDetails.tsx
│   │   │
│   │   ├── services/
│   │   ├── styles/
│   │   ├── App.tsx
│   │   ├── index.css
│   │   └── main.tsx
│   │
│   └── package.json
│
├── server/
│   ├── prisma/
│   │   └── schema.prisma
│   │
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── scripts/
│   │   │   └── seedDemoData.ts
│   │   ├── generated/
│   │   └── server.ts
│   │
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/pragnasri24/SupportAI.git
```

Navigate into the project:

```bash
cd SupportAI
```

---

## 💻 Frontend Setup

Open a terminal and navigate to the client:

```bash
cd client
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Vite will display the local frontend URL in the terminal.

It will typically be:

```text
http://localhost:5173
```

If that port is already being used, Vite may automatically select another port such as `5174`.

---

## ⚙️ Backend Setup

Open another terminal from the SupportAI project folder:

```bash
cd server
```

Install dependencies:

```bash
npm install
```

Generate the Prisma client:

```bash
npx prisma generate
```

Start the backend:

```bash
npm run dev
```

The local backend runs on:

```text
http://localhost:5000
```

The health endpoint can be tested at:

```text
http://localhost:5000/api/health
```

---

## 🔑 Environment Variables

Create a `.env` file inside the `server` directory.

Example:

```env
DATABASE_URL=your_postgresql_database_url
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173
```

Do not commit your real `.env` file or production credentials to GitHub.

---

## 🧪 Demo Data

SupportAI includes a demo data seed script:

```text
server/src/scripts/seedDemoData.ts
```

To create the demo data, navigate to the server directory:

```bash
cd server
```

Then run:

```bash
npx ts-node src/scripts/seedDemoData.ts
```

The script creates sample tickets, customer-agent conversations, and demo accounts for testing the application.

> Note: The demo seed script is intended for development/demo environments. Do not run destructive seed operations against a production database containing important user data.

---

## 🔑 Demo Accounts

The following accounts can be used to demonstrate the customer and agent workflows when the deployed database contains the seeded demo data.

### 👤 Customer Account

**Email:** `demo.customer@supportai.com`

**Password:** `Customer123!`

### 👨‍💼 Support Agent Account

**Email:** `agent@supportai.com`

**Password:** `Agent123!`

These accounts are intended only for demonstration and testing.

---

## 📸 Application Screens

### 🏠 Home Page

The landing page introduces SupportAI and provides access to registration and login.

### 🔐 Authentication

SupportAI provides:

- Customer registration
- Secure login
- Role-based redirection

### 📊 Customer Dashboard

The customer dashboard includes:

- Ticket statistics
- Ticket search
- Status filters
- Priority filters
- Ticket sorting
- Ticket management

### 👨‍💼 Agent Dashboard

The Agent Dashboard provides:

- Customer ticket visibility
- Ticket assignment
- Assignment filtering
- Ticket search
- Status filtering
- Priority filtering
- Ticket sorting
- Support workflow management

### 🎫 Ticket Details

The ticket details page includes:

- Ticket title
- Description
- Status
- Priority
- Customer information
- Conversation history
- Customer-agent replies
- Created date
- Last updated date
- Status management
- Ticket editing and deletion controls where permitted

---

## 🔒 Security

SupportAI includes several security-focused features:

- Password hashing with bcrypt
- JWT-based authentication
- Role-based authorization
- Protected frontend routes
- Unique user email addresses
- Environment variables for sensitive configuration
- `.gitignore` protection for local secrets

---

## 📈 Future Improvements

Planned improvements include:

- 🤖 AI-generated support reply suggestions
- 🧠 Automatic ticket classification
- 😊 Customer sentiment analysis
- 📧 Email notifications
- 🔑 Password reset workflow
- 📎 File attachments
- 🔔 Real-time notifications
- 📚 Knowledge base integration
- 🌙 Dark mode
- 📊 Advanced support analytics
- 🛡️ Expanded Admin Dashboard
- 🔍 AI-powered knowledge search

---

## 🎯 Project Purpose

SupportAI was developed as a full-stack portfolio project to demonstrate practical experience with:

- Full-stack web development
- React and TypeScript
- REST API development
- Node.js and Express
- PostgreSQL database design
- Prisma ORM
- Authentication and authorization
- Role-based application workflows
- CRUD operations
- Customer support workflow design
- Cloud deployment
- Git and GitHub version control

---

## 👩‍💻 Author

**Pragnasri Bandi**

Computer Science Graduate  
University of Massachusetts Lowell

GitHub:  
https://github.com/pragnasri24

---

## 📄 License

This project is intended for educational and portfolio purposes.
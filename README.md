# LearnTrack - Learning Path & Progress Management

A full-stack CRUD application built for **House of Edtech Fullstack Developer Assignment**. LearnTrack allows instructors to create courses with modules, and learners to enroll, progress through content, and use AI-powered summarization.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Database:** PostgreSQL with Prisma ORM
- **Styling:** Tailwind CSS
- **Auth:** JWT-based (HTTP-only cookies)
- **Validation:** Zod
- **AI (Optional):** Vercel AI SDK + OpenAI for content summarization

## Features

- ✅ **CRUD Operations:** Courses, modules, enrollments, progress tracking
- ✅ **Authentication:** Sign up, sign in, sign out (JWT in HTTP-only cookies)
- ✅ **Authorization:** Role-based (Learner, Instructor, Admin)
- ✅ **Responsive UI:** Clean, accessible interface
- ✅ **AI Summarization:** Generate concise summaries of module content (optional, requires `OPENAI_API_KEY`)
- ✅ **Real-world considerations:** Validation, sanitization, error handling, security headers

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL (local or hosted: Vercel Postgres, Supabase, Neon, etc.)

### Setup

1. **Clone and install**

   ```bash
   git clone <your-repo-url>
   cd edtech
   npm install
   ```

2. **Configure environment**

   Copy `.env.example` to `.env` and set:

   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/edtech"
   JWT_SECRET="your-super-secret-jwt-key-min-32-chars"
   # Optional for AI summarization:
   OPENAI_API_KEY="sk-..."
   ```

3. **Initialize database**

   ```bash
   npx prisma db push
   npm run db:seed
   ```

4. **Run development server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

### Seed Accounts

- **Instructor:** `instructor@example.com` / `Instructor1!`
- **Learner:** `learner@example.com` / `Learner1!`

## Deployment (Vercel)

1. Connect your GitHub repo to Vercel.
2. Add environment variables: `DATABASE_URL`, `JWT_SECRET`, optionally `OPENAI_API_KEY`.
3. Use a hosted PostgreSQL (e.g. Vercel Postgres, Supabase, Neon).
4. Deploy. Vercel will run `prisma generate` and `next build`.

### Post-deploy: Run migrations

```bash
npx prisma migrate deploy
# Or for schema sync: npx prisma db push
```

Then seed if needed:

```bash
npm run db:seed
```

## Project Structure

```
src/
├── app/
│   ├── api/           # API routes (auth, courses, enrollments, AI)
│   ├── courses/       # Course pages (list, detail, new, edit)
│   ├── dashboard/     # User dashboard
│   ├── login/
│   └── register/
├── components/
├── contexts/          # Auth context
├── lib/               # DB, auth, validation, utils
prisma/
├── schema.prisma
└── seed.ts
```

## Security

- Passwords hashed with bcrypt (12 rounds)
- JWT stored in HTTP-only cookies
- Input validation with Zod
- Authorization checks on all protected routes
- SQL injection mitigated via Prisma parameterized queries

## Footer

**Your Name** — Full Stack Developer  
[GitHub Profile](https://github.com/yourusername) · [LinkedIn Profile](https://linkedin.com/in/yourusername)

---

*House of Edtech Fullstack Developer Assignment — Dec 2025*

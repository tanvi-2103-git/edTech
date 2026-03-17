import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const instructorPassword = await bcrypt.hash("Instructor1!", 12);
  const learnerPassword = await bcrypt.hash("Learner1!", 12);

  const instructor = await prisma.user.upsert({
    where: { email: "instructor@example.com" },
    update: {},
    create: {
      email: "instructor@example.com",
      password: instructorPassword,
      name: "Jane Instructor",
      role: "INSTRUCTOR",
    },
  });

  const learner = await prisma.user.upsert({
    where: { email: "learner@example.com" },
    update: {},
    create: {
      email: "learner@example.com",
      password: learnerPassword,
      name: "John Learner",
      role: "LEARNER",
    },
  });

  let course = await prisma.course.findFirst({
    where: { slug: "getting-started-with-nextjs" },
  });

  if (!course) {
    course = await prisma.course.create({
      data: {
        title: "Getting Started with Next.js",
        description:
          "Learn the fundamentals of Next.js 16, including App Router, Server Components, and data fetching.",
        slug: "getting-started-with-nextjs",
        published: true,
        creatorId: instructor.id,
      },
    });

    await prisma.module.createMany({
      data: [
        {
          title: "Introduction to Next.js",
          content: `Next.js is a React framework for building full-stack web applications.

Key features:
- Server-side rendering (SSR)
- Static site generation (SSG)
- API routes
- File-based routing
- Built-in optimization

In this module, we'll explore the core concepts that make Next.js powerful for modern web development.`,
          order: 0,
          courseId: course.id,
        },
        {
          title: "App Router Basics",
          content: `The App Router in Next.js 16 introduces a new paradigm for building applications.

Key concepts:
- Layouts and templates
- Loading and error states
- Server and Client Components
- Streaming and Suspense

Understanding these concepts will help you build faster, more responsive applications.`,
          order: 1,
          courseId: course.id,
        },
      ],
    });
  }

  const enrollment = await prisma.enrollment.upsert({
    where: {
      userId_courseId: { userId: learner.id, courseId: course.id },
    },
    update: {},
    create: {
      userId: learner.id,
      courseId: course.id,
    },
  });

  const firstModule = await prisma.module.findFirst({
    where: { courseId: course.id },
    orderBy: { order: "asc" },
  });

  if (firstModule) {
    await prisma.progress.upsert({
      where: {
        enrollmentId_moduleId: {
          enrollmentId: enrollment.id,
          moduleId: firstModule.id,
        },
      },
      update: {},
      create: {
        enrollmentId: enrollment.id,
        moduleId: firstModule.id,
        completed: true,
        completedAt: new Date(),
      },
    });
  }

  console.log("Seed complete!");
  console.log("Instructor: instructor@example.com / Instructor1!");
  console.log("Learner: learner@example.com / Learner1!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

/// <reference types="node" />
import { PrismaClient, Role, Priority, SprintStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clean up
  await prisma.activityLog.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.subtask.deleteMany();
  await prisma.taskAssignee.deleteMany();
  await prisma.task.deleteMany();
  await prisma.column.deleteMany();
  await prisma.meetingParticipant.deleteMany();
  await prisma.meeting.deleteMany();
  await prisma.sprint.deleteMany();
  await prisma.boardMember.deleteMany();
  await prisma.board.deleteMany();
  await prisma.user.deleteMany();

  const hashedPassword = await bcrypt.hash('password123', 10);
  const lubnaPassword = await bcrypt.hash('123456', 10);

  // ─── Users ──────────────────────────────────────────────────────────────────
  const pm = await prisma.user.create({
    data: {
      email: 'lubna@agiledesk.io',
      password: lubnaPassword,
      name: 'Lubna Jiffry',
      role: Role.PM,
    },
  });

  const afdhalPassword = await bcrypt.hash('afdhal123', 10);
  const afdhal = await prisma.user.create({
    data: {
      email: 'afdhal@gmail.com',
      password: afdhalPassword,
      name: 'Afdhal',
      role: Role.PM,
    },
  });

  const atheek = await prisma.user.create({
    data: {
      email: 'atheek@agiledesk.io',
      password: hashedPassword,
      name: 'Atheek',
      role: Role.ENGINEER,
    },
  });

  const sarah = await prisma.user.create({
    data: {
      email: 'sarah@agiledesk.io',
      password: hashedPassword,
      name: 'Sarah',
      role: Role.ENGINEER,
    },
  });

  const ahmad = await prisma.user.create({
    data: {
      email: 'ahmad@agiledesk.io',
      password: hashedPassword,
      name: 'Ahmad',
      role: Role.ENGINEER,
    },
  });

  // ─── Board ──────────────────────────────────────────────────────────────────
  const board = await prisma.board.create({
    data: {
      name: 'AgileDesk',
      description: 'Main product board for AgileDesk',
      ownerId: pm.id,
    },
  });

  await prisma.boardMember.createMany({
    data: [
      { boardId: board.id, userId: pm.id },
      { boardId: board.id, userId: atheek.id },
      { boardId: board.id, userId: sarah.id },
      { boardId: board.id, userId: ahmad.id },
    ],
  });

  // ─── Columns ────────────────────────────────────────────────────────────────
  const columns = await Promise.all([
    prisma.column.create({ data: { name: 'Backlog', order: 0, boardId: board.id } }),
    prisma.column.create({ data: { name: 'Sprint Ready', order: 1, boardId: board.id } }),
    prisma.column.create({ data: { name: 'In Progress', order: 2, boardId: board.id } }),
    prisma.column.create({ data: { name: 'Review', order: 3, boardId: board.id } }),
    prisma.column.create({ data: { name: 'QA', order: 4, boardId: board.id } }),
    prisma.column.create({ data: { name: 'Done', order: 5, boardId: board.id } }),
  ]);

  const [backlog, sprintReady, inProgress, review, qa, done] = columns;

  // ─── Sprint ─────────────────────────────────────────────────────────────────
  const sprint = await prisma.sprint.create({
    data: {
      name: 'Sprint 1',
      boardId: board.id,
      status: SprintStatus.ACTIVE,
      startDate: new Date(),
      endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    },
  });

  // ─── ATHEEK'S TASKS ─────────────────────────────────────────────────────────

  // Task 1 - Atheek only
  const t1 = await prisma.task.create({
    data: {
      title: 'Set up REST API with Fastify',
      description: 'Scaffold the backend API using Fastify and TypeScript. Configure routes, plugins, and error handling.',
      priority: Priority.HIGH,
      labels: ['backend', 'api'],
      storyPoints: 5,
      columnId: inProgress.id,
      boardId: board.id,
      sprintId: sprint.id,
      order: 0,
      dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
    },
  });
  await prisma.taskAssignee.create({ data: { taskId: t1.id, userId: atheek.id } });
  await prisma.subtask.createMany({
    data: [
      { title: 'Install and configure Fastify', completed: true, taskId: t1.id },
      { title: 'Set up route structure', completed: true, taskId: t1.id },
      { title: 'Add global error handler', completed: false, taskId: t1.id },
      { title: 'Write API documentation', completed: false, taskId: t1.id },
    ],
  });
  await prisma.comment.create({ data: { content: 'Route structure is looking clean, error handler next.', taskId: t1.id, authorId: atheek.id } });
  await prisma.comment.create({ data: { content: 'Good progress! Make sure to document each endpoint as you go.', taskId: t1.id, authorId: pm.id } });
  await prisma.activityLog.createMany({ data: [
    { action: 'Task created', taskId: t1.id, userId: pm.id },
    { action: 'Assigned to Atheek', taskId: t1.id, userId: pm.id },
    { action: 'Moved to In Progress', taskId: t1.id, userId: atheek.id },
  ]});

  // Task 2 - Atheek only
  const t2 = await prisma.task.create({
    data: {
      title: 'Implement JWT authentication',
      description: 'Build login, register and logout endpoints. Use bcrypt for password hashing and JWT for session tokens.',
      priority: Priority.HIGH,
      labels: ['backend', 'auth'],
      storyPoints: 4,
      columnId: sprintReady.id,
      boardId: board.id,
      sprintId: sprint.id,
      order: 0,
      dueDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
    },
  });
  await prisma.taskAssignee.create({ data: { taskId: t2.id, userId: atheek.id } });
  await prisma.subtask.createMany({ data: [
    { title: 'Create auth routes', completed: false, taskId: t2.id },
    { title: 'Add bcrypt password hashing', completed: false, taskId: t2.id },
    { title: 'Generate and verify JWT tokens', completed: false, taskId: t2.id },
  ]});
  await prisma.activityLog.createMany({ data: [
    { action: 'Task created', taskId: t2.id, userId: pm.id },
    { action: 'Assigned to Atheek', taskId: t2.id, userId: pm.id },
  ]});

  // Task 3 - Atheek only
  const t3 = await prisma.task.create({
    data: {
      title: 'Database schema and migrations',
      description: 'Design and implement the full Prisma schema. Set up all models, relations, and run initial migrations.',
      priority: Priority.CRITICAL,
      labels: ['backend', 'database'],
      storyPoints: 3,
      columnId: review.id,
      boardId: board.id,
      sprintId: sprint.id,
      order: 0,
    },
  });
  await prisma.taskAssignee.create({ data: { taskId: t3.id, userId: atheek.id } });
  await prisma.subtask.createMany({ data: [
    { title: 'Define all Prisma models', completed: true, taskId: t3.id },
    { title: 'Set up relations and indexes', completed: true, taskId: t3.id },
    { title: 'Run and verify migrations', completed: true, taskId: t3.id },
  ]});
  await prisma.comment.create({ data: { content: 'Schema looks solid. Ready for review.', taskId: t3.id, authorId: atheek.id } });
  await prisma.activityLog.createMany({ data: [
    { action: 'Task created', taskId: t3.id, userId: pm.id },
    { action: 'Assigned to Atheek', taskId: t3.id, userId: pm.id },
    { action: 'Moved to Review', taskId: t3.id, userId: atheek.id },
  ]});

  // ─── SARAH'S TASKS ──────────────────────────────────────────────────────────

  // Task 4 - Sarah only
  const t4 = await prisma.task.create({
    data: {
      title: 'Build dashboard UI',
      description: 'Design and implement the main dashboard page showing all boards, quick stats, and recent activity.',
      priority: Priority.HIGH,
      labels: ['frontend', 'ui'],
      storyPoints: 6,
      columnId: inProgress.id,
      boardId: board.id,
      sprintId: sprint.id,
      order: 1,
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    },
  });
  await prisma.taskAssignee.create({ data: { taskId: t4.id, userId: sarah.id } });
  await prisma.subtask.createMany({ data: [
    { title: 'Create board cards component', completed: true, taskId: t4.id },
    { title: 'Add empty state design', completed: true, taskId: t4.id },
    { title: 'Connect to API', completed: false, taskId: t4.id },
    { title: 'Add loading skeleton', completed: false, taskId: t4.id },
  ]});
  await prisma.comment.create({ data: { content: 'Board cards are done, now wiring up the API calls.', taskId: t4.id, authorId: sarah.id } });
  await prisma.activityLog.createMany({ data: [
    { action: 'Task created', taskId: t4.id, userId: pm.id },
    { action: 'Assigned to Sarah', taskId: t4.id, userId: pm.id },
    { action: 'Moved to In Progress', taskId: t4.id, userId: sarah.id },
  ]});

  // Task 5 - Sarah only
  const t5 = await prisma.task.create({
    data: {
      title: 'Implement task detail modal',
      description: 'Build the task detail drawer/modal with subtasks, comments, activity log, and assignee management.',
      priority: Priority.MEDIUM,
      labels: ['frontend', 'ui'],
      storyPoints: 5,
      columnId: sprintReady.id,
      boardId: board.id,
      sprintId: sprint.id,
      order: 1,
    },
  });
  await prisma.taskAssignee.create({ data: { taskId: t5.id, userId: sarah.id } });
  await prisma.subtask.createMany({ data: [
    { title: 'Design modal layout', completed: false, taskId: t5.id },
    { title: 'Add subtask checklist', completed: false, taskId: t5.id },
    { title: 'Add comments section', completed: false, taskId: t5.id },
    { title: 'Show activity feed', completed: false, taskId: t5.id },
  ]});
  await prisma.activityLog.createMany({ data: [
    { action: 'Task created', taskId: t5.id, userId: pm.id },
    { action: 'Assigned to Sarah', taskId: t5.id, userId: pm.id },
  ]});

  // ─── SHARED TASK - Atheek + Sarah ────────────────────────────────────────────

  const t6 = await prisma.task.create({
    data: {
      title: 'Real-time collaboration with Socket.io',
      description: 'Implement WebSocket rooms per board. Backend emits events, frontend listens and updates state instantly for all connected users.',
      priority: Priority.HIGH,
      labels: ['backend', 'frontend', 'realtime'],
      storyPoints: 8,
      columnId: inProgress.id,
      boardId: board.id,
      sprintId: sprint.id,
      order: 2,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });
  await prisma.taskAssignee.createMany({ data: [
    { taskId: t6.id, userId: atheek.id },
    { taskId: t6.id, userId: sarah.id },
  ]});
  await prisma.subtask.createMany({ data: [
    { title: 'Set up Socket.io server', completed: true, taskId: t6.id },
    { title: 'Create board rooms', completed: true, taskId: t6.id },
    { title: 'Emit task events from backend', completed: false, taskId: t6.id },
    { title: 'Handle events on frontend', completed: false, taskId: t6.id },
    { title: 'Test multi-user sync', completed: false, taskId: t6.id },
  ]});
  await prisma.comment.create({ data: { content: 'Socket server is up. Atheek is handling the emit side, I am wiring the frontend listeners.', taskId: t6.id, authorId: sarah.id } });
  await prisma.comment.create({ data: { content: 'Board rooms working. Will push the event emitters today.', taskId: t6.id, authorId: atheek.id } });
  await prisma.comment.create({ data: { content: 'Great teamwork on this one. Keep the momentum!', taskId: t6.id, authorId: pm.id } });
  await prisma.activityLog.createMany({ data: [
    { action: 'Task created', taskId: t6.id, userId: pm.id },
    { action: 'Assigned to Atheek and Sarah', taskId: t6.id, userId: pm.id },
    { action: 'Moved to In Progress', taskId: t6.id, userId: atheek.id },
  ]});

  // ─── AHMAD'S TASKS ──────────────────────────────────────────────────────────

  // Task 7 - Ahmad only
  const t7 = await prisma.task.create({
    data: {
      title: 'Set up CI/CD pipeline',
      description: 'Configure GitHub Actions for automated testing, building, and deployment to production.',
      priority: Priority.MEDIUM,
      labels: ['devops'],
      storyPoints: 3,
      columnId: backlog.id,
      boardId: board.id,
      order: 0,
      dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    },
  });
  await prisma.taskAssignee.create({ data: { taskId: t7.id, userId: ahmad.id } });
  await prisma.subtask.createMany({ data: [
    { title: 'Create GitHub Actions workflow', completed: false, taskId: t7.id },
    { title: 'Add build and test steps', completed: false, taskId: t7.id },
    { title: 'Configure deployment step', completed: false, taskId: t7.id },
  ]});
  await prisma.activityLog.createMany({ data: [
    { action: 'Task created', taskId: t7.id, userId: pm.id },
    { action: 'Assigned to Ahmad', taskId: t7.id, userId: pm.id },
  ]});

  // Task 8 - Ahmad only
  const t8 = await prisma.task.create({
    data: {
      title: 'Write unit and integration tests',
      description: 'Write tests for all API routes and critical frontend components. Aim for 80% coverage.',
      priority: Priority.MEDIUM,
      labels: ['testing', 'quality'],
      storyPoints: 5,
      columnId: backlog.id,
      boardId: board.id,
      sprintId: sprint.id,
      order: 1,
    },
  });
  await prisma.taskAssignee.create({ data: { taskId: t8.id, userId: ahmad.id } });
  await prisma.subtask.createMany({ data: [
    { title: 'Test auth routes', completed: false, taskId: t8.id },
    { title: 'Test board CRUD', completed: false, taskId: t8.id },
    { title: 'Test task drag and drop', completed: false, taskId: t8.id },
    { title: 'Test real-time events', completed: false, taskId: t8.id },
  ]});
  await prisma.activityLog.createMany({ data: [
    { action: 'Task created', taskId: t8.id, userId: pm.id },
    { action: 'Assigned to Ahmad', taskId: t8.id, userId: pm.id },
  ]});

  // Task 9 - Ahmad only
  const t9 = await prisma.task.create({
    data: {
      title: 'Deploy app to production',
      description: 'Deploy frontend to Vercel and backend to Railway. Set up environment variables and verify everything works in prod.',
      priority: Priority.HIGH,
      labels: ['devops', 'deployment'],
      storyPoints: 4,
      columnId: qa.id,
      boardId: board.id,
      sprintId: sprint.id,
      order: 0,
      dueDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
    },
  });
  await prisma.taskAssignee.create({ data: { taskId: t9.id, userId: ahmad.id } });
  await prisma.subtask.createMany({ data: [
    { title: 'Deploy frontend to Vercel', completed: true, taskId: t9.id },
    { title: 'Deploy backend to Railway', completed: true, taskId: t9.id },
    { title: 'Set up production env variables', completed: true, taskId: t9.id },
    { title: 'Smoke test in production', completed: false, taskId: t9.id },
  ]});
  await prisma.comment.create({ data: { content: 'Frontend and backend are live. Running smoke tests now.', taskId: t9.id, authorId: ahmad.id } });
  await prisma.comment.create({ data: { content: 'Excellent! Let me know once smoke tests pass and we can sign off.', taskId: t9.id, authorId: pm.id } });
  await prisma.activityLog.createMany({ data: [
    { action: 'Task created', taskId: t9.id, userId: pm.id },
    { action: 'Assigned to Ahmad', taskId: t9.id, userId: pm.id },
    { action: 'Moved to QA', taskId: t9.id, userId: ahmad.id },
  ]});

  // ─── Meeting ─────────────────────────────────────────────────────────────────
  const meeting = await prisma.meeting.create({
    data: {
      title: 'Sprint 1 Planning',
      description: 'Plan sprint tasks, assign work to the team, and set priorities for the next two weeks.',
      scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      boardId: board.id,
      sprintId: sprint.id,
      organizerId: pm.id,
    },
  });

  await prisma.meetingParticipant.createMany({
    data: [
      { meetingId: meeting.id, userId: pm.id },
      { meetingId: meeting.id, userId: atheek.id },
      { meetingId: meeting.id, userId: sarah.id },
      { meetingId: meeting.id, userId: ahmad.id },
    ],
  });

  const meeting2 = await prisma.meeting.create({
    data: {
      title: 'Real-time Feature Sync',
      description: 'Atheek and Sarah to sync on Socket.io implementation progress and unblock any issues.',
      scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      boardId: board.id,
      sprintId: sprint.id,
      organizerId: pm.id,
    },
  });

  await prisma.meetingParticipant.createMany({
    data: [
      { meetingId: meeting2.id, userId: pm.id },
      { meetingId: meeting2.id, userId: atheek.id },
      { meetingId: meeting2.id, userId: sarah.id },
    ],
  });

  // ─── AFDHAL'S BOARD ─────────────────────────────────────────────────────────

  const afdhalBoard = await prisma.board.create({
    data: {
      name: 'E-Commerce Platform',
      description: 'Full-stack e-commerce platform with payments, inventory, and admin dashboard',
      ownerId: afdhal.id,
    },
  });

  await prisma.boardMember.createMany({
    data: [
      { boardId: afdhalBoard.id, userId: afdhal.id },
      { boardId: afdhalBoard.id, userId: atheek.id },
      { boardId: afdhalBoard.id, userId: sarah.id },
      { boardId: afdhalBoard.id, userId: ahmad.id },
    ],
  });

  const aCols = await Promise.all([
    prisma.column.create({ data: { name: 'Backlog',      order: 0, boardId: afdhalBoard.id } }),
    prisma.column.create({ data: { name: 'Sprint Ready', order: 1, boardId: afdhalBoard.id } }),
    prisma.column.create({ data: { name: 'In Progress',  order: 2, boardId: afdhalBoard.id } }),
    prisma.column.create({ data: { name: 'Review',       order: 3, boardId: afdhalBoard.id } }),
    prisma.column.create({ data: { name: 'QA',           order: 4, boardId: afdhalBoard.id } }),
    prisma.column.create({ data: { name: 'Done',         order: 5, boardId: afdhalBoard.id } }),
  ]);
  const [aBacklog, aSprintReady, aInProgress, aReview, aQA, aDone] = aCols;

  const aSprint = await prisma.sprint.create({
    data: {
      name: 'Sprint 1 – Core Features',
      boardId: afdhalBoard.id,
      status: SprintStatus.ACTIVE,
      startDate: new Date(),
      endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    },
  });

  // Task A1 – Atheek: Product catalogue API
  const ta1 = await prisma.task.create({
    data: {
      title: 'Build product catalogue REST API',
      description: 'Create CRUD endpoints for products, categories, and stock levels. Paginate the list endpoint.',
      priority: Priority.HIGH,
      labels: ['backend', 'api'],
      storyPoints: 5,
      columnId: aInProgress.id,
      boardId: afdhalBoard.id,
      sprintId: aSprint.id,
      order: 0,
      dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
    },
  });
  await prisma.taskAssignee.create({ data: { taskId: ta1.id, userId: atheek.id } });
  await prisma.subtask.createMany({ data: [
    { title: 'Design product schema',       completed: true,  taskId: ta1.id },
    { title: 'Implement list endpoint',     completed: true,  taskId: ta1.id },
    { title: 'Implement CRUD endpoints',    completed: false, taskId: ta1.id },
    { title: 'Add pagination',              completed: false, taskId: ta1.id },
  ]});
  await prisma.comment.createMany({ data: [
    { content: 'Schema designed and list endpoint is live.', taskId: ta1.id, authorId: atheek.id },
    { content: 'Nice work! Add pagination before moving to review.', taskId: ta1.id, authorId: afdhal.id },
  ]});
  await prisma.activityLog.createMany({ data: [
    { action: 'Task created',         taskId: ta1.id, userId: afdhal.id },
    { action: 'Assigned to Atheek',   taskId: ta1.id, userId: afdhal.id },
    { action: 'Moved to In Progress', taskId: ta1.id, userId: atheek.id },
  ]});

  // Task A2 – Sarah: Product listing page
  const ta2 = await prisma.task.create({
    data: {
      title: 'Design product listing page',
      description: 'Build the public-facing product grid with search, filters by category, and sort options.',
      priority: Priority.HIGH,
      labels: ['frontend', 'ui'],
      storyPoints: 6,
      columnId: aInProgress.id,
      boardId: afdhalBoard.id,
      sprintId: aSprint.id,
      order: 1,
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    },
  });
  await prisma.taskAssignee.create({ data: { taskId: ta2.id, userId: sarah.id } });
  await prisma.subtask.createMany({ data: [
    { title: 'Design product card component', completed: true,  taskId: ta2.id },
    { title: 'Add filter sidebar',            completed: true,  taskId: ta2.id },
    { title: 'Implement search bar',          completed: false, taskId: ta2.id },
    { title: 'Connect to product API',        completed: false, taskId: ta2.id },
  ]});
  await prisma.comment.createMany({ data: [
    { content: 'Cards and sidebar look great. Starting on search now.', taskId: ta2.id, authorId: sarah.id },
    { content: 'Looks clean! Make sure mobile view is responsive.', taskId: ta2.id, authorId: afdhal.id },
  ]});
  await prisma.activityLog.createMany({ data: [
    { action: 'Task created',         taskId: ta2.id, userId: afdhal.id },
    { action: 'Assigned to Sarah',    taskId: ta2.id, userId: afdhal.id },
    { action: 'Moved to In Progress', taskId: ta2.id, userId: sarah.id },
  ]});

  // Task A3 – Atheek + Sarah: Payment integration
  const ta3 = await prisma.task.create({
    data: {
      title: 'Integrate Stripe payment gateway',
      description: 'Backend webhook and checkout session API, frontend checkout flow with card input and order confirmation.',
      priority: Priority.CRITICAL,
      labels: ['backend', 'frontend', 'payments'],
      storyPoints: 8,
      columnId: aSprintReady.id,
      boardId: afdhalBoard.id,
      sprintId: aSprint.id,
      order: 0,
      dueDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
    },
  });
  await prisma.taskAssignee.createMany({ data: [
    { taskId: ta3.id, userId: atheek.id },
    { taskId: ta3.id, userId: sarah.id },
  ]});
  await prisma.subtask.createMany({ data: [
    { title: 'Set up Stripe SDK',              completed: false, taskId: ta3.id },
    { title: 'Create checkout session API',    completed: false, taskId: ta3.id },
    { title: 'Handle Stripe webhooks',         completed: false, taskId: ta3.id },
    { title: 'Build checkout UI',              completed: false, taskId: ta3.id },
    { title: 'Add order confirmation screen',  completed: false, taskId: ta3.id },
  ]});
  await prisma.comment.create({ data: { content: 'This is a high priority item — unblock anything you need from me.', taskId: ta3.id, authorId: afdhal.id } });
  await prisma.activityLog.createMany({ data: [
    { action: 'Task created',                    taskId: ta3.id, userId: afdhal.id },
    { action: 'Assigned to Atheek and Sarah',    taskId: ta3.id, userId: afdhal.id },
  ]});

  // Task A4 – Ahmad: Admin dashboard
  const ta4 = await prisma.task.create({
    data: {
      title: 'Build admin dashboard',
      description: 'Create a protected admin panel showing orders, revenue charts, inventory levels, and user management.',
      priority: Priority.MEDIUM,
      labels: ['frontend', 'admin'],
      storyPoints: 7,
      columnId: aReview.id,
      boardId: afdhalBoard.id,
      sprintId: aSprint.id,
      order: 0,
      dueDate: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000),
    },
  });
  await prisma.taskAssignee.create({ data: { taskId: ta4.id, userId: ahmad.id } });
  await prisma.subtask.createMany({ data: [
    { title: 'Orders table with filters',  completed: true,  taskId: ta4.id },
    { title: 'Revenue chart component',    completed: true,  taskId: ta4.id },
    { title: 'Inventory management page',  completed: true,  taskId: ta4.id },
    { title: 'User management table',      completed: false, taskId: ta4.id },
  ]});
  await prisma.comment.createMany({ data: [
    { content: 'Orders table, revenue chart, and inventory page are done. User management in progress.', taskId: ta4.id, authorId: ahmad.id },
    { content: 'Solid progress! Review the UI before merging.', taskId: ta4.id, authorId: afdhal.id },
  ]});
  await prisma.activityLog.createMany({ data: [
    { action: 'Task created',       taskId: ta4.id, userId: afdhal.id },
    { action: 'Assigned to Ahmad',  taskId: ta4.id, userId: afdhal.id },
    { action: 'Moved to Review',    taskId: ta4.id, userId: ahmad.id },
  ]});

  // Task A5 – Ahmad: Docker + CI/CD
  const ta5 = await prisma.task.create({
    data: {
      title: 'Set up Docker and CI/CD pipeline',
      description: 'Dockerise all services. Configure GitHub Actions for automated tests, image builds, and Railway deployment.',
      priority: Priority.MEDIUM,
      labels: ['devops'],
      storyPoints: 4,
      columnId: aDone.id,
      boardId: afdhalBoard.id,
      sprintId: aSprint.id,
      order: 0,
    },
  });
  await prisma.taskAssignee.create({ data: { taskId: ta5.id, userId: ahmad.id } });
  await prisma.subtask.createMany({ data: [
    { title: 'Write Dockerfiles',          completed: true, taskId: ta5.id },
    { title: 'Create docker-compose file', completed: true, taskId: ta5.id },
    { title: 'Set up GitHub Actions',      completed: true, taskId: ta5.id },
    { title: 'Deploy to Railway',          completed: true, taskId: ta5.id },
  ]});
  await prisma.comment.createMany({ data: [
    { content: 'All done — pipeline is green and services are live on Railway.', taskId: ta5.id, authorId: ahmad.id },
    { content: 'Excellent! Marking this done.', taskId: ta5.id, authorId: afdhal.id },
  ]});
  await prisma.activityLog.createMany({ data: [
    { action: 'Task created',         taskId: ta5.id, userId: afdhal.id },
    { action: 'Assigned to Ahmad',    taskId: ta5.id, userId: afdhal.id },
    { action: 'Moved to Done',        taskId: ta5.id, userId: ahmad.id },
  ]});

  // Task A6 – Atheek: User auth & roles
  const ta6 = await prisma.task.create({
    data: {
      title: 'User authentication and role management',
      description: 'Implement register, login, JWT sessions, and role-based access for customer vs admin routes.',
      priority: Priority.HIGH,
      labels: ['backend', 'auth'],
      storyPoints: 5,
      columnId: aQA.id,
      boardId: afdhalBoard.id,
      sprintId: aSprint.id,
      order: 0,
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    },
  });
  await prisma.taskAssignee.create({ data: { taskId: ta6.id, userId: atheek.id } });
  await prisma.subtask.createMany({ data: [
    { title: 'Register & login endpoints',   completed: true,  taskId: ta6.id },
    { title: 'JWT middleware',               completed: true,  taskId: ta6.id },
    { title: 'Role-based route guards',      completed: true,  taskId: ta6.id },
    { title: 'Write auth tests',             completed: false, taskId: ta6.id },
  ]});
  await prisma.comment.createMany({ data: [
    { content: 'Auth endpoints and guards done. Writing tests now before QA sign-off.', taskId: ta6.id, authorId: atheek.id },
    { content: 'Great! Ping me once tests pass.', taskId: ta6.id, authorId: afdhal.id },
  ]});
  await prisma.activityLog.createMany({ data: [
    { action: 'Task created',       taskId: ta6.id, userId: afdhal.id },
    { action: 'Assigned to Atheek', taskId: ta6.id, userId: afdhal.id },
    { action: 'Moved to QA',        taskId: ta6.id, userId: atheek.id },
  ]});

  // Task A7 – Sarah: Shopping cart
  const ta7 = await prisma.task.create({
    data: {
      title: 'Implement shopping cart',
      description: 'Persistent cart stored in backend per user. Add/remove/update items, show totals, and sync with stock.',
      priority: Priority.HIGH,
      labels: ['frontend', 'backend'],
      storyPoints: 6,
      columnId: aBacklog.id,
      boardId: afdhalBoard.id,
      order: 0,
      dueDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
    },
  });
  await prisma.taskAssignee.create({ data: { taskId: ta7.id, userId: sarah.id } });
  await prisma.subtask.createMany({ data: [
    { title: 'Cart API endpoints',          completed: false, taskId: ta7.id },
    { title: 'Cart UI sidebar component',   completed: false, taskId: ta7.id },
    { title: 'Stock validation on add',     completed: false, taskId: ta7.id },
    { title: 'Persist cart across sessions',completed: false, taskId: ta7.id },
  ]});
  await prisma.activityLog.createMany({ data: [
    { action: 'Task created',      taskId: ta7.id, userId: afdhal.id },
    { action: 'Assigned to Sarah', taskId: ta7.id, userId: afdhal.id },
  ]});

  // ─── Afdhal's Sprint 2 ──────────────────────────────────────────────────────
  await prisma.sprint.create({
    data: {
      name: 'Sprint 2 – Polish & Scale',
      boardId: afdhalBoard.id,
      status: SprintStatus.PLANNED,
      startDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      endDate:   new Date(Date.now() + 29 * 24 * 60 * 60 * 1000),
    },
  });

  // ─── Afdhal's Meetings ───────────────────────────────────────────────────────
  const aMeeting1 = await prisma.meeting.create({
    data: {
      title: 'Sprint 1 Kickoff',
      description: 'Review backlog, assign tasks, and align on sprint goals for the e-commerce platform launch.',
      scheduledAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      boardId: afdhalBoard.id,
      sprintId: aSprint.id,
      organizerId: afdhal.id,
    },
  });
  await prisma.meetingParticipant.createMany({ data: [
    { meetingId: aMeeting1.id, userId: afdhal.id },
    { meetingId: aMeeting1.id, userId: atheek.id },
    { meetingId: aMeeting1.id, userId: sarah.id },
    { meetingId: aMeeting1.id, userId: ahmad.id },
  ]});

  const aMeeting2 = await prisma.meeting.create({
    data: {
      title: 'Stripe Integration Sync',
      description: 'Atheek and Sarah to align on API contract for the checkout flow before implementation starts.',
      scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      boardId: afdhalBoard.id,
      sprintId: aSprint.id,
      organizerId: afdhal.id,
    },
  });
  await prisma.meetingParticipant.createMany({ data: [
    { meetingId: aMeeting2.id, userId: afdhal.id },
    { meetingId: aMeeting2.id, userId: atheek.id },
    { meetingId: aMeeting2.id, userId: sarah.id },
  ]});

  console.log('✅ Seed complete!');
  console.log('');
  console.log('Demo accounts:');
  console.log('  PM:       lubna@agiledesk.io   / 123456');
  console.log('  PM:       afdhal@gmail.com     / afdhal123');
  console.log('  Engineer: atheek@agiledesk.io  / password123');
  console.log('  Engineer: sarah@agiledesk.io   / password123');
  console.log('  Engineer: ahmad@agiledesk.io   / password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
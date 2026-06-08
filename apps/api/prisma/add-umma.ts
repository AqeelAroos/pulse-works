/// <reference types="node" />
import { PrismaClient, Role, Priority, SprintStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // ── Upsert umma as PM ─────────────────────────────────────────────────────
  const hashedPassword = await bcrypt.hash('umma123', 10);
  const umma = await prisma.user.upsert({
    where: { email: 'umma@gmail.com' },
    update: { role: Role.PM },
    create: { email: 'umma@gmail.com', name: 'Umma', role: Role.PM, password: hashedPassword },
  });
  console.log(`✅ User ${umma.name} (${umma.email}) is now PM`);

  // ── Grab existing engineers to populate the board ─────────────────────────
  const engineers = await prisma.user.findMany({
    where: { role: Role.ENGINEER },
    take: 3,
  });

  // ── Board ─────────────────────────────────────────────────────────────────
  const board = await prisma.board.create({
    data: {
      name: 'Healthcare Portal',
      description: 'Patient management, appointments, and billing system',
      ownerId: umma.id,
    },
  });

  await prisma.boardMember.createMany({
    data: [
      { boardId: board.id, userId: umma.id },
      ...engineers.map(e => ({ boardId: board.id, userId: e.id })),
    ],
  });

  // ── Columns ───────────────────────────────────────────────────────────────
  const cols = await Promise.all([
    prisma.column.create({ data: { name: 'Backlog',      order: 0, boardId: board.id } }),
    prisma.column.create({ data: { name: 'Sprint Ready', order: 1, boardId: board.id } }),
    prisma.column.create({ data: { name: 'In Progress',  order: 2, boardId: board.id } }),
    prisma.column.create({ data: { name: 'Review',       order: 3, boardId: board.id } }),
    prisma.column.create({ data: { name: 'QA',           order: 4, boardId: board.id } }),
    prisma.column.create({ data: { name: 'Done',         order: 5, boardId: board.id } }),
  ]);
  const [backlog, sprintReady, inProgress, review, qa, done] = cols;

  // ── Sprint ────────────────────────────────────────────────────────────────
  const sprint = await prisma.sprint.create({
    data: {
      name: 'Sprint 1 – Core Features',
      boardId: board.id,
      status: SprintStatus.ACTIVE,
      startDate: new Date(),
      endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.sprint.create({
    data: {
      name: 'Sprint 2 – Polish',
      boardId: board.id,
      status: SprintStatus.PLANNED,
      startDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      endDate:   new Date(Date.now() + 29 * 24 * 60 * 60 * 1000),
    },
  });

  const [eng1, eng2, eng3] = engineers;

  // ── Task 1 – Patient registration API (eng1, In Progress) ─────────────────
  const t1 = await prisma.task.create({
    data: {
      title: 'Patient registration & profile API',
      description: 'CRUD endpoints for patient profiles: personal info, medical history, insurance details.',
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
  if (eng1) await prisma.taskAssignee.create({ data: { taskId: t1.id, userId: eng1.id } });
  await prisma.subtask.createMany({ data: [
    { title: 'Design patient schema',          completed: true,  taskId: t1.id },
    { title: 'Build create & update endpoints',completed: true,  taskId: t1.id },
    { title: 'Add input validation',           completed: false, taskId: t1.id },
    { title: 'Write API docs',                 completed: false, taskId: t1.id },
  ]});
  await prisma.comment.createMany({ data: [
    { content: 'Schema is done, validation next.', taskId: t1.id, authorId: eng1?.id ?? umma.id },
    { content: 'Great start! Remember HIPAA-safe field handling.', taskId: t1.id, authorId: umma.id },
  ]});
  await prisma.activityLog.createMany({ data: [
    { action: 'Task created',         taskId: t1.id, userId: umma.id },
    { action: 'Moved to In Progress', taskId: t1.id, userId: eng1?.id ?? umma.id },
  ]});

  // ── Task 2 – Appointment scheduling UI (eng2, In Progress) ────────────────
  const t2 = await prisma.task.create({
    data: {
      title: 'Appointment scheduling UI',
      description: 'Calendar view for doctors and patients to book, reschedule and cancel appointments.',
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
  if (eng2) await prisma.taskAssignee.create({ data: { taskId: t2.id, userId: eng2.id } });
  await prisma.subtask.createMany({ data: [
    { title: 'Calendar component',          completed: true,  taskId: t2.id },
    { title: 'Time slot picker',            completed: true,  taskId: t2.id },
    { title: 'Reschedule / cancel flow',    completed: false, taskId: t2.id },
    { title: 'Connect to appointment API',  completed: false, taskId: t2.id },
  ]});
  await prisma.comment.createMany({ data: [
    { content: 'Calendar and time slot picker are live. Working on reschedule flow.', taskId: t2.id, authorId: eng2?.id ?? umma.id },
    { content: 'Looking good! Make sure cancellation sends a notification.', taskId: t2.id, authorId: umma.id },
  ]});
  await prisma.activityLog.createMany({ data: [
    { action: 'Task created',         taskId: t2.id, userId: umma.id },
    { action: 'Moved to In Progress', taskId: t2.id, userId: eng2?.id ?? umma.id },
  ]});

  // ── Task 3 – Billing module (eng1 + eng2, Sprint Ready) ───────────────────
  const t3 = await prisma.task.create({
    data: {
      title: 'Billing and invoice module',
      description: 'Generate invoices per appointment, integrate with payment gateway, send PDF receipts by email.',
      priority: Priority.CRITICAL,
      labels: ['backend', 'frontend', 'payments'],
      storyPoints: 8,
      columnId: sprintReady.id,
      boardId: board.id,
      sprintId: sprint.id,
      order: 0,
      dueDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
    },
  });
  if (eng1) await prisma.taskAssignee.create({ data: { taskId: t3.id, userId: eng1.id } });
  if (eng2) await prisma.taskAssignee.create({ data: { taskId: t3.id, userId: eng2.id } });
  await prisma.subtask.createMany({ data: [
    { title: 'Invoice generation API',     completed: false, taskId: t3.id },
    { title: 'Payment gateway integration',completed: false, taskId: t3.id },
    { title: 'PDF receipt generation',     completed: false, taskId: t3.id },
    { title: 'Email delivery of receipts', completed: false, taskId: t3.id },
    { title: 'Billing UI page',            completed: false, taskId: t3.id },
  ]});
  await prisma.comment.create({ data: { content: 'Top priority — flag me if you hit any blockers.', taskId: t3.id, authorId: umma.id } });
  await prisma.activityLog.createMany({ data: [
    { action: 'Task created', taskId: t3.id, userId: umma.id },
  ]});

  // ── Task 4 – Doctor dashboard (eng3, Review) ──────────────────────────────
  const t4 = await prisma.task.create({
    data: {
      title: 'Doctor dashboard',
      description: 'Protected portal showing today\'s appointments, patient queue, and quick access to patient records.',
      priority: Priority.MEDIUM,
      labels: ['frontend', 'ui'],
      storyPoints: 6,
      columnId: review.id,
      boardId: board.id,
      sprintId: sprint.id,
      order: 0,
      dueDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
    },
  });
  if (eng3) await prisma.taskAssignee.create({ data: { taskId: t4.id, userId: eng3.id } });
  await prisma.subtask.createMany({ data: [
    { title: 'Appointment list for today', completed: true,  taskId: t4.id },
    { title: 'Patient quick-view panel',   completed: true,  taskId: t4.id },
    { title: 'Stats summary cards',        completed: true,  taskId: t4.id },
    { title: 'Mobile responsive layout',   completed: false, taskId: t4.id },
  ]});
  await prisma.comment.createMany({ data: [
    { content: 'Core views done. Making it responsive before submitting for review.', taskId: t4.id, authorId: eng3?.id ?? umma.id },
    { content: 'Nice work! Prioritise the mobile layout — doctors use tablets.', taskId: t4.id, authorId: umma.id },
  ]});
  await prisma.activityLog.createMany({ data: [
    { action: 'Task created',    taskId: t4.id, userId: umma.id },
    { action: 'Moved to Review', taskId: t4.id, userId: eng3?.id ?? umma.id },
  ]});

  // ── Task 5 – Auth & role management (eng1, QA) ────────────────────────────
  const t5 = await prisma.task.create({
    data: {
      title: 'Auth and role-based access control',
      description: 'Login/register for patients, doctors, and admins. Role guards on all sensitive routes.',
      priority: Priority.HIGH,
      labels: ['backend', 'auth'],
      storyPoints: 5,
      columnId: qa.id,
      boardId: board.id,
      sprintId: sprint.id,
      order: 0,
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    },
  });
  if (eng1) await prisma.taskAssignee.create({ data: { taskId: t5.id, userId: eng1.id } });
  await prisma.subtask.createMany({ data: [
    { title: 'Auth endpoints',       completed: true,  taskId: t5.id },
    { title: 'JWT middleware',       completed: true,  taskId: t5.id },
    { title: 'Role guards',          completed: true,  taskId: t5.id },
    { title: 'Auth integration tests', completed: false, taskId: t5.id },
  ]});
  await prisma.comment.createMany({ data: [
    { content: 'Auth and guards are solid. Running integration tests now.', taskId: t5.id, authorId: eng1?.id ?? umma.id },
    { content: 'Great! Ping me once tests pass and we can merge.', taskId: t5.id, authorId: umma.id },
  ]});
  await prisma.activityLog.createMany({ data: [
    { action: 'Task created',  taskId: t5.id, userId: umma.id },
    { action: 'Moved to QA',   taskId: t5.id, userId: eng1?.id ?? umma.id },
  ]});

  // ── Task 6 – Notification service (eng3, Done) ────────────────────────────
  const t6 = await prisma.task.create({
    data: {
      title: 'Email and SMS notification service',
      description: 'Automated reminders for upcoming appointments, cancellations, and billing events via email and SMS.',
      priority: Priority.MEDIUM,
      labels: ['backend', 'notifications'],
      storyPoints: 4,
      columnId: done.id,
      boardId: board.id,
      sprintId: sprint.id,
      order: 0,
    },
  });
  if (eng3) await prisma.taskAssignee.create({ data: { taskId: t6.id, userId: eng3.id } });
  await prisma.subtask.createMany({ data: [
    { title: 'Email service integration',   completed: true, taskId: t6.id },
    { title: 'SMS gateway integration',     completed: true, taskId: t6.id },
    { title: 'Appointment reminder trigger',completed: true, taskId: t6.id },
    { title: 'Billing event trigger',       completed: true, taskId: t6.id },
  ]});
  await prisma.comment.createMany({ data: [
    { content: 'All triggers are live and tested. Both email and SMS confirmed working.', taskId: t6.id, authorId: eng3?.id ?? umma.id },
    { content: 'Perfect execution. Marking this done!', taskId: t6.id, authorId: umma.id },
  ]});
  await prisma.activityLog.createMany({ data: [
    { action: 'Task created',  taskId: t6.id, userId: umma.id },
    { action: 'Moved to Done', taskId: t6.id, userId: eng3?.id ?? umma.id },
  ]});

  // ── Task 7 – Patient portal (eng2, Backlog) ───────────────────────────────
  const t7 = await prisma.task.create({
    data: {
      title: 'Patient self-service portal',
      description: 'Patients can view their history, download reports, update personal info, and manage upcoming appointments.',
      priority: Priority.MEDIUM,
      labels: ['frontend', 'ui'],
      storyPoints: 7,
      columnId: backlog.id,
      boardId: board.id,
      order: 0,
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    },
  });
  if (eng2) await prisma.taskAssignee.create({ data: { taskId: t7.id, userId: eng2.id } });
  await prisma.subtask.createMany({ data: [
    { title: 'Patient profile page',      completed: false, taskId: t7.id },
    { title: 'Appointment history view',  completed: false, taskId: t7.id },
    { title: 'Report download feature',   completed: false, taskId: t7.id },
    { title: 'Settings & preferences',    completed: false, taskId: t7.id },
  ]});
  await prisma.activityLog.createMany({ data: [
    { action: 'Task created', taskId: t7.id, userId: umma.id },
  ]});

  // ── Meetings ──────────────────────────────────────────────────────────────
  const m1 = await prisma.meeting.create({
    data: {
      title: 'Sprint 1 Kickoff',
      description: 'Align on sprint goals, assign tasks, and review the healthcare portal roadmap.',
      scheduledAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      boardId: board.id,
      sprintId: sprint.id,
      organizerId: umma.id,
    },
  });
  await prisma.meetingParticipant.createMany({ data: [
    { meetingId: m1.id, userId: umma.id },
    ...engineers.map(e => ({ meetingId: m1.id, userId: e.id })),
  ]});

  const m2 = await prisma.meeting.create({
    data: {
      title: 'Billing Module Design Review',
      description: 'Walk through the billing API contract and UI wireframes before development starts.',
      scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      boardId: board.id,
      sprintId: sprint.id,
      organizerId: umma.id,
    },
  });
  await prisma.meetingParticipant.createMany({ data: [
    { meetingId: m2.id, userId: umma.id },
    ...[eng1, eng2].filter(Boolean).map(e => ({ meetingId: m2.id, userId: e!.id })),
  ]});

  console.log('');
  console.log('✅ Done!');
  console.log(`   Role:  PM`);
  console.log(`   Email: umma@gmail.com`);
  console.log(`   Board: "Healthcare Portal" with 7 tasks, 2 sprints, 2 meetings`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());

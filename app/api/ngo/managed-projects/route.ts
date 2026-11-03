import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import { requireRole } from '@/lib/session';
import ProjectMember from '@/models/ProjectMember';
import Project from '@/models/Project';
import Issue from '@/models/Issue';
import IssueUpdate from '@/models/IssueUpdate';
import {
  ATTENDANCE_XP,
  undertakingForNgo,
  undertakingsForNgo,
  awardXpToUser,
  isValidDate,
  parseKey,
} from '@/lib/managed-projects';
import ManagedProject, { ManagedAttendance } from '@/models/ManagedProject';

async function authedNgo(req: NextRequest) {
  const auth = await requireRole(req, ['ngo']);
  return auth.user ? auth : null;
}

/**
 * NGO management workspace.
 * GET  ?detail=1&key=...  -> one undertaking with members + attendance dates
 * GET                     -> all undertaken projects, split live/completed
 * POST { action, key, ... } -> progress / complete / media / notices /
 *                              documents / XP award / member removal / attendance
 */
export async function GET(req: NextRequest) {
  try {
    const auth = await authedNgo(req);
    if (!auth) return NextResponse.json({ success: false, message: 'NGO sign-in required.' }, { status: 401 });
    const ngoId = String(auth.user!._id);

    const { searchParams } = new URL(req.url);
    const key = searchParams.get('key') || '';

    if (searchParams.get('detail') === '1') {
      const item = await undertakingForNgo(ngoId, key);
      if (!item) {
        return NextResponse.json({ success: false, message: 'Project not found in your management list.' }, { status: 404 });
      }
      const dates = await ManagedAttendance.find({ key }).sort({ date: -1 }).lean();
      return NextResponse.json({ success: true, item, attendance: dates });
    }

    const { live, completed } = await undertakingsForNgo(ngoId);
    const liveCompletedDates = await Promise.all(
      completed.map(async (item) => ({
        key: item.key,
        dates: (await ManagedAttendance.find({ key: item.key }).sort({ date: 1 }).lean()).map((d) => d.date),
      }))
    );
    const attendanceDatesByKeys = Object.fromEntries(liveCompletedDates.map((r) => [r.key, r.dates]));

    return NextResponse.json({
      success: true,
      live,
      completed,
      attendanceDates: attendanceDatesByKeys,
    });
  } catch (error: any) {
    console.error('managed-projects GET error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Failed to load projects.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await authedNgo(req);
    if (!auth) return NextResponse.json({ success: false, message: 'NGO sign-in required.' }, { status: 401 });
    const ngoId = String(auth.user!._id);

    const body = await req.json().catch(() => ({}));
    const action = String(body.action || '');
    const key = String(body.key || '');
    const parsedKey = parseKey(key);
    if (!parsedKey) {
      return NextResponse.json({ success: false, message: 'Unknown project.' }, { status: 400 });
    }
    // The management overlay row is created lazily on first access; make every
    // action work even if the workspace page was never opened before.
    let workspace = await ManagedProject.findOne({ key });
    if (!workspace && parsedKey) {
      const ensured = await undertakingForNgo(ngoId, key);
      workspace = ensured
        ? await ManagedProject.findOne({ key })
        : null;
    }
    if (!workspace || workspace.ngoId !== ngoId) {
      return NextResponse.json({ success: false, message: 'Project not found in your management list.' }, { status: 404 });
    }

    switch (action) {
      // ---- progress slider ----
      case 'progress': {
        const value = Number(body.progress);
        if (!Number.isFinite(value) || value < 0 || value > 100) {
          return NextResponse.json({ success: false, message: 'Progress must be between 0 and 100.' }, { status: 400 });
        }
        workspace.progress = Math.round(value);
        await workspace.save();
        return NextResponse.json({ success: true, message: `Progress updated to ${workspace.progress}%.` });
      }

      // ---- mark completed ----
      case 'complete': {
        if (workspace.completedAt) {
          return NextResponse.json({ success: true, message: 'Project is already completed.' });
        }
        workspace.completedAt = new Date();
        workspace.progress = 100;
        workspace.completedSummary = String(body.summary || '');
        await workspace.save();

        if (workspace.kind === 'issue') {
          const issue = await Issue.findById(workspace.refId);
          if (issue && issue.assignedNgo?.id === ngoId) {
            issue.status = 'resolved';
            await issue.save();
            await IssueUpdate.create({
              issueId: issue._id,
              author: { id: ngoId, name: auth.user!.name, role: 'ngo' },
              type: 'status_change',
              body: `${auth.user!.organizationName || auth.user!.name} marked their project on this issue as completed.`,
              toStatus: 'resolved',
            });
          }
        } else {
          // Volunteer project: reflect completion on the public board too.
          await Project.findByIdAndUpdate(workspace.refId, { status: 'completed' });
        }

        return NextResponse.json({
          success: true,
          message: 'Project marked as completed. It now shows in Recently Completed.',
        });
      }

      // ---- media gallery ----
      case 'addMedia': {
        const url = String(body.url || '').trim();
        const kind = body.kind === 'video' ? 'video' : 'image';
        if (!url) {
          return NextResponse.json({ success: false, message: 'Provide a photo/video file or link.' }, { status: 400 });
        }
        workspace.media.push({
          kind: kind as 'image' | 'video',
          url,
          name: String(body.name || ''),
          uploadedAt: new Date(),
        });
        await workspace.save();
        return NextResponse.json({ success: true, message: 'Media added to the project gallery.' });
      }

      case 'removeMedia': {
        const url = String(body.url || '');
        workspace.media = workspace.media.filter((m) => m.url !== url);
        await workspace.save();
        return NextResponse.json({ success: true, message: 'Media removed.' });
      }

      // ---- documentation ----
      case 'addDocument': {
        const title = String(body.title || '').trim();
        if (!title) {
          return NextResponse.json({ success: false, message: 'Give the document a title.' }, { status: 400 });
        }
        workspace.documents.push({ title, url: String(body.url || ''), uploadedAt: new Date() });
        await workspace.save();
        return NextResponse.json({ success: true, message: 'Documentation added.' });
      }

      case 'removeDocument': {
        const title = String(body.title || '');
        workspace.documents = workspace.documents.filter((d) => d.title !== title);
        await workspace.save();
        return NextResponse.json({ success: true, message: 'Document removed.' });
      }

      // ---- notices ----
      case 'addNotice': {
        const title = String(body.title || '').trim();
        const text = String(body.body || '').trim();
        if (!title || !text) {
          return NextResponse.json({ success: false, message: 'Notices need both a title and a message.' }, { status: 400 });
        }
        workspace.notices.unshift({ title, body: text, createdAt: new Date() });
        await workspace.save();
        return NextResponse.json({ success: true, message: 'Notice shared with all participants.' });
      }

      case 'removeNotice': {
        const title = String(body.title || '');
        const createdAt = body.createdAt ? new Date(body.createdAt) : null;
        workspace.notices = workspace.notices.filter(
          (n) => !(n.title === title && (!createdAt || createdAt.getTime() === n.createdAt.getTime()))
        );
        await workspace.save();
        return NextResponse.json({ success: true, message: 'Notice removed.' });
      }

      // ---- award XP to a member ----
      case 'awardXp': {
        const userId = String(body.userId || '');
        const amount = Number(body.amount);
        if (!mongoose.isValidObjectId(userId)) {
          return NextResponse.json({ success: false, message: 'Unknown member.' }, { status: 400 });
        }
        if (!Number.isFinite(amount) || amount < 1 || amount > 500) {
          return NextResponse.json({ success: false, message: 'XP must be between 1 and 500.' }, { status: 400 });
        }
        const result = await awardXpToUser(
          userId,
          amount,
          String(body.note || 'Project participation reward'),
          workspace.refId
        );
        if (!result) {
          return NextResponse.json({ success: false, message: 'Could not award XP to that member.' }, { status: 400 });
        }
        return NextResponse.json({
          success: true,
          message: `Awarded ${amount} XP to ${String(body.name || 'the member')} (now ${result.xpPoints} XP, level ${result.level}).`,
        });
      }

      // ---- remove a member ----
      case 'removeMember': {
        const userId = String(body.userId || '');
        if (!mongoose.isValidObjectId(userId)) {
          return NextResponse.json({ success: false, message: 'Unknown member.' }, { status: 400 });
        }
        if (workspace.kind === 'volunteer') {
          const member = await ProjectMember.findOne({
            projectId: workspace.refId,
            'user.id': userId,
            status: 'joined',
          });
          if (member) {
            member.status = 'removed';
            member.removedBy = 'ngo';
            await member.save();
          }
        }
        workspace.removedUserIds = Array.from(new Set([...(workspace.removedUserIds || []), userId]));
        await workspace.save();
        return NextResponse.json({ success: true, message: 'Member removed from the project.' });
      }

      // ---- date-wise attendance ----
      case 'attendance': {
        const date = String(body.date || '');
        if (!isValidDate(date)) {
          return NextResponse.json({ success: false, message: 'Pick a date (YYYY-MM-DD).' }, { status: 400 });
        }
        const marks = Array.isArray(body.records) ? body.records : [];
        if (marks.length === 0) {
          return NextResponse.json({ success: false, message: 'No members to mark attendance for.' }, { status: 400 });
        }

        const existing = await ManagedAttendance.findOne({ key, date });
        const previouslyPresent = new Set(
          (existing?.records || []).filter((r: any) => r.present && r.xpAwarded).map((r: any) => r.userId)
        );

        const records = marks.map((r: any) => ({
          userId: String(r.userId || ''),
          name: String(r.name || ''),
          roleId: String(r.roleId || ''),
          present: Boolean(r.present),
          xpAwarded:
            (existing?.records?.find((x: any) => x.userId === String(r.userId))?.xpAwarded && Boolean(r.present)) ||
            (previouslyPresent.has(String(r.userId)) && Boolean(r.present)) ||
            false,
        }));

        if (existing) {
          existing.records = records;
          existing.markedBy = ngoId;
          await existing.save();
        } else {
          await ManagedAttendance.create({ key, date, markedBy: ngoId, records });
        }

        // Present members earn attendance XP (once per date).
        let awarded = 0;
        for (const rec of records) {
          if (rec.present && !previouslyPresent.has(rec.userId)) {
            const ok = await awardXpToUser(
              rec.userId,
              ATTENDANCE_XP,
              `Attended project session on ${date}`,
              workspace.refId
            );
            if (ok) {
              awarded += 1;
              rec.xpAwarded = true;
              const doc = await ManagedAttendance.findOne({ key, date });
              if (doc) {
                const target = doc.records.find((x: any) => x.userId === rec.userId);
                if (target) target.xpAwarded = true;
                doc.markedBy = ngoId;
                await doc.save();
              }
            }
          }
        }

        return NextResponse.json({
          success: true,
          message: `Attendance saved for ${date} — ${awarded} member${awarded === 1 ? '' : 's'} earned ${ATTENDANCE_XP} XP.`,
        });
      }

      default:
        return NextResponse.json({ success: false, message: 'Unknown action.' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('managed-projects POST error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Action failed.' }, { status: 500 });
  }
}

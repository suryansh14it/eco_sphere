import mongoose, { Schema, Document } from 'mongoose';

/**
 * A volunteer signup for a project role. One signup per person per project
 * while active; leaving or being removed marks `status: "removed"` so the
 * history survives and re-joining creates a fresh record.
 */
export interface IProjectMember extends Document {
  projectId: string;
  roleId: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  status: 'joined' | 'removed';
  removedBy?: 'volunteer' | 'ngo';
  joinedAt: Date;
}

const ProjectMemberSchema = new Schema<IProjectMember>(
  {
    projectId: { type: String, required: true },
    roleId: { type: String, required: true },
    user: {
      id: { type: String, required: true },
      name: { type: String, required: true },
      email: { type: String, required: true },
    },
    status: {
      type: String,
      enum: ['joined', 'removed'],
      default: 'joined',
      required: true,
    },
    removedBy: {
      type: String,
      enum: ['volunteer', 'ngo'],
    },
    joinedAt: { type: Date, default: Date.now, required: true },
  },
  { timestamps: true }
);

// One active membership per person per project. `partialFilterExpression`
// keeps historical "removed" records from blocking a future re-join.
ProjectMemberSchema.index(
  { projectId: 1, 'user.id': 1 },
  { unique: true, partialFilterExpression: { status: 'joined' } }
);
ProjectMemberSchema.index({ projectId: 1, roleId: 1 });
ProjectMemberSchema.index({ 'user.id': 1 });

export default mongoose.models.ProjectMember ||
  mongoose.model<IProjectMember>('ProjectMember', ProjectMemberSchema);

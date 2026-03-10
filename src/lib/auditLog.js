import connectDB from '@/lib/mongodb';
import AuditLog from '@/models/AuditLog';

/**
 * Log an audit event. Non-blocking — errors are caught and logged to console only.
 * @param {object} params
 * @param {object} params.user - User object from getUserFromToken (id, username, full_name)
 * @param {'CREATE'|'UPDATE'|'DELETE'} params.action
 * @param {string} params.entityType - e.g. 'Article', 'Schedule', 'Supplier'
 * @param {string} params.entityId - MongoDB _id of the affected document
 * @param {string} params.entityName - Human-readable label (e.g. article_name)
 * @param {object|null} params.oldValues - Document state before change (null for CREATE)
 * @param {object|null} params.newValues - Document state after change (null for DELETE)
 */
export async function logAudit({ user, action, entityType, entityId, entityName, oldValues, newValues }) {
  try {
    await connectDB();
    await AuditLog.create({
      user_id: user.id,
      username: user.username,
      full_name: user.full_name || user.username,
      action,
      entity_type: entityType,
      entity_id: String(entityId),
      entity_name: entityName || String(entityId),
      old_values: oldValues,
      new_values: newValues,
    });
  } catch (e) {
    console.error('Audit log error:', e);
  }
}

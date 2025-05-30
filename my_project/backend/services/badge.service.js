const User = require('../models/user');
const Badge = require('../models/badge');
const UserBadge = require('../models/user_badge');
const { Sequelize } = require('sequelize'); // For Op.notIn if needed, or complex queries

/**
 * Checks and awards badges to a user based on defined criteria.
 * Currently only implements points-based badges.
 * @param {number} userId - The ID of the user to check badges for.
 * @param {object} options - Optional: { transaction: t } to run within a transaction.
 * @returns {Promise<Array>} A promise that resolves to an array of newly awarded badge objects.
 */
async function checkAndAwardBadges(userId, options = {}) {
  const awardedBadgesList = [];
  try {
    const user = await User.findByPk(userId, {
      include: [{
        model: Badge, // User.belongsToMany(Badge, { through: UserBadge ...})
        attributes: ['badge_id'], // Only need IDs of badges user already has
      }],
      transaction: options.transaction, // Pass transaction if provided
    });

    if (!user) {
      console.error(`[BadgeService] User not found: ${userId}`);
      return awardedBadgesList; // Or throw error
    }

    const userBadgeIds = user.Badges ? user.Badges.map(b => b.badge_id) : [];

    // 1. Check for points-based badges
    const pointsBadges = await Badge.findAll({
      where: {
        criteria_type: 'points',
        // Optionally filter out badges user already has, though the check below handles it too
        // badge_id: { [Sequelize.Op.notIn]: userBadgeIds } // More efficient if many badges
      },
      transaction: options.transaction,
    });

    for (const badge of pointsBadges) {
      if (user.total_points >= badge.criteria_value_points && !userBadgeIds.includes(badge.badge_id)) {
        try {
          await UserBadge.create({
            user_id: userId,
            badge_id: badge.badge_id,
          }, { transaction: options.transaction });
          awardedBadgesList.push(badge); // Add the full badge object
          userBadgeIds.push(badge.badge_id); // Add to local list to prevent duplicate attempts in same run
          console.log(`[BadgeService] Awarded points badge "${badge.name}" to user ${userId}`);
        } catch (error) {
          if (error.name === 'SequelizeUniqueConstraintError') {
            // User already had this badge, which is fine, means our initial check might have a race condition if not in transaction
            console.warn(`[BadgeService] User ${userId} already had badge ${badge.badge_id} or tried to award concurrently.`);
          } else {
            throw error; // Rethrow other errors
          }
        }
      }
    }

    // TODO: Implement checks for other criteria_types (specific_tasks, specific_quizzes, skill_completion)
    // This would involve querying TaskSubmission, QuizAttempt, etc.
    // Example for specific_tasks (conceptual):
    // const taskBadges = await Badge.findAll({ where: { criteria_type: 'specific_tasks' }, transaction: options.transaction });
    // for (const badge of taskBadges) {
    //   if (userHasCompletedTasks(userId, badge.criteria_value_ids, options.transaction) && !userBadgeIds.includes(badge.badge_id)) {
    //     // award badge
    //   }
    // }

    return awardedBadgesList;
  } catch (error) {
    console.error(`[BadgeService] Error checking/awarding badges for user ${userId}:`, error);
    // Depending on strategy, might rethrow or just return empty list / handle error
    // If this service is part of a transaction, rethrowing might be appropriate to rollback.
    if (options.transaction) throw error;
    return awardedBadgesList; // Return empty list on error if not part of transaction
  }
}

module.exports = { checkAndAwardBadges };

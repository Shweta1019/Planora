export function filterNotificationsByPrefs(notifs, userId) {
  if (!notifs || !userId || !Array.isArray(notifs)) return notifs;
  const saved = localStorage.getItem(`planora_notif_prefs_${userId}`);
  if (!saved) return notifs; // all enabled by default

  try {
    const prefs = JSON.parse(saved); 
    // prefs[0]: Task Assignments
    // prefs[1]: Task Due Reminders
    // prefs[2]: Project Updates
    // prefs[3]: Budget Alerts
    // prefs[4]: Mentions & Comments

    return notifs.filter(n => {
      const type = n.type || '';
      
      if ((type === 'TASK_ASSIGNED' || type === 'TASK_REASSIGNED') && prefs[0] === false) return false;
      if (type === 'TASK_DUE' && prefs[1] === false) return false;
      if ((type === 'PROJECT_UPDATED' || type === 'PROJECT_CREATED') && prefs[2] === false) return false;
      if ((type === 'BUDGET_ALERT' || type === 'BUDGET_OVERRUN' || type === 'PROJECT_BUDGET') && prefs[3] === false) return false;
      if (type === 'NEW_COMMENT' && prefs[4] === false) return false;
      
      // All other types (SYSTEM, NEW_USER, DEFAULT) remain
      return true;
    });
  } catch(e) {
    return notifs;
  }
}

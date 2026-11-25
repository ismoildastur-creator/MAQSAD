import { createClient } from '@supabase/supabase-js';

const CONFIG = window.MAQSAD_SUPABASE_CONFIG || {};
const LOCAL_STORE = 'maqsad_v1';
let supabase = null;
let activeUser = null;
let syncing = false;
let syncTimer = null;

function readLocal() {
  try { return JSON.parse(localStorage.getItem(LOCAL_STORE) || '{}'); }
  catch { return {}; }
}
function writeLocal(data) {
  localStorage.setItem(LOCAL_STORE, JSON.stringify({ ...readLocal(), ...data }));
}
function notifyAuth() {
  window.dispatchEvent(new Event('maqsad:auth-change'));
}
function status(message, kind = 'info') {
  const el = document.getElementById('cloud-status');
  if (!el) return;
  el.textContent = message;
  el.dataset.kind = kind;
}
function renderAccount() {
  const email = document.getElementById('cloud-user-email');
  const form = document.getElementById('cloud-auth-form');
  const signedIn = document.getElementById('cloud-signed-in');
  if (!email || !form || !signedIn) return;
  const isSignedIn = Boolean(activeUser);
  form.hidden = isSignedIn;
  signedIn.hidden = !isSignedIn;
  if (isSignedIn) email.textContent = activeUser.email || 'Hisobga kirilgan';
  notifyAuth();
}
function setBusy(busy) {
  document.querySelectorAll('[data-cloud-action]').forEach(button => {
    button.disabled = busy;
    button.style.opacity = busy ? '.65' : '';
  });
}
function explainError(error) {
  const message = error?.message || 'Noma’lum xatolik';
  if (/invalid login credentials/i.test(message)) return 'Email yoki parol noto‘g‘ri.';
  if (/email not confirmed/i.test(message)) return 'Email manzilingizni tasdiqlang, keyin qayta kiring.';
  if (/failed to fetch|network/i.test(message)) return 'Internet aloqasini tekshiring.';
  if (/row-level security|permission denied|not allowed/i.test(message)) return 'Baza ruxsatlari yoki RLS siyosatlarini tekshirish kerak.';
  return message;
}
async function signUp() {
  if (!supabase) return status('Bulutli ulanish sozlanmagan. Ilova mehmon rejimida ishlayveradi.', 'warning');
  const name = document.getElementById('cloud-name').value.trim();
  const email = document.getElementById('cloud-email').value.trim();
  const password = document.getElementById('cloud-password').value;
  if (!email || password.length < 8) return status('Email kiriting va kamida 8 belgili parol tanlang.', 'warning');
  setBusy(true);
  try {
    const { data, error } = await supabase.auth.signUp({
      email, password, options: { data: { full_name: name } }
    });
    if (error) throw error;
    if (data.session) status('Hisob yaratildi. Maqsadlaringiz bulut bilan sinxronlanmoqda…', 'success');
    else status('Hisob yaratildi. Emailingizga tasdiqlash xati yuborildi. Tasdiqlagach ilovaga kiring.', 'success');
  } catch (error) {
    status(explainError(error), 'error');
  } finally { setBusy(false); }
}
async function signIn() {
  if (!supabase) return status('Bulutli ulanish sozlanmagan. Mehmon rejimidan foydalanishingiz mumkin.', 'warning');
  const email = document.getElementById('cloud-email').value.trim();
  const password = document.getElementById('cloud-password').value;
  if (!email || !password) return status('Email va parolni kiriting.', 'warning');
  setBusy(true);
  try {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    status('Kirish muvaffaqiyatli. Maqsadlaringiz yuklanmoqda…', 'success');
  } catch (error) {
    status(explainError(error), 'error');
  } finally { setBusy(false); }
}
async function signOut() {
  if (!supabase) return;
  setBusy(true);
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    activeUser = null;
    renderAccount();
    status('Hisobdan chiqildi. Mahalliy ma’lumotlaringiz qurilmada qoladi.', 'success');
  } catch (error) {
    status(explainError(error), 'error');
  } finally { setBusy(false); }
}
function keyForGoal(goal) {
  return (String(goal.name || goal.title || '').trim().toLowerCase() + '|' + String(goal.cat || goal.category || '').trim().toLowerCase());
}
function decodeResource(description) {
  const prefix = 'MAQSAD_RESOURCE:';
  if (!description || !description.startsWith(prefix)) return null;
  try { return JSON.parse(description.slice(prefix.length)); } catch { return null; }
}
function encodeResource(resource) {
  return 'MAQSAD_RESOURCE:' + JSON.stringify({
    id: resource.id, type: resource.type, author: resource.author || '',
    description: resource.description || '', url: resource.url || '', icon: resource.icon || '📚',
    completed: Boolean(resource.completed)
  });
}
function ensureResources(goal) {
  if ((!Array.isArray(goal.resources) || !goal.resources.length) && typeof window.ensureGoalPlan === 'function') {
    window.ensureGoalPlan(goal);
  }
  if (!Array.isArray(goal.resources)) goal.resources = [];
}
async function syncGoalsAndPaths(saved, preferLocal) {
  const localGoals = Array.isArray(saved.goals) ? saved.goals : [];
  const { data: fetchedGoals, error: goalsError } = await supabase
    .from('goals').select('id,title,category,progress').eq('user_id', activeUser.id);
  if (goalsError) throw goalsError;
  const remoteGoals = [...(fetchedGoals || [])];

  // Upload local goals first, attaching the remote UUID to each local record.
  for (const goal of localGoals) {
    const key = keyForGoal(goal);
    let remote = remoteGoals.find(row => row.id === goal.cloudId || keyForGoal(row) === key);
    if (!remote) {
      const { data, error } = await supabase.from('goals').insert({
        user_id: activeUser.id,
        title: String(goal.name || goal.title).trim(),
        category: String(goal.cat || goal.category || 'Shaxsiy rivojlanish'),
        progress: Number(goal.progress || 0)
      }).select('id,title,category,progress').single();
      if (error) throw error;
      remote = data;
      remoteGoals.push(remote);
    }
    goal.cloudId = remote.id;
    ensureResources(goal);
  }

  // Pull goals created on another device into the local guest store.
  for (const remote of remoteGoals) {
    const key = keyForGoal(remote);
    let local = localGoals.find(goal => goal.cloudId === remote.id || keyForGoal(goal) === key);
    if (!local) {
      local = {
        id: 'cloud-' + remote.id, cloudId: remote.id, name: remote.title,
        cat: remote.category || 'Shaxsiy rivojlanish', progress: Number(remote.progress || 0),
        createdAt: new Date().toISOString(), resources: []
      };
      localGoals.push(local);
    }
    local.cloudId = remote.id;
  }

  const { data: remotePathsData, error: pathsError } = await supabase
    .from('learning_paths')
    .select('id,user_id,goal_id,title,description,sort_order,completed_at')
    .eq('user_id', activeUser.id)
    .order('sort_order', { ascending: true });
  if (pathsError) throw pathsError;
  const remotePaths = remotePathsData || [];

  for (const goal of localGoals) {
    ensureResources(goal);
    const goalId = goal.cloudId;
    if (!goalId) continue;
    const paths = remotePaths.filter(path => path.goal_id === goalId);
    for (let index = 0; index < goal.resources.length; index++) {
      const resource = goal.resources[index];
      let path = paths.find(item => item.title === resource.title);
      if (!path) {
        const { data, error } = await supabase.from('learning_paths').insert({
          user_id: activeUser.id, goal_id: goalId,
          title: resource.title,
          description: encodeResource(resource),
          sort_order: index,
          completed_at: resource.completed ? new Date().toISOString() : null
        }).select('id,user_id,goal_id,title,description,sort_order,completed_at').single();
        if (error) throw error;
        path = data;
        remotePaths.push(path);
        paths.push(path);
      }
      resource.cloudId = path.id;
      const remoteDone = Boolean(path.completed_at);
      if (preferLocal && Boolean(resource.completed) !== remoteDone) {
        const { error } = await supabase.from('learning_paths').update({
          completed_at: resource.completed ? new Date().toISOString() : null,
          description: encodeResource(resource),
          sort_order: index
        }).eq('id', path.id).eq('user_id', activeUser.id);
        if (error) throw error;
      } else if (!preferLocal) {
        resource.completed = remoteDone;
        const metadata = decodeResource(path.description);
        if (metadata) {
          resource.type = metadata.type || resource.type;
          resource.author = metadata.author || resource.author;
          resource.description = metadata.description || resource.description;
          resource.url = metadata.url || resource.url;
          resource.icon = metadata.icon || resource.icon;
          resource.id = metadata.id || resource.id;
        }
      }
    }

    // Restore any learning resources stored by a previous session/device.
    for (const path of paths) {
      if (goal.resources.some(resource => resource.title === path.title)) continue;
      const metadata = decodeResource(path.description);
      if (!metadata) continue;
      goal.resources.push({
        id: metadata.id || 'restored-' + path.id,
        cloudId: path.id, type: metadata.type || 'lesson', title: path.title,
        author: metadata.author || '', description: metadata.description || '',
        url: metadata.url || '', icon: metadata.icon || '📚',
        completed: Boolean(path.completed_at)
      });
    }
    goal.progress = goal.resources.length
      ? Math.round(goal.resources.filter(resource => resource.completed).length / goal.resources.length * 100)
      : Number(goal.progress || 0);
    if (Number(remoteGoals.find(row => row.id === goalId)?.progress || 0) !== goal.progress) {
      const { error } = await supabase.from('goals')
        .update({ progress: goal.progress })
        .eq('id', goalId).eq('user_id', activeUser.id);
      if (error) throw error;
    }
  }
  return localGoals;
}
async function syncDailyTasks(saved, preferLocal) {
  const tasks = Array.isArray(saved.dailyTasks) ? saved.dailyTasks : [];
  if (!tasks.length) return;
  const today = new Date().toISOString().slice(0, 10);
  const start = today + 'T00:00:00.000Z';
  const endDate = new Date(Date.parse(start) + 86400000).toISOString();
  const { data, error } = await supabase.from('daily_tasks')
    .select('id,title,goal_id,completed_at,due_at')
    .eq('user_id', activeUser.id)
    .gte('due_at', start).lt('due_at', endDate);
  if (error) throw error;
  const remoteTasks = data || [];
  for (const task of tasks) {
    const goal = (saved.goals || []).find(g => g.id === task.goalId);
    const remote = remoteTasks.find(row => row.title === task.title);
    if (!remote) {
      const { data: inserted, error: insertError } = await supabase.from('daily_tasks').insert({
        user_id: activeUser.id, goal_id: goal?.cloudId || null,
        title: task.title, due_at: start, planned_minutes: 20,
        priority: 'medium', completed_at: task.done ? new Date().toISOString() : null
      }).select('id,title,goal_id,completed_at,due_at').single();
      if (insertError) throw insertError;
      remoteTasks.push(inserted);
    } else if (preferLocal) {
      const { error: updateError } = await supabase.from('daily_tasks').update({
        completed_at: task.done ? new Date().toISOString() : null
      }).eq('id', remote.id).eq('user_id', activeUser.id);
      if (updateError) throw updateError;
    } else {
      task.done = Boolean(remote.completed_at);
    }
  }
}
async function syncAll(preferLocal = false) {
  if (!supabase || !activeUser || syncing) return;
  syncing = true;
  try {
    let saved = readLocal();
    saved.goals = await syncGoalsAndPaths(saved, preferLocal);
    await syncDailyTasks(saved, preferLocal);
    const today = new Date().toISOString().slice(0, 10);
    const tasksDone = (saved.dailyTasks || []).filter(task => task.done).length;
    const xp = Number(saved.xp || 0);
    const { error: statsError } = await supabase.from('user_statistics').upsert({
      user_id: activeUser.id, stat_date: today,
      tasks_completed: tasksDone, xp_earned: Math.max(0, xp),
      focus_seconds: Number(saved.focusSessions || 0) * 25 * 60
    }, { onConflict: 'user_id,stat_date' });
    if (statsError) throw statsError;
    writeLocal(saved);
    window.dispatchEvent(new Event('maqsad:data-synced'));
    status('Bulut bilan sinxronlandi. Maqsadlaringiz va o‘quv rejalaringiz saqlandi.', 'success');
  } catch (error) {
    status('Sinxronlashda xatolik: ' + explainError(error), 'error');
  } finally { syncing = false; }
}
function scheduleSync() {
  if (!activeUser || syncing) return;
  clearTimeout(syncTimer);
  syncTimer = setTimeout(() => syncAll(true), 1100);
}
async function updateAdminEntry() {
  const entry = document.getElementById('admin-entry');
  if (!entry) return;
  entry.hidden = true;
  if (!activeUser || !supabase) return;
  try {
    const { data, error } = await supabase.rpc('is_maqsad_admin');
    entry.hidden = !!error || data !== true;
  } catch (_) { entry.hidden = true; }
}
function init() {
  renderAccount();
  if (!CONFIG.url || !CONFIG.publishableKey) {
    status('Mehmon rejimi faol. Bulutli hisobga ulanish hozircha sozlanmagan.', 'warning');
    return;
  }
  try {
    supabase = createClient(CONFIG.url, CONFIG.publishableKey, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false }
    });
  } catch (error) {
    status('Supabase sozlamasi xato: ' + explainError(error), 'error');
    return;
  }
  supabase.auth.onAuthStateChange((_event, session) => {
    activeUser = session?.user || null;
    renderAccount();
    updateAdminEntry();
    if (activeUser) setTimeout(() => syncAll(false), 0);
    else status('Mehmon rejimidasiz. Istasangiz email bilan hisob oching.', 'info');
  });
  supabase.auth.getSession().then(({ data, error }) => {
    if (error) return status(explainError(error), 'error');
    activeUser = data.session?.user || null;
    renderAccount();
    updateAdminEntry();
    if (activeUser) syncAll(false);
    else status('Mehmon bo‘lib foydalanishingiz mumkin. Hisob ochish ixtiyoriy.', 'info');
  });
  window.addEventListener('maqsad:data-changed', scheduleSync);
}
window.maqsadCloud = {
  signUp, signIn, signOut, getUser: () => activeUser,
  syncNow: () => syncAll(true)
};
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();

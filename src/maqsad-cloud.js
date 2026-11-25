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
  const next = { ...readLocal(), ...data };
  localStorage.setItem(LOCAL_STORE, JSON.stringify(next));
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
  if (/row-level security|permission denied|not allowed/i.test(message)) return 'Baza ruxsatlarini tekshirish kerak. 0003 migratsiya bajarilganini tekshiring.';
  return message;
}

async function signUp() {
  if (!supabase) return status('Bulutli ulanish sozlanmagan. GitHub Actions Secrets kerak.', 'warning');
  const name = document.getElementById('cloud-name').value.trim();
  const email = document.getElementById('cloud-email').value.trim();
  const password = document.getElementById('cloud-password').value;
  if (!email || password.length < 8) return status('Email kiriting va kamida 8 belgili parol tanlang.', 'warning');
  setBusy(true);
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } }
    });
    if (error) throw error;
    if (data.session) {
      status('Hisob yaratildi. Ma’lumotlar sinxronlanmoqda…', 'success');
    } else {
      status('Hisob yaratildi. Emailingizga tasdiqlash xati yuborildi.', 'success');
    }
  } catch (error) {
    status(explainError(error), 'error');
  } finally {
    setBusy(false);
  }
}

async function signIn() {
  if (!supabase) return status('Bulutli ulanish sozlanmagan. GitHub Actions Secrets kerak.', 'warning');
  const email = document.getElementById('cloud-email').value.trim();
  const password = document.getElementById('cloud-password').value;
  if (!email || !password) return status('Email va parolni kiriting.', 'warning');
  setBusy(true);
  try {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    status('Kirish muvaffaqiyatli. Ma’lumotlar sinxronlanmoqda…', 'success');
  } catch (error) {
    status(explainError(error), 'error');
  } finally {
    setBusy(false);
  }
}

async function signOut() {
  if (!supabase) return;
  setBusy(true);
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    activeUser = null;
    renderAccount();
    status('Hisobdan chiqildi. Mahalliy ma’lumotlar qurilmada saqlanadi.', 'success');
  } catch (error) {
    status(explainError(error), 'error');
  } finally {
    setBusy(false);
  }
}

function updateTaskUi(doneStates) {
  const rows = Array.from(document.querySelectorAll('#tasks .task input'));
  rows.forEach((input, index) => { input.checked = Boolean(doneStates[index]); });
  const count = doneStates.filter(Boolean).length;
  const done = document.getElementById('doneTasks');
  if (done) done.textContent = String(count);
}

async function syncAll(preferLocal = false) {
  if (!supabase || !activeUser || syncing) return;
  syncing = true;
  try {
    let saved = readLocal();

    // Merge goal records by their visible title and category.
    const { data: remoteGoals, error: goalsError } = await supabase
      .from('goals')
      .select('id,title,category')
      .eq('user_id', activeUser.id);
    if (goalsError) throw goalsError;

    const goalList = Array.isArray(saved.goals) ? [...saved.goals] : [];
    const goalKey = item => (String(item.name || item.title || '').trim().toLowerCase() + '|' + String(item.cat || item.category || '').trim().toLowerCase());
    const knownGoalKeys = new Set((remoteGoals || []).map(goalKey));
    for (const goal of goalList) {
      const key = goalKey(goal);
      if (knownGoalKeys.has(key) || !String(goal.name || '').trim()) continue;
      const { error } = await supabase.from('goals').insert({
        user_id: activeUser.id,
        title: String(goal.name).trim(),
        category: String(goal.cat || 'Shaxsiy rivojlanish')
      });
      if (error) throw error;
      knownGoalKeys.add(key);
    }
    const localGoalKeys = new Set(goalList.map(goalKey));
    for (const goal of remoteGoals || []) {
      const key = goalKey(goal);
      if (!localGoalKeys.has(key)) {
        goalList.push({ name: goal.title, cat: goal.category });
        localGoalKeys.add(key);
      }
    }
    if (JSON.stringify(goalList) !== JSON.stringify(saved.goals || [])) {
      saved.goals = goalList;
      writeLocal({ goals: goalList });
      if (typeof window.renderMaqsadGoals === 'function') window.renderMaqsadGoals();
    }

    // Sync the three starter checklist tasks, retaining their existing local behavior.
    const taskLabels = Array.from(document.querySelectorAll('#tasks .task'));
    const localStates = Array.isArray(saved.tasks) ? [...saved.tasks] : [];
    const { data: remoteTasks, error: tasksError } = await supabase
      .from('daily_tasks')
      .select('id,title,completed_at')
      .eq('user_id', activeUser.id);
    if (tasksError) throw tasksError;

    const mergedStates = [];
    for (let index = 0; index < taskLabels.length; index++) {
      const title = taskLabels[index].textContent.trim();
      const existing = (remoteTasks || []).find(task => task.title === title);
      let isDone = Boolean(localStates[index]);
      if (existing && !preferLocal) isDone = Boolean(existing.completed_at);

      if (existing) {
        const nextCompletedAt = isDone ? (existing.completed_at || new Date().toISOString()) : null;
        if (preferLocal || Boolean(existing.completed_at) !== isDone) {
          const { error } = await supabase.from('daily_tasks')
            .update({ completed_at: nextCompletedAt })
            .eq('id', existing.id)
            .eq('user_id', activeUser.id);
          if (error) throw error;
        }
      } else {
        const { error } = await supabase.from('daily_tasks').insert({
          user_id: activeUser.id,
          title,
          priority: 'medium',
          completed_at: isDone ? new Date().toISOString() : null
        });
        if (error) throw error;
        // Prevent an identical item from being inserted again during this sync.
        remoteTasks.push({ id: null, title, completed_at: isDone ? new Date().toISOString() : null });
      }
      mergedStates[index] = isDone;
    }

    saved = readLocal();
    saved.tasks = mergedStates;
    writeLocal({ tasks: mergedStates });
    updateTaskUi(mergedStates);

    const today = new Date().toISOString().slice(0, 10);
    const xp = Number(saved.xp || 0);
    const { error: statsError } = await supabase.from('user_statistics').upsert({
      user_id: activeUser.id,
      stat_date: today,
      tasks_completed: mergedStates.filter(Boolean).length,
      xp_earned: Math.max(0, xp)
    }, { onConflict: 'user_id,stat_date' });
    if (statsError) throw statsError;

    status('Bulut bilan sinxronlandi. Ma’lumotlaringiz hisobingizda saqlanmoqda.', 'success');
  } catch (error) {
    status('Sinxronlashda xatolik: ' + explainError(error), 'error');
  } finally {
    syncing = false;
  }
}

function scheduleSync() {
  if (!activeUser || syncing) return;
  clearTimeout(syncTimer);
  syncTimer = setTimeout(() => syncAll(true), 900);
}

function init() {
  renderAccount();
  if (!CONFIG.url || !CONFIG.publishableKey) {
    status('Hozircha mahalliy rejim. Bulut uchun GitHub Actions Secrets sozlanishi kerak.', 'warning');
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
    if (activeUser) setTimeout(() => syncAll(false), 0);
    else status('Bulutli hisobga kirilmagan.', 'info');
  });

  supabase.auth.getSession().then(({ data, error }) => {
    if (error) return status(explainError(error), 'error');
    activeUser = data.session?.user || null;
    renderAccount();
    if (activeUser) syncAll(false);
    else status('Email orqali kiring yoki yangi hisob yarating.', 'info');
  });

  window.addEventListener('maqsad:data-changed', scheduleSync);
}

window.maqsadCloud = { signUp, signIn, signOut, syncNow: () => syncAll(true) };
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();

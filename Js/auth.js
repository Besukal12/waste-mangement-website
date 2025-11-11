import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// --- Supabase Setup ---
const supabaseUrl = 'https://tzaypbpeamyeuxbsqhqq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6YXlwYnBlYW15ZXV4YnNxaHFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0MjU5MDMsImV4cCI6MjA3ODAwMTkwM30.PYNeZpmYaXSbkkv00ulwLPU9hThhRqYk5CIzODZvO7Y';
const supabase = createClient(supabaseUrl, supabaseKey);

// --- Elements ---
const loginRadio = document.getElementById('login');
const signupRadio = document.getElementById('signup');
const formInner = document.querySelector('.form-inner');
const sliderTab = document.querySelector('.slider-tab');
const loginForm = document.querySelector('.login-form');
const signupForm = document.querySelector('.signup-form');

// --- Slider & Title ---
const updateView = () => {
  const isSignup = signupRadio.checked;
  formInner.style.transform = isSignup ? 'translateX(-50%)' : 'translateX(0%)';
  sliderTab.style.left = isSignup ? '50%' : '0%';
  document.title = isSignup ? 'Signup' : 'Login';
};

loginRadio.addEventListener('change', updateView);
signupRadio.addEventListener('change', updateView);
updateView();

// --- LOGIN ---
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = loginForm.querySelector('input[type="email"]').value;
  const password = loginForm.querySelector('input[type="password"]').value;

  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    console.log('Login successful:', data);
    alert('Login successful!');
    window.location.href = '../Citizen-dashboard/index.html';
  } catch (err) {
    console.error('Login failed:', err);
    alert('Login failed: ' + err.message);
  }
});

// --- SIGNUP ---
signupForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = signupForm.querySelector('input[type="email"]').value;
  const password = signupForm.querySelectorAll('input[type="password"]')[0].value;
  const confirmPassword = signupForm.querySelectorAll('input[type="password"]')[1].value;

  if (password !== confirmPassword) {
    alert('Passwords do not match!');
    return;
  }

  try {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    console.log('Signup successful:', data);
    alert('Check your email to confirm sign-up!');

    const { error: profileError } = await supabase.from('profiles').insert([{ id: data.user.id, points: 0, badges: [] }]);
    if (profileError) console.error('Error creating profile:', profileError);
    else console.log('Profile created successfully');
  } catch (err) {
    console.error('Signup failed:', err);
    alert('Signup failed: ' + err.message);
  }
});

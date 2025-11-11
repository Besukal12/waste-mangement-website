const supabaseUrl = "https://tzaypbpeamyeuxbsqhqq.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6YXlwYnBlYW15ZXV4YnNxaHFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0MjU5MDMsImV4cCI6MjA3ODAwMTkwM30.PYNeZpmYaXSbkkv00ulwLPU9hThhRqYk5CIzODZvO7Y";
const client = supabase.createClient(supabaseUrl, supabaseKey);


const params = new URLSearchParams(window.location.search);
const slug = params.get("slug");

async function loadPost() {
  if (!slug) return;

  const { data, error } = await client
    .from("blog")
    .select("*")
    .eq("slug")
    .single();

  if (error) {
    console.error(error);
    document.getElementById("post-container").innerHTML = "Blog not found.";
    return;
  }

  document.getElementById("post-Title").innerText = data.Title;
  document.getElementById("post-image").src = data.image || "default.jpg";
  document.getElementById("post-content").innerText = data.content;
}

loadPost();

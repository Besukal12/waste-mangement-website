const supabaseUrl = "https://tzaypbpeamyeuxbsqhqq.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6YXlwYnBlYW15ZXV4YnNxaHFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0MjU5MDMsImV4cCI6MjA3ODAwMTkwM30.PYNeZpmYaXSbkkv00ulwLPU9hThhRqYk5CIzODZvO7Y";

const client = supabase.createClient(supabaseUrl, supabaseKey);

async function loadBlogs() {
  try {
    let { data, error } = await client
      .from("blog")
      .select("*")
      .order("id", { ascending: false });

    console.log("Data:", data);
    
    if (error) {
      console.error("Error:", error);
      throw error;
    }

    let container = document.getElementById("blog-list");
    
    if (!container) {
      console.error("Container element #blog-list not found");
      return;
    }

    container.innerHTML = "";

    if (!data || data.length === 0) {
      container.innerHTML = `
        <div class="no-posts">
          <h3>No blog posts found</h3>
          <p>Check back later for new content!</p>
        </div>
      `;
      return;
    }


    let cardsHTML = '';
    
    data.forEach(post => {

      const title = post.Title?.trim() || 'Untitled Post';
      const content = post.content ? 
        post.content.replace(/<[^>]*>/g, '').trim() : 
        'No content available...';
      const image = post.image || 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=500&auto=format&fit=crop&q=60';
      const slug = post.slug?.trim() || 'no-slug-available';

      cardsHTML += `
        <div class="card">
          <div class="card-img-container">
            <img src="${image}" alt="${title}" onerror="this.src='https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=500&auto=format&fit=crop&q=60'">
          </div>
          <div class="card-content">
            <h3>${title}</h3>
            <p>${slug}</p>
            <div class="card-footer">
              <a href="post.html" class="card-button">Read More</a>
            </div>
          </div>
        </div>
      `;
    });

    
    container.innerHTML = `<div class="card-cont">${cardsHTML}</div>`;

  } catch (error) {
    console.error("Failed to load blogs:", error);
    let container = document.getElementById("blog-list");
    if (container) {
      container.innerHTML = `
        <div class="no-posts">
          <h3>Error loading posts</h3>
          <p>Please try again later</p>
        </div>
      `;
    }
  }
}


document.addEventListener('DOMContentLoaded', function() {
  loadBlogs();
});


const menuBtn = document.getElementById("menu-btn");
const navLinks = document.getElementById("nav-links");

if (menuBtn && navLinks) {
  menuBtn.addEventListener("click", () => {
    menuBtn.classList.toggle("active");
    navLinks.classList.toggle("active");
  });

  document.addEventListener("click", (e) => {
    if (!menuBtn.contains(e.target) && !navLinks.contains(e.target)) {
      menuBtn.classList.remove("active");
      navLinks.classList.remove("active");
    }
  });
}
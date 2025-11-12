// my-reports.js

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

// --- Supabase Initialization ---
const supabaseUrl = 'https://tzaypbpeamyeuxbsqhqq.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6YXlwYnBlYW15ZXV4YnNxaHFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0MjU5MDMsImV4cCI6MjA3ODAwMTkwM30.PYNeZpmYaXSbkkv00ulwLPU9hThhRqYk5CIzODZvO7Y'
const supabase = createClient(supabaseUrl, supabaseKey)



document.addEventListener("DOMContentLoaded", async () => {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return alert("Please log in first")

  const userId = session.user.id
  const listContainer = document.getElementById('my-reports-list')
  if (!listContainer) return console.error("List container not found")

  const { data: reports, error } = await supabase
    .from('reports')
    .select('*')
    .eq('user_id', userId)

  if (error) {
    console.error("Error fetching reports:", error)
    listContainer.innerHTML = "<p>Error loading reports.</p>"
    return
  }

  if (!reports || reports.length === 0) {
    listContainer.innerHTML = "<p>No reports yet.</p>"
    return
  }

  reports.forEach((report, index) => {
    // Create a container for this report
    const reportItem = document.createElement('div')
    reportItem.className = 'report-item'
    reportItem.innerHTML = `
      <p><strong>Description:</strong> ${report.description}</p>
      ${report.image_url ? `<img src="${report.image_url}" width="150">` : ''}
      <div id="map-${index}" class="mini-map" style="height: 200px; margin-top: 10px;"></div>
    `
    listContainer.appendChild(reportItem)

    // Initialize map for this report
    const map = L.map(`map-${index}`).setView([report.latitude, report.longitude], 15)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map)

    // Add marker for this report
    L.marker([report.latitude, report.longitude], {
      icon: L.icon({
        iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
        iconSize: [30, 30],
        iconAnchor: [15, 30]
      })
    }).addTo(map)
  })
})

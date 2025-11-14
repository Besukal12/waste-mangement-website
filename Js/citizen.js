import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabaseUrl = 'https://tzaypbpeamyeuxbsqhqq.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6YXlwYnBlYW15ZXV4YnNxaHFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0MjU5MDMsImV4cCI6MjA3ODAwMTkwM30.PYNeZpmYaXSbkkv00ulwLPU9hThhRqYk5CIzODZvO7Y'
const supabase = createClient(supabaseUrl, supabaseKey)

document.addEventListener("DOMContentLoaded", () => {
  const map = L.map('map').setView([9.03, 38.74], 13)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map)

  let reportMarker = null
  const coordDiv = document.getElementById('coordinates')
  const imageInput = document.getElementById('image')
  const imagePreview = document.getElementById('image-preview')
  const pinImage = document.getElementById('red-pin')
  const mapContainer = document.getElementById('map')

  function updateCoordinates(lat, lng) {
    coordDiv.textContent = lat && lng
      ? `Coordinates: ${lat.toFixed(6)}, ${lng.toFixed(6)}`
      : "Coordinates: N/A"
  }

  // Drag & drop pin
  pinImage.addEventListener('dragstart', e => e.dataTransfer.setData("text/plain", "pin"))
  mapContainer.addEventListener('dragover', e => e.preventDefault())
  mapContainer.addEventListener('drop', e => {
    e.preventDefault()
    const rect = mapContainer.getBoundingClientRect()
    const latlng = map.containerPointToLatLng([e.clientX - rect.left, e.clientY - rect.top])

    if (reportMarker) map.removeLayer(reportMarker)

    reportMarker = L.marker([latlng.lat, latlng.lng], {
      draggable: true,
      icon: L.icon({ iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png', iconSize: [30,30], iconAnchor:[15,30] })
    }).addTo(map)

    updateCoordinates(latlng.lat, latlng.lng)

    reportMarker.on('drag', e => updateCoordinates(e.target.getLatLng().lat, e.target.getLatLng().lng))
  })

  // Undo pin
  document.getElementById('undo-pin').addEventListener('click', () => {
    if (reportMarker) {
      map.removeLayer(reportMarker)
      reportMarker = null
      updateCoordinates(null, null)
    }
  })

  // Image preview
  imageInput.addEventListener('change', () => {
    const file = imageInput.files[0]
    imagePreview.src = file ? URL.createObjectURL(file) : ''
    imagePreview.style.display = file ? 'block' : 'none'
  })

  // Submit report
  document.getElementById('submit-report').addEventListener('click', async () => {
    if (!reportMarker) return alert("Place the pin on the map!")
    const description = document.getElementById('description').value.trim()
    if (!description) return alert("Enter a description!")
    const imageFile = imageInput.files[0]
    if (!imageFile) return alert("Select an image!")

    const pos = reportMarker.getLatLng()
    const fileName = `${Date.now()}_${imageFile.name.replace(/\s/g, "_")}`

    try {
      const { error: uploadError } = await supabase.storage.from('report_image').upload(fileName, imageFile)
      if (uploadError) throw uploadError

      const image_url = `${supabaseUrl}/storage/v1/object/public/report_image/${fileName}`
      const { error: insertError } = await supabase.from('reports').insert([{ latitude: pos.lat, longitude: pos.lng, description, image_url }])
      if (insertError) throw insertError

      alert("Report submitted successfully!")
      map.removeLayer(reportMarker)
      reportMarker = null
      updateCoordinates(null, null)
      imageInput.value = ''
      imagePreview.style.display = 'none'
      document.getElementById('description').value = ''
    } catch (err) {
      console.error(err)
      alert("Failed to submit report. Check console for details.")
    }
  })
})



// my reports 


document.addEventListener("DOMContentLoaded", async () => {
  const map = L.map('map').setView([9.03, 38.74], 13)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map)

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return alert("Please log in first")

  const userId = session.user.id
  const listContainer = document.getElementById('my-reports-list')

  // Get only current user's reports
  const { data: reports, error } = await supabase
    .from('reports')
    .select('*')
    .eq('user_id', userId)

  if (error) {
    console.error(error)
    return
  }

  if (!reports || reports.length === 0) {
    listContainer.innerHTML = "<p>No reports yet.</p>"
    return
  }

  reports.forEach(report => {
    const marker = L.marker([report.latitude, report.longitude], {
      icon: L.icon({
        iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
        iconSize: [30, 30],
        iconAnchor: [15, 30]
      })
    }).addTo(map)

    marker.bindPopup(`
      <strong>Description:</strong> ${report.description}<br>
      ${report.image_url ? `<img src="${report.image_url}" width="100">` : ''}
    `)

    const item = document.createElement('div')
    item.className = 'report-item'
    item.innerHTML = `
      <p><strong>Description:</strong> ${report.description}</p>
      ${report.image_url ? `<img src="${report.image_url}" width="150">` : ''}
      <p>Lat: ${report.latitude}, Lng: ${report.longitude}</p>
    `
    listContainer.appendChild(item)
  })
})

// user profile 

document.addEventListener("DOMContentLoaded", async () => {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    console.log("No user logged in.")
    return
  }

  const user = session.user

  // Fetch profile data
  const { data, error } = await supabase
    .from('profile')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error) {
    console.error('Error fetching profile:', error)
    return
  }

  // Show on page
  document.getElementById('name').textContent = data.name
  document.getElementById('username').textContent = data.username
  document.getElementById('email').textContent = user.email
  document.getElementById('points').textContent = data.points
  document.getElementById("badges").textContent =  data.badges

  // Update name/username
  document.getElementById('save-changes').addEventListener('click', async () => {
    const newName = document.getElementById('edit-name').value.trim()
    const newUsername = document.getElementById('edit-username').value.trim()

    if (!newName && !newUsername) return alert("Enter something to update!")

    const updates = {}
    if (newName) updates.name = newName
    if (newUsername) updates.username = newUsername

    const { error: updateError } = await supabase
      .from('profile')
      .update(updates)
      .eq('id', user.id)

    if (updateError) {
      console.error('Update failed:', updateError)
      alert("Failed to update profile.")
      return
    }

    alert("Profile updated successfully!")
    // Reflect immediately
    if (newName) document.getElementById('name').textContent = newName
    if (newUsername) document.getElementById('username').textContent = newUsername
  })
})

// side bar responsive

    const sidebar = document.getElementById('sidebar');
    const toggle = document.getElementById('menuToggle');
    const navItems = document.querySelectorAll('.nav-item');

    toggle.addEventListener('click', () => sidebar.classList.toggle('active'));

    navItems.forEach(item =>
      item.addEventListener('click', e => {
        e.preventDefault();
        navItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');
      })
    );

    document.addEventListener('click', e => {
      if (window.innerWidth <= 768 && !sidebar.contains(e.target) && !toggle.contains(e.target))
        sidebar.classList.remove('active');
    });
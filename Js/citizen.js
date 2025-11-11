  const map = L.map('map').setView([9.03, 38.74], 13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap contributors' }).addTo(map);

  let reportMarker = null;

  const pinImage = document.getElementById('red-pin');
  pinImage.addEventListener('dragstart', e => e.dataTransfer.setData("text/plain","drag-pin"));

  const mapContainer = document.getElementById('map');
  mapContainer.addEventListener('dragover', e => e.preventDefault());
  mapContainer.addEventListener('drop', e => {
    e.preventDefault();
    const rect = mapContainer.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const latlng = map.containerPointToLatLng([x, y]);

    if(reportMarker) map.removeLayer(reportMarker);

    reportMarker = L.marker([latlng.lat, latlng.lng], { 
      draggable:true, 
      icon:L.icon({iconUrl:'https://cdn-icons-png.flaticon.com/512/684/684908.png', iconSize:[30,30], iconAnchor:[15,30]})
    }).addTo(map);

    updateCoordinates(latlng.lat, latlng.lng);
    reportMarker.on('drag', e => updateCoordinates(e.target.getLatLng().lat, e.target.getLatLng().lng));
  });

  document.getElementById('undo-pin').addEventListener('click', () => {
    if(reportMarker){ map.removeLayer(reportMarker); reportMarker=null; updateCoordinates(null,null); }
  });

  function updateCoordinates(lat,lng){
    const coordDiv = document.getElementById('coordinates');
    coordDiv.textContent = (lat && lng) ? `Coordinates: ${lat.toFixed(6)}, ${lng.toFixed(6)}` : "Coordinates: N/A";
  }

  const imageInput = document.getElementById('image');
  const imagePreview = document.getElementById('image-preview');
  imageInput.addEventListener('change', () => {
    const file = imageInput.files[0];
    if(file){ const reader = new FileReader(); reader.onload = e => { imagePreview.src=e.target.result; imagePreview.style.display="block"; }; reader.readAsDataURL(file); }
    else { imagePreview.src=""; imagePreview.style.display="none"; }
  });

  document.getElementById('submit-report').addEventListener('click', () => {
    if(!reportMarker) return alert("Please drag the pin onto the map!");
    if(!document.getElementById('description').value) return alert("Please enter a description!");
    if(!imageInput.files[0]) return alert("Please select an image!");

    const pos = reportMarker.getLatLng();
    console.log("Report Submitted:", {lat:pos.lat, lng:pos.lng, desc:document.getElementById('description').value, img:imageInput.files[0].name});
    alert("Report details logged to console!");
  });
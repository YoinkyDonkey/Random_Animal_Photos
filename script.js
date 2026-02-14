// Elements
const img = document.getElementById('animalImage');
const typeLabel = document.getElementById('animalType');
const nextButton = document.getElementById('nextPhoto');
const prevButton = document.getElementById('prevPhoto');
const likeButton = document.getElementById('likePhoto');
const likeCountLabel = document.getElementById('likeCount');
const totalLikesLabel = document.getElementById('totalLikes');

const lightboxOverlay = document.getElementById('lightboxOverlay');
const lightboxImage = lightboxOverlay.querySelector('img');

const darkModeBtn = document.getElementById('darkModeBtn');
const showDogBtn = document.getElementById('showDog');
const showCatBtn = document.getElementById('showCat');
const showRandomBtn = document.getElementById('showRandom');
const surprisePopup = document.getElementById('surprisePopup');
const surpriseShadow = document.getElementById('surpriseShadow');

// State
let darkMode = localStorage.getItem('darkMode') === 'true';
let history = [];
let currentIndex = -1;
let currentFilter = null;

// APIs
const animalAPIs = [
  { name: 'Dog', url: 'https://random.dog/woof.json', extract: d => d.url },
  { name: 'Cat', url: 'https://api.thecatapi.com/v1/images/search', extract: d => d[0].url }
];

// Initialize dark mode
document.body.classList.toggle('dark', darkMode);
darkModeBtn.textContent = darkMode ? '☀️ Light Mode' : '🌙 Dark Mode';

// --- FUNCTIONS ---

// Toggle filter
function toggleFilter(animal) {
  currentFilter = currentFilter === animal ? null : animal;
  showDogBtn.classList.toggle('active', animal === 'Dog' && currentFilter);
  showCatBtn.classList.toggle('active', animal === 'Cat' && currentFilter);
  fetchRandomAnimal();
}

// Fetch a random animal
async function fetchRandomAnimal() {
  const api = currentFilter
    ? animalAPIs.find(a => a.name === currentFilter)
    : animalAPIs[Math.floor(Math.random() * animalAPIs.length)];

  try {
    const res = await fetch(api.url);
    const data = await res.json();
    const url = api.extract(data);

    // Maintain history
    if (currentIndex < history.length - 1) history = history.slice(0, currentIndex + 1);
    history.push({ url, name: api.name, likes: 0 });
    currentIndex++;
    showAnimalFromHistory(currentIndex);

  } catch (err) {
    console.error('Failed to fetch image:', err);
    typeLabel.textContent = 'Failed to load 😿';
    img.src = '';
  }
}

// Show animal from history
function showAnimalFromHistory(index) {
  const item = history[index];
  img.classList.remove('show');
  img.onload = () => img.classList.add('show');
  img.src = item.url;
  img.alt = `${item.name} photo`;
  typeLabel.textContent = item.name;
  prevButton.disabled = index <= 0;
  updateLikes();
}

// Update likes
function updateLikes() {
  const total = history.reduce((s, i) => s + (i.likes || 0), 0);
  likeCountLabel.textContent = history[currentIndex]?.likes || 0;
  totalLikesLabel.textContent = `Total Paw Power: ${total} 🐾`;
}

// Like button with heart animation
likeButton.onclick = () => {
  if (!history[currentIndex]) return;

  history[currentIndex].likes++;
  updateLikes();

  const heart = document.createElement('div');
  heart.className = 'heart';
  const rect = likeButton.getBoundingClientRect();
  heart.style.left = `${rect.left + rect.width / 2}px`;
  heart.style.top = `${rect.top - 10}px`;
  document.body.appendChild(heart);
  setTimeout(() => heart.remove(), 1500);
};

// Navigation buttons
nextButton.onclick = fetchRandomAnimal;
prevButton.onclick = () => {
  if (currentIndex > 0) showAnimalFromHistory(--currentIndex);
};

// Lightbox fullscreen
img.onclick = () => {
  lightboxImage.src = img.src;
  lightboxOverlay.style.display = 'flex';
};
lightboxOverlay.onclick = () => { lightboxOverlay.style.display = 'none'; };

// Dark mode toggle
darkModeBtn.onclick = () => {
  darkMode = !darkMode;
  document.body.classList.toggle('dark', darkMode);
  darkModeBtn.textContent = darkMode ? '☀️ Light Mode' : '🌙 Dark Mode';
  localStorage.setItem('darkMode', darkMode);
};

// Filter buttons
showDogBtn.onclick = () => toggleFilter('Dog');
showCatBtn.onclick = () => toggleFilter('Cat');

// --- SURPRISE ME! ---

async function showSurprise() {
  const api = animalAPIs[Math.floor(Math.random() * animalAPIs.length)];
  const isMainEffect = Math.random() < 0.5; // 50% chance main or shadow

  try {
    const res = await fetch(api.url);
    const data = await res.json();
    const url = api.extract(data);

    if (isMainEffect) {
      // Main spinning popup
      surprisePopup.src = url;
      surprisePopup.style.display = 'block';
      surprisePopup.style.animation = 'none';
      void surprisePopup.offsetWidth; // trigger reflow
      surprisePopup.style.animation = 'surpriseBounceSpin 1.5s forwards';

      setTimeout(() => { surprisePopup.style.display = 'none'; }, 1500);

    } else {
      // Slow awkward background
      surpriseShadow.src = url;
      surpriseShadow.style.display = 'block';
      surpriseShadow.style.animation = 'none';
      void surpriseShadow.offsetWidth;
      surpriseShadow.style.animation = 'surpriseSlideAwkward 2s forwards';

      setTimeout(() => { surpriseShadow.style.display = 'none'; }, 2000);
    }

  } catch (err) {
    console.error('Failed to fetch surprise image:', err);
  }
}

showRandomBtn.onclick = showSurprise;

// --- INITIAL LOAD ---
fetchRandomAnimal();

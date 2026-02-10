document.addEventListener("DOMContentLoaded", () => {

  const img = document.getElementById("animalImage");
  const typeLabel = document.getElementById("animalType");
  const nextButton = document.getElementById("nextPhoto");
  const prevButton = document.getElementById("prevPhoto");
  const likeButton = document.getElementById("likePhoto");
  const likeCountLabel = document.getElementById("likeCount");
  const totalLikesLabel = document.getElementById("totalLikes");

  const lightboxOverlay = document.getElementById("lightboxOverlay");
  const lightboxImage = lightboxOverlay.querySelector("img");

  const darkModeBtn = document.getElementById("darkModeBtn");
  const showDogBtn = document.getElementById("showDog");
  const showCatBtn = document.getElementById("showCat");
  const showRandomBtn = document.getElementById("showRandom");

  let darkMode = false;
  let history = [];
  let currentIndex = -1;
  let currentFilter = null;

  const animalAPIs = [
    {
      name: "Dog",
      url: "https://random.dog/woof.json",
      extract: d => d.url,
      valid: url => /\.(jpg|jpeg|png|gif)$/i.test(url)
    },
    {
      name: "Cat",
      url: "https://api.thecatapi.com/v1/images/search",
      extract: d => d[0].url,
      valid: () => true
    }
  ];

  async function fetchRandomAnimal() {
    let api, url;

    do {
      api = currentFilter
        ? animalAPIs.find(a => a.name === currentFilter)
        : animalAPIs[Math.floor(Math.random() * animalAPIs.length)];

      const res = await fetch(api.url);
      const data = await res.json();
      url = api.extract(data);
    } while (!api.valid(url));

    if (currentIndex < history.length - 1) {
      history = history.slice(0, currentIndex + 1);
    }

    history.push({ url, name: api.name, likes: 0 });
    currentIndex++;
    showAnimal(currentIndex);
  }

  function showAnimal(index) {
    const item = history[index];
    img.src = item.url;
    typeLabel.textContent = item.name;
    prevButton.disabled = index === 0;
    updateLikes();
  }

  function updateLikes() {
    likeCountLabel.textContent = history[currentIndex]?.likes || 0;
    const total = history.reduce((s, i) => s + i.likes, 0);
    totalLikesLabel.textContent = `Total Paw Power: ${total} 🐾`;
  }

  likeButton.onclick = () => {
    history[currentIndex].likes++;
    updateLikes();
  };

  nextButton.onclick = fetchRandomAnimal;

  prevButton.onclick = () => {
    if (currentIndex > 0) {
      currentIndex--;
      showAnimal(currentIndex);
    }
  };

  img.onclick = () => {
    lightboxImage.src = img.src;
    lightboxOverlay.style.display = "flex";
  };

  lightboxOverlay.onclick = () => {
    lightboxOverlay.style.display = "none";
  };

  darkModeBtn.onclick = () => {
    darkMode = !darkMode;
    document.body.classList.toggle("dark", darkMode);
    darkModeBtn.textContent = darkMode ? "☀️ Light Mode" : "🌙 Dark Mode";
  };

  function toggleFilter(animal) {
    currentFilter = currentFilter === animal ? null : animal;
    showDogBtn.classList.toggle("active", currentFilter === "Dog");
    showCatBtn.classList.toggle("active", currentFilter === "Cat");
    fetchRandomAnimal();
  }

  showDogBtn.onclick = () => toggleFilter("Dog");
  showCatBtn.onclick = () => toggleFilter("Cat");
  showRandomBtn.onclick = fetchRandomAnimal;

  fetchRandomAnimal();
});


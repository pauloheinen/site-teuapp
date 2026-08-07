const STORAGE_KEY = "personal-demo-student-feed";
const fallbackPosts = [
  {
    id: "seed-1",
    author: "Marina Costa",
    role: "Personal",
    type: "Avaliação do personal",
    text: "Boa evolução na execução do agachamento. Nesta semana vamos manter carga e melhorar amplitude com segurança.",
    image: "https://images.unsplash.com/photo-1518310383802-640c2de311b2?w=900&h=700&fit=crop",
    date: "Hoje, 08:40"
  },
  {
    id: "seed-2",
    author: "Camila Rodrigues",
    role: "Aluno",
    type: "Progresso",
    text: "Foto de acompanhamento da semana 6. Mais disposição e roupas começando a vestir melhor.",
    image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=900&h=700&fit=crop",
    date: "Ontem, 19:12"
  },
  {
    id: "seed-3",
    author: "Camila Rodrigues",
    role: "Aluno",
    type: "Treino concluído",
    text: "Treino de superiores feito. Tive dificuldade no final, mas consegui completar todas as séries.",
    image: "",
    date: "Segunda, 07:30"
  }
];

const form = document.getElementById("post-form");
const feedList = document.getElementById("feed-list");
const photoInput = document.getElementById("post-photo");
const preview = document.getElementById("photo-preview");
const previewImg = document.getElementById("photo-preview-img");
const removePhotoButton = document.getElementById("remove-photo");
const resetFeedButton = document.getElementById("reset-feed");

let selectedImage = "";

function getPosts() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return fallbackPosts;

  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : fallbackPosts;
  } catch {
    return fallbackPosts;
  }
}

function savePosts(posts) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
}

function formatPostDate() {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date());
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function renderPosts() {
  const posts = getPosts();
  feedList.innerHTML = posts.map(post => `
    <article class="feed-card">
      ${post.image ? `<img class="feed-photo" src="${post.image}" alt="Foto publicada por ${escapeHtml(post.author)}" />` : ""}
      <div class="feed-card-body">
        <div class="feed-meta">
          <span class="feed-type">${escapeHtml(post.type)}</span>
          <span>${escapeHtml(post.date)}</span>
        </div>
        <h3>${escapeHtml(post.author)} <small>${escapeHtml(post.role)}</small></h3>
        <p>${escapeHtml(post.text)}</p>
      </div>
    </article>
  `).join("");
}

function clearSelectedPhoto() {
  selectedImage = "";
  photoInput.value = "";
  preview.hidden = true;
  previewImg.removeAttribute("src");
}

photoInput.addEventListener("change", event => {
  const file = event.target.files && event.target.files[0];
  if (!file) {
    clearSelectedPhoto();
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    selectedImage = String(reader.result || "");
    previewImg.src = selectedImage;
    preview.hidden = false;
  };
  reader.readAsDataURL(file);
});

removePhotoButton.addEventListener("click", clearSelectedPhoto);

form.addEventListener("submit", event => {
  event.preventDefault();

  const role = new FormData(form).get("authorRole") || "Aluno";
  const post = {
    id: `post-${Date.now()}`,
    author: document.getElementById("author-name").value.trim(),
    role,
    type: document.getElementById("post-type").value,
    text: document.getElementById("post-text").value.trim(),
    image: selectedImage,
    date: formatPostDate()
  };

  if (!post.author || !post.text) return;

  const posts = [post, ...getPosts()];
  savePosts(posts);
  form.reset();
  document.getElementById("author-name").value = post.role === "Personal" ? "Marina Costa" : "Camila Rodrigues";
  clearSelectedPhoto();
  renderPosts();
});

resetFeedButton.addEventListener("click", () => {
  localStorage.removeItem(STORAGE_KEY);
  clearSelectedPhoto();
  renderPosts();
});

document.querySelectorAll("input[name='authorRole']").forEach(input => {
  input.addEventListener("change", () => {
    document.getElementById("author-name").value = input.value === "Personal" ? "Marina Costa" : "Camila Rodrigues";
  });
});

renderPosts();

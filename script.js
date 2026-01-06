document.addEventListener("DOMContentLoaded", async () => {
  // --------------------
  // PAGE NAVIGATION
  // --------------------
  window.showPage = function (pageId) {
    document.querySelectorAll(".page").forEach(p => p.classList.add("hidden"));
    document.getElementById(pageId).classList.remove("hidden");
  };

  // --------------------
  // LOVE REASONS
  // --------------------
  const reasons = [
    "Your smile makes my day brighter 😍",
    "You make me feel safe and loved ❤️",
    "I love how you laugh at my bad jokes 😂",
    "You are my favourite person 💕",
    "You make life exciting ✨"
  ];

  window.showReason = function () {
    document.getElementById("reason").innerText =
      reasons[Math.floor(Math.random() * reasons.length)];
  };

  // --------------------
  // VALENTINE QUESTION
  // --------------------
  window.yesClicked = function () {
    document.getElementById("answer").innerText = "YAY! I knew you'd say yes 💖";
  };

  const noBtn = document.getElementById("noBtn");
  if (noBtn) {
    noBtn.addEventListener("mouseover", () => {
      const x = Math.random() * 200 - 100;
      const y = Math.random() * 200 - 100;
      noBtn.style.transform = `translate(${x}px, ${y}px)`;
    });
  }

  // --------------------
  // ELEMENTS
  // --------------------
  const photoInput = document.getElementById("photoInput");
  const gallery = document.getElementById("gallery");

  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightboxImg");
  const closeLightbox = document.getElementById("closeLightbox");

  if (!photoInput || !gallery || !lightbox || !lightboxImg || !closeLightbox) {
    console.error("Missing HTML elements. Check IDs: photoInput, gallery, lightbox, lightboxImg, closeLightbox.");
    return;
  }

  photoInput.multiple = true;

  // --------------------
  // INDEXEDDB SETUP
  // --------------------
  const DB_NAME = "ValentineGalleryDB";
  const STORE = "photos";

  function openDB() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, 1);

      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(STORE)) {
          db.createObjectStore(STORE, { keyPath: "id" });
        }
      };

      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  function idbAdd(db, item) {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).add(item);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  function idbDelete(db, id) {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  function idbGetAll(db) {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, "readonly");
      const req = tx.objectStore(STORE).getAll();
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  const db = await openDB();

  // Load existing photos from DB
  const existing = await idbGetAll(db);
  existing.forEach(item => renderPhoto(item.id, item.dataUrl));

  // --------------------
  // UPLOAD PHOTOS (MULTIPLE)
  // --------------------
  photoInput.addEventListener("change", async () => {
    const files = Array.from(photoInput.files || []);
    if (!files.length) return;

    for (const file of files) {
      if (!file.type.startsWith("image/")) continue;

      const id = (crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()));

      const dataUrl = await fileToDataURL(file);

      // Save to IndexedDB
      await idbAdd(db, { id, dataUrl });

      // Render
      renderPhoto(id, dataUrl);
    }

    // Reset input so you can re-upload / upload more later
    photoInput.value = "";
  });

  function fileToDataURL(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = e => resolve(e.target.result);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  }

  // --------------------
  // RENDER + DELETE + LIGHTBOX
  // --------------------
  function renderPhoto(id, src) {
    const wrapper = document.createElement("div");
    wrapper.className = "image-wrapper";

    const img = document.createElement("img");
    img.src = src;
    img.dataset.photoId = id;

    img.addEventListener("click", () => {
      lightboxImg.src = src;
      lightbox.style.display = "flex";
    });

    const del = document.createElement("button");
    del.className = "delete-btn";
    del.type = "button";
    del.textContent = "🗑️";

    del.addEventListener("click", async (e) => {
      e.stopPropagation();
      wrapper.remove();
      await idbDelete(db, id);
    });

    wrapper.appendChild(img);
    wrapper.appendChild(del);
    gallery.appendChild(wrapper);
  }

  // --------------------
  // LIGHTBOX CLOSE
  // --------------------
  closeLightbox.addEventListener("click", () => {
    lightbox.style.display = "none";
  });

  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) lightbox.style.display = "none";
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") lightbox.style.display = "none";
  });
});

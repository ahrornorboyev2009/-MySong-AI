"use strict";

document.addEventListener("DOMContentLoaded", () => {

  const menuToggle = document.getElementById("menuToggle");
  const mainNav = document.getElementById("mainNav");

  const songForm = document.getElementById("songForm");
  const songIdea = document.getElementById("songIdea");
  const charCount = document.getElementById("charCount");

  const genreGrid = document.getElementById("genreGrid");

  const resultPanel = document.getElementById("resultPanel");
  const resultText = document.getElementById("resultText");
  const copyButton = document.getElementById("copyPrompt");
  
  // Audio pleyer elementlari (index.html da qo'shilgan)
  const audioContainer = document.getElementById("audioContainer");
  const songPlayer = document.getElementById("songPlayer");

  const year = document.getElementById("year");

  let selectedGenre = "Pop";
  let latestPrompt = "";

  // Joriy yil
  if (year) {
    year.textContent = new Date().getFullYear();
  }

  // MOBIL MENU
  if (menuToggle && mainNav) {
    menuToggle.addEventListener("click", () => {
      const isOpen = mainNav.classList.toggle("open");
      menuToggle.classList.toggle("open", isOpen);
      menuToggle.setAttribute("aria-expanded", String(isOpen));
      menuToggle.setAttribute("aria-label", isOpen ? "Menyuni yopish" : "Menyuni ochish");
    });

    mainNav.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => {
        mainNav.classList.remove("open");
        menuToggle.classList.remove("open");
        menuToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  // MATN UZUNLIGINI HISOBLASH
  if (songIdea && charCount) {
    const updateCount = () => {
      charCount.textContent = `${songIdea.value.length} / 500`;
    };
    songIdea.addEventListener("input", updateCount);
    updateCount();
  }

  // MUSIQA JANRINI TANLASH
  if (genreGrid) {
    genreGrid.addEventListener("click", event => {
      const button = event.target.closest("[data-genre]");
      if (!button) return;

      genreGrid.querySelectorAll(".genre-chip").forEach(chip => {
        chip.classList.remove("selected");
        chip.setAttribute("aria-pressed", "false");
      });

      button.classList.add("selected");
      button.setAttribute("aria-pressed", "true");
      selectedGenre = button.dataset.genre || "Pop";
    });

    genreGrid.querySelectorAll(".genre-chip").forEach(chip => {
      chip.setAttribute("aria-pressed", chip.classList.contains("selected") ? "true" : "false");
    });
  }

  // BUYURTMA FORMASI
  if (songForm) {
    songForm.addEventListener("submit", async event => {
      event.preventDefault();

      if (!songForm.reportValidity()) return;

      const formData = new FormData(songForm);
      const name = String(formData.get("name") || "").trim();
      const idea = String(formData.get("idea") || "").trim();
      const language = String(formData.get("language") || "O‘zbekcha");
      const voice = String(formData.get("voice") || "AI o‘zi tanlasin");

      // Tugmani "Yuklanmoqda" holatiga o'tkazish
      const submitBtn = songForm.querySelector(".submit-button");
      const originalBtnText = submitBtn.innerHTML;
      submitBtn.innerHTML = "⏳ Yaratilmoqda...";
      submitBtn.disabled = true;

      // AI uchun buyurtma matni
      latestPrompt = [
        "MySong AI — qo‘shiq yaratish so‘rovi",
        `Ism: ${name}`,
        `Mavzu: ${idea}`,
        `Til: ${language}`,
        `Janr: ${selectedGenre}`,
        `Vokal: ${voice}`,
        "Talab: original qo‘shiq matni, mos musiqa va vokal yaratish."
      ].join("\n");

      // Natija panelini ko'rsatish
      resultPanel.hidden = false;
      resultText.textContent = "Sun'iy intellekt sizning qo'shiqingizni yaratmoqda. Iltimos kuting...";
      audioContainer.style.display = "none"; // Eski pleyerni yashirish
      resultPanel.scrollIntoView({ behavior: "smooth", block: "nearest" });

      try {
        // === HAQIQIY AI ULANISHI ===
        // Agar sizda haqiqiy API kaliti bo'lsa, quyidagi kodni ochib (izohdan chiqarib) ishlatasiz:
        /*
        const response = await fetch('https://api.sizning-ai-xizmat.com/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer YOUR_API_KEY_HERE' // API kalitingizni shu yerga yozing
            },
            body: JSON.stringify({
                prompt: idea,
                genre: selectedGenre,
                language: language,
                voice: voice,
                name: name
            })
        });
        const data = await response.json();
        const audioUrl = data.audio_url;
        */

        // === DEMO REJIM (API yo'q bo'lganda) ===
        // Sun'iy kechikish (2 soniya) va namuna audio
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Internetdan namuna (demo) musiqa havolasi (test uchun)
        const audioUrl = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";

        // Natijani ekranga chiqarish
        resultText.innerHTML = `Tabriklaymiz, <strong>${name}</strong>! Sizning "${selectedGenre}" janridagi qo'shiqingiz tayyor.`;
        
        if (audioUrl) {
            songPlayer.src = audioUrl;
            audioContainer.style.display = "block"; // Pleyerni ko'rsatish
        } else {
            resultText.innerHTML += "<br><span style='color: #ef4444;'>Afsuski, audio havolasi topilmadi.</span>";
        }

      } catch (error) {
        console.error("Xatolik:", error);
        resultText.innerHTML = `<span style="color: #ef4444;">Xatolik yuz berdi: ${error.message}</span>`;
      } finally {
        // Tugmani asl holatiga qaytarish
        submitBtn.innerHTML = originalBtnText;
        submitBtn.disabled = false;
      }
    });
  }

  // BUYURTMANI NUSXALASH
  if (copyButton) {
    copyButton.addEventListener("click", async () => {
      if (!latestPrompt) return;

      const originalText = copyButton.textContent;
      try {
        await navigator.clipboard.writeText(latestPrompt);
        copyButton.textContent = "Nusxalandi ✓";
      } catch (error) {
        const temporary = document.createElement("textarea");
        temporary.value = latestPrompt;
        temporary.setAttribute("readonly", "");
        temporary.style.position = "fixed";
        temporary.style.opacity = "0";
        document.body.appendChild(temporary);
        temporary.select();
        try {
          document.execCommand("copy");
          copyButton.textContent = "Nusxalandi ✓";
        } catch (fallbackError) {
          copyButton.textContent = "Nusxalash imkoni yo‘q";
        } finally {
          temporary.remove();
        }
      }

      window.setTimeout(() => {
        copyButton.textContent = originalText;
      }, 1800);
    });
  }

});
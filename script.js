const slides = document.querySelectorAll(".slide");
const slidesContainer = document.querySelector(".slides");
let currentIndex = 0;
let isPaused = false;
let progressStartTime = null;
let progressAnimationFrame = null;
const progressBar = document.querySelector(".progress");

// Canvas do analizy koloru
const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");

// Wyświetlenie slajdu
function showSlide(index) {
    const offset = -index * 100;
    slidesContainer.style.transform = `translateX(${offset}%)`;
    updateBackground();
}

// Zmiana slajdu z kierunkiem
function changeSlide(direction) {
    currentIndex = (currentIndex + direction + slides.length) % slides.length;
    showSlide(currentIndex);
    resetProgress();
}

// Resetowanie paska postępu i ponowne uruchomienie animacji
function resetProgress() {
    cancelAnimationFrame(progressAnimationFrame); // Anulowanie poprzedniej animacji
    progressBar.style.transition = "none";
    progressBar.style.width = "0%";
    progressStartTime = null; // Zerowanie czasu

    setTimeout(() => {
        if (!isPaused) {
            progressBar.style.transition = "none";
            requestAnimationFrame(updateProgress);
        }
    }, 50); // Krótkie opóźnienie dla lepszego resetowania
}

// Animacja paska postępu
function updateProgress(timestamp) {
    if (!progressStartTime) progressStartTime = timestamp;

    const elapsedTime = timestamp - progressStartTime;
    const progressFraction = Math.min(elapsedTime / 5000, 1); // 5 sekund animacji

    progressBar.style.width = `${progressFraction * 100}%`;

    if (progressFraction < 1 && !isPaused) {
        progressAnimationFrame = requestAnimationFrame(updateProgress);
    } else if (progressFraction >= 1) {
        changeSlide(1); // Automatyczna zmiana na następny slajd
    }
}

// Pauzowanie i wznawianie animacji
function togglePause() {
    const pauseButton = document.getElementById("pause");
    const icon = pauseButton.querySelector("i");

    if (isPaused) {
        requestAnimationFrame(updateProgress); // Wznów animację
        icon.classList.replace("fa-play", "fa-pause");
    } else {
        cancelAnimationFrame(progressAnimationFrame); // Zatrzymaj animację
        progressStartTime = null; // Zerowanie czasu
        icon.classList.replace("fa-pause", "fa-play");
    }

    isPaused = !isPaused;
}

// Aktualizacja tła strony na podstawie slajdu
function updateBackground() {
    const currentSlide = slides[currentIndex];
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = currentSlide.src;

    img.onload = function () {
        canvas.width = img.width / 2; // Zmniejszenie obszaru analizy
        canvas.height = img.height / 2;
        ctx.drawImage(img, img.width / 4, img.height / 4, img.width / 2, img.height / 2, 0, 0, canvas.width, canvas.height);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imageData.data;
        let r = 0,
            g = 0,
            b = 0;

        for (let i = 0; i < pixels.length; i += 4) {
            r += pixels[i];
            g += pixels[i + 1];
            b += pixels[i + 2];
        }

        const totalPixels = pixels.length / 4;
        r = Math.floor(r / totalPixels);
        g = Math.floor(g / totalPixels);
        b = Math.floor(b / totalPixels);

        document.body.style.background = `linear-gradient(120deg, rgba(${r}, ${g}, ${b}, 0.5), rgba(${r}, ${g}, ${b}, 0.2))`;
    };

    img.onerror = function () {
        console.error(`Nie udało się załadować obrazu: ${img.src}`);
        document.body.style.background = `linear-gradient(120deg, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.2))`;
    };
}

// Eventy dla przycisków
document.getElementById("next").addEventListener("click", () => {
    changeSlide(1);
});
document.getElementById("prev").addEventListener("click", () => {
    changeSlide(-1);
});
document.getElementById("pause").addEventListener("click", togglePause);

// Inicjalizacja pierwszego stanu
resetProgress();
updateBackground();

const slides = document.querySelectorAll(".slide");
const slidesContainer = document.querySelector(".slides");
let currentIndex = 0;
let isPaused = false;
let interval;
const progressBar = document.querySelector(".progress");

// Canvas do analizy koloru
const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");

function showSlide(index) {
    const offset = -index * 100;
    slidesContainer.style.transform = `translateX(${offset}%)`;
    resetProgress();
    updateBackground();
}

function nextSlide() {
    currentIndex = (currentIndex + 1) % slides.length;
    showSlide(currentIndex);
}

function prevSlide() {
    currentIndex = (currentIndex - 1 + slides.length) % slides.length;
    showSlide(currentIndex);
}

function resetProgress() {
    progressBar.style.transition = "none";
    progressBar.style.width = "0";
    setTimeout(() => {
        if (!isPaused) {
            progressBar.style.transition = "width 5s linear";
            progressBar.style.width = "100%";
        }
    }, 10);
}

function togglePause() {
    const pauseButton = document.getElementById("pause");
    const icon = pauseButton.querySelector("i");

    if (isPaused) {
        interval = setInterval(() => {
            nextSlide();
            resetProgress();
        }, 5000);
        icon.classList.replace("fa-play", "fa-pause");
        progressBar.style.transition = "width 5s linear";
        progressBar.style.width = "100%";
    } else {
        clearInterval(interval);
        const currentWidth = getComputedStyle(progressBar).width;
        progressBar.style.transition = "none";
        progressBar.style.width = currentWidth;
        icon.classList.replace("fa-pause", "fa-play");
    }
    isPaused = !isPaused;
}

function resetInterval() {
    clearInterval(interval);
    if (!isPaused) {
        interval = setInterval(() => {
            nextSlide();
            resetProgress();
        }, 5000);
    }
}

function updateBackground() {
    const currentSlide = slides[currentIndex];
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = currentSlide.src;

    img.onload = function () {
        // Ustawienia canvas
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Pobranie danych pikseli
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imageData.data;
        let r = 0, g = 0, b = 0;

        // Uśrednianie koloru
        for (let i = 0; i < pixels.length; i += 4) {
            r += pixels[i];
            g += pixels[i + 1];
            b += pixels[i + 2];
        }
        
        const totalPixels = pixels.length / 4;
        r = Math.floor(r / totalPixels);
        g = Math.floor(g / totalPixels);
        b = Math.floor(b / totalPixels);

        // Ustawienie gradientu jako tła strony
        document.body.style.background = `linear-gradient(120deg, rgba(${r}, ${g}, ${b}, 0.5), rgba(${r}, ${g}, ${b}, 0.2))`;
    };
}

document.getElementById("next").addEventListener("click", () => {
    nextSlide();
    resetInterval();
    resetProgress();
});

document.getElementById("prev").addEventListener("click", () => {
    prevSlide();
    resetInterval();
    resetProgress();
});

document.getElementById("pause").addEventListener("click", togglePause);

interval = setInterval(() => {
    nextSlide();
    resetProgress();
}, 5000);
resetProgress();
updateBackground();

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
    }, 50); // Dodano opóźnienie
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
        canvas.width = img.width / 2; // Zmniejszenie obszaru analizy
        canvas.height = img.height / 2;
        ctx.drawImage(img, img.width / 4, img.height / 4, img.width / 2, img.height / 2, 0, 0, canvas.width, canvas.height);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imageData.data;
        let r = 0, g = 0, b = 0;

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

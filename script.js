const heroSlides = [
  {
    kicker: "Velkommen til",
    title: "Familiekirka Mandal",
    text: "En Jesusfokusert menighet i Mandal for alle generasjoner, med disippelgjøring, fellesskap og neste generasjon i sentrum.",
    primary: "Se kalender",
    primaryHref: "#kalender",
    secondary: "Planlegg besøk",
    secondaryHref: "#kontakt"
  },
  {
    kicker: "Søndag kl. 11.00",
    title: "Kom som du er",
    text: "Vi samles til gudstjeneste, fellesskap, bønn og forkynnelse i Sommerkroveien 10.",
    primary: "Finn veien",
    primaryHref: "#kontakt",
    secondary: "Hør taler",
    secondaryHref: "#taler"
  },
  {
    kicker: "Neste generasjon",
    title: "Barn og unge har plass her",
    text: "Familiekirka vil være et trygt og levende fellesskap for barn, tweens, ungdom og familier.",
    primary: "Se tilbud",
    primaryHref: "#barn-unge",
    secondary: "Kontakt oss",
    secondaryHref: "#kontakt"
  }
];

const slides = [...document.querySelectorAll(".hero-slide")];
const dots = [...document.querySelectorAll("[data-hero-dot]")];
const title = document.querySelector("#hero-title");
const kicker = document.querySelector("#hero-kicker");
const text = document.querySelector("#hero-text");
const primary = document.querySelector("#hero-primary");
const secondary = document.querySelector("#hero-secondary");
let currentSlide = 0;
let slideTimer;

function showSlide(index) {
  currentSlide = (index + slides.length) % slides.length;
  slides.forEach((slide, slideIndex) => slide.classList.toggle("active", slideIndex === currentSlide));
  dots.forEach((dot, dotIndex) => dot.classList.toggle("active", dotIndex === currentSlide));

  const content = heroSlides[currentSlide];
  kicker.textContent = content.kicker;
  title.textContent = content.title;
  text.textContent = content.text;
  primary.textContent = content.primary;
  primary.href = content.primaryHref;
  secondary.textContent = content.secondary;
  secondary.href = content.secondaryHref;
}

function queueSlide() {
  clearInterval(slideTimer);
  slideTimer = setInterval(() => showSlide(currentSlide + 1), 6500);
}

dots.forEach((dot) => {
  dot.addEventListener("click", () => {
    showSlide(Number(dot.dataset.heroDot));
    queueSlide();
  });
});

document.querySelector("[data-hero-prev]").addEventListener("click", () => {
  showSlide(currentSlide - 1);
  queueSlide();
});

document.querySelector("[data-hero-next]").addEventListener("click", () => {
  showSlide(currentSlide + 1);
  queueSlide();
});

queueSlide();

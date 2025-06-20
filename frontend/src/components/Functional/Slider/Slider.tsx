import { useRef, useEffect, useState, FC } from 'react';
import gsap from 'gsap';
import { sliderApi } from "../../../services/api/api.index";
import './Slider.scss';
import downChevron from '../../../assets/icons/down-arrow.svg';

// Interface pour les données de slider
interface SliderData {
  id: number;
  image: string;
  title: string;
  description: string;
  name?: string; // Optionnel car utilisé comme alt pour l'image
}

const Slider: FC = () => {
  const [sliderData, setSliderData] = useState<SliderData[]>([]);
  const slidesRef = useRef<Array<HTMLDivElement | null>>([]); // Réf pour les slides
  const currentIndexRef = useRef<number>(0); // Réf mutable pour l'index courant
  const autoplayRef = useRef<ReturnType<typeof setInterval> | null>(null); // Réf pour l'autoplay
  const isAnimatingRef = useRef<boolean>(false); // Verrou pour animations
  const slideDuration: number = 1; // Durée de transition (en s)
  const autoplayInterval: number = 6000; // Intervalle autoplay (en ms)
  const totalSlides: number = sliderData.length; // Nombre total slides
  const imageInfoRefs = useRef<Array<HTMLParagraphElement | null>>([]); // Réf éléments texte slides
  const [activeDotIndex, setActiveDotIndex] = useState<number>(0); // État index actif des dots

  // Fetch des données depuis le backend
  useEffect(() => {
    const fetchSliders = async (): Promise<void> => {
      try {
        const data: SliderData[] = await sliderApi.getAll();
        setSliderData(data);
      } catch (error) {
        console.error("Erreur lors du fetch des sliders:", error);
      }
    };

    fetchSliders();
  }, []);

  // Initialisation des positions et démarrage de l'autoplay
  useEffect(() => {
    if (sliderData.length === 0) return; // Ne fait rien si pas encore de data

    slidesRef.current.forEach((slide, i) => {
      if (slide) {
        gsap.set(slide, { xPercent: i * 100 });
      }
    });

    startAutoplay();

    return () => stopAutoplay(); // Nettoie si composant démonte
  }, [sliderData]); // important de mettre sliderData pour charger les bonnes données dans l'animation

  // Démarre l'autoplay
  const startAutoplay = (): void => {
    autoplayRef.current = setInterval(() => {
      gotoSlide(1); // Passe à la slide suivante automatiquement
    }, autoplayInterval);
  };

  // Stop l'autoplay
  const stopAutoplay = (): void => {
    if (autoplayRef.current) {
      clearInterval(autoplayRef.current);
      autoplayRef.current = null;
    }
  };

  // Navigue entre les slides
  const gotoSlide = (steps: number): void => {
    if (isAnimatingRef.current) return; // Empêche l'exécution si une animation est déjà en cours
    isAnimatingRef.current = true; // Active le verrou pendant l'animation

    const currentIndex = currentIndexRef.current; // Index actuel
    const targetIndex = (currentIndex + steps + totalSlides) % totalSlides; // Calcul de l'index cible

    const currentInfoElement = imageInfoRefs.current[currentIndex];
    const targetInfoElement = imageInfoRefs.current[targetIndex];
    const currentSlideElement = slidesRef.current[currentIndex];
    const targetSlideElement = slidesRef.current[targetIndex];

    if (!currentInfoElement || !currentSlideElement || !targetSlideElement) {
      isAnimatingRef.current = false;
      return;
    }

    // Animation de sortie pour le texte de la slide actuelle
    gsap.to(currentInfoElement, {
      opacity: 0,
      y: -20,
      duration: 0.5,
      onComplete: () => {
        // Anime la slide actuelle pour qu'elle sorte
        gsap.to(currentSlideElement, {
          xPercent: -steps * 100,
          duration: slideDuration,
        });

        // Anime la slide cible pour qu'elle entre
        gsap.fromTo(
          targetSlideElement,
          { xPercent: steps * 100 },
          {
            xPercent: 0,
            duration: slideDuration,
            onComplete: () => {
              isAnimatingRef.current = false; // Libère le verrou après l'animation
            },
          }
        );

        // Anime l'entrée du texte de la nouvelle slide
        if (targetInfoElement) {
          gsap.fromTo(
            targetInfoElement,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.5, delay: slideDuration / 2 }
          );
        }

        // Met à jour l'index courant
        currentIndexRef.current = targetIndex;
        setActiveDotIndex(targetIndex); // Met à jour l'état pour les dots
      },
    });
  };

  // Va à la slide suivante
  const handleNext = (): void => {
    stopAutoplay(); // Arrête temporairement l'autoplay
    gotoSlide(1); // Avance d'une slide
    startAutoplay(); // Redémarre l'autoplay
  };

  // Va à la slide précédente
  const handlePrev = (): void => {
    stopAutoplay(); // Arrête temporairement l'autoplay
    gotoSlide(-1); // Recule d'une slide
    startAutoplay(); // Redémarre l'autoplay
  };

  // Fonction de navigation rapide dots
  const fastNavigateToSlide = (targetIndex: number): void => {
    stopAutoplay(); // Arrête l'autoplay

    const currentIndex = currentIndexRef.current; // Récupère l'index actuel de la slide active.
    const steps = targetIndex - currentIndex; // Calcule le nombre de slides à parcourir pour atteindre la cible.

    if (steps === 0) return; // Pas d'animation si on clique sur le dot actif

    const direction = steps > 0 ? 1 : -1; // Détermine la direction de la navigation :

    const totalSteps = Math.abs(steps); // Calcule le nombre total de transitions nécessaires (valeur absolue de `steps`)
    const intermediateDuration = 0; // Durée de chaque transition intermédiaire

    let currentStep = 0; // Initialise un compteur pour suivre les étapes intermédiaires.

    // Gère navigation circulaire des slides
    const navigateStep = (): void => {
      if (currentStep < totalSteps) {
        const intermediateIndex =
          (currentIndex + direction * (currentStep + 1) + totalSlides) %
          totalSlides;

        const currentSlide = slidesRef.current[currentIndexRef.current];
        const nextSlide = slidesRef.current[intermediateIndex];

        if (!currentSlide || !nextSlide) {
          currentStep++;
          navigateStep();
          return;
        }

        // Anime la slide actuelle pour qu'elle sorte
        gsap.to(currentSlide, {
          xPercent: -direction * 100,
          duration: intermediateDuration,
          ease: "power1.out",
        });

        // Anime la slide suivante pour qu'elle entre
        gsap.fromTo(
          nextSlide,
          { xPercent: direction * 100 },
          {
            xPercent: 0,
            duration: intermediateDuration,
            ease: "power1.out",
            onComplete: () => {
              currentIndexRef.current = intermediateIndex;
              currentStep++;
              navigateStep(); // Continue vers la slide suivante
            },
          }
        );
      } else {
        setActiveDotIndex(targetIndex); // Met à jour l'état des dots
        startAutoplay(); // Redémarre l'autoplay
      }
    };

    navigateStep(); // Lance la navigation rapide
  };

  // Fonction scroll next chevron bas
  const scrollToNextSection = (): void => {
    const nextSection = document.querySelector("#news");
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="slider-frame">
      {/* chargement image */}
      {sliderData.map((slide, index) => (
        <div
          key={slide.id}
          className="slider-slide"
          ref={(el: HTMLDivElement | null) => {
            slidesRef.current[index] = el;
          }}
        >
          <img
            src={slide.image}
            alt={slide.name || slide.title}
            className="slider-img"
          />
          {/* Infos slide */}
          <p
            ref={(el: HTMLParagraphElement | null) => {
              imageInfoRefs.current[index] = el;
            }}
            className="slider-image-info"
          >
            <span className="slider-image-name">{slide.title}</span>
            <br />
            <span className="slider-image-description">
              {slide.description}
            </span>
          </p>
        </div>
      ))}

      {/* Boutons de navigation */}
      <button
        onClick={handlePrev}
        data-hover-detect="true"
        className="slider-navigation-button prev-button"
        aria-label="Previous image"
      >
        <i className="fa-solid fa-chevron-left"></i>
      </button>
      <button
        onClick={handleNext}
        data-hover-detect="true"
        className="slider-navigation-button next-button"
        aria-label="Next image"
      >
        <i className="fa-solid fa-chevron-right"></i>
      </button>

      {/* Dots de navigation */}
      <div className="slider-dots-container">
        {sliderData.map((slide, index) => (
          <div
            key={slide.id}
            data-hover-detect="true"
            className={`slider-dot ${
              activeDotIndex === index ? "active" : "passive"
            }`}
            onClick={() => fastNavigateToSlide(index)}
          ></div>
        ))}
      </div>

      {/* Bouton descente */}
      <div className="slider-down-button-container">
        <button
          data-hover-detect="true"
          className="slider-down-button"
          onClick={scrollToNextSection}
        >
          <img src={downChevron} alt="down-chevron" />
        </button>
      </div>
    </div>
  );
};

export default Slider;

import React, { useState, useRef, useEffect } from "react";
import { gsap } from "gsap";
import { useParams } from "react-router-dom";
import Modal from "./Modal/Modal";
import { projectsData, galleryProjects } from "./Data/ProjectData";
import "./ProjectsDetails.css";

export default function ProjectsDetails() {

  const titleRef = useRef(null); // Animation titre
  const techRef = useRef(null); // Animation domaines

  useEffect(() => {
    if (!titleRef.current) {
      console.error("titleRef.current is null. The reference is not attached.");
      return;
    }

    // Animation pour le titre
    gsap.fromTo(
      titleRef.current,
      {
        y: 50,
        opacity: 0,
      },
      {
        y: 0,
        opacity: 1,
        duration: 1.5,
        ease: "power3.out",
        scrollTrigger: {
          trigger: titleRef.current,
          start: "top 90%",
          toggleActions: "play reverse play reverse",
        },
      }
    );
  }, []);

    //Animation tasks
    useEffect(() => {
      // Sélectionne tous les éléments <li> dans les deux colonnes
      const techItems = gsap.utils.toArray(".project-tech-list li");

      // Animation GSAP task
      gsap.fromTo(
        techItems,
        { x: 50, opacity: 0 }, // Départ hors écran à droite, invisible
        {
          x: 0, // Arrivée à la position normale
          opacity: 1, // Apparition complète
          duration: 3, // Durée d'apparition de chaque élément
          ease: "power3.out", // Effet fluide
          stagger: 0.2, // Intervalle progressif entre chaque élément
          scrollTrigger: {
            trigger: ".projectDetails-1-tech", // Déclenchement lorsque la section entre dans la vue
            start: "top 80%", // Commence quand le haut de la section est à 80% de l'écran
            toggleActions: "play none none none", // Joue une seule fois
          },
        }
      );
    }, []);


  const { slug } = useParams();
  const projet = projectsData.find((proj) => proj.slug === slug);
  const gallery = galleryProjects.find((g) => g.gallerySlug === "gallery1");

  // États pour la modale
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const openModal = (imageSrc) => {
    setSelectedImage(imageSrc);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedImage(null);
    setIsModalOpen(false);
  };

  if (!projet) {
    return <h2>Projet introuvable</h2>;
  }

  return (
    <div id="projectDetails" className="projectDetails-container">
      <div className="projectDetails-1">
        <div className="projectDetails-1-imageDiv">
          <img src={projet.imgSrc} alt={projet.title} />
        </div>
        <div className="projectDetails-1-infos">
          <div className="projecDetails-1-title">
            <h2
            className="sub-2"
            ref={titleRef}
            >{projet.title}</h2>
            <p>{projet.location}</p>
          </div>
          <div className="projectDetails-1-text">
            <div className="projectDetails-1-description">
              <p>{projet.description1}</p>
              <p>{projet.description2}</p>
            </div>
            <div className="projectDetails-1-tech">
              <ul
              ref={techRef}
              className="project-tech-list">
                <div className="tech-list-left">
                  <li>
                    <i className="fas fa-tools"></i> <strong>Type :</strong>{" "}
                    Réhabilitation & Modernisation
                  </li>
                  <li>
                    <i className="fas fa-map-marker-alt"></i>{" "}
                    <strong>Localisation :</strong> Rennes
                  </li>
                  <li>
                    <i className="fas fa-ruler-combined"></i>{" "}
                    <strong>Superficie :</strong> 120 m²
                  </li>
                </div>
                <div className="tech-list-right">
                  <li>
                    <i className="fas fa-user-tie"></i>{" "}
                    <strong>Maîtrise d’ouvrage :</strong> Commande privée
                  </li>
                  <li>
                    <i className="fas fa-lightbulb"></i>{" "}
                    <strong>Intervention :</strong> De l’étude à la
                    concrétisation
                  </li>
                  <li>
                    <i className="fas fa-check-circle"></i>{" "}
                    <strong>Avancement :</strong> Projet finalisé
                  </li>
                </div>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="projectDetails-2">
        



        {/* Composant Modale */}
        <Modal
          isOpen={isModalOpen}
          imageSrc={selectedImage}
          onClose={closeModal}
        />
      </div>
    </div>
  );
}

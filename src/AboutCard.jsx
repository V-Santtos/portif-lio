import { useRef, useState } from "react";

function AboutCard({ imageUrl, imageAlt = "", title, description, tag }) {
  const cardRef = useRef(null);
  const [style, setStyle] = useState({});
  const hasContent = Boolean(title || description || tag);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const { left, top, width, height } = cardRef.current.getBoundingClientRect();
    const x = e.clientX - left;
    const y = e.clientY - top;
    const rotateX = ((y - height / 2) / (height / 2)) * -8;
    const rotateY = ((x - width / 2) / (width / 2)) * 8;
    setStyle({
      transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.04, 1.04, 1.04)`,
      transition: "transform 0.1s ease-out",
    });
  };

  const handleMouseLeave = () => {
    setStyle({
      transform: "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)",
      transition: "transform 0.4s ease-in-out",
    });
  };

  return (
    <div
      ref={cardRef}
      className={`about-card${hasContent ? "" : " about-card--image-only"}`}
      style={style}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {imageUrl && (
        <img src={imageUrl} alt={imageAlt} className="about-card__img" />
      )}
      {hasContent && <div className="about-card__overlay" />}

      {hasContent && (
        <div className="about-card__content">
          <div className="about-card__header">
            <div>
              {title && <h3 className="about-card__title">{title}</h3>}
              {description && <p className="about-card__desc">{description}</p>}
            </div>
          </div>

          {tag && <div className="about-card__tag">{tag}</div>}
        </div>
      )}
    </div>
  );
}

export default AboutCard;

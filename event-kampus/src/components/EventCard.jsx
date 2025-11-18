import React from "react";

function EventCard({id, title, date, location, description, organizer, image, onDelete }) {
  return (
    <div className="event-card">
      {image && <img src={image} alt={title} className="event-img" />}
      <div className="event-content">
        <h3>{title}</h3>
        <p className="desc">{description}</p>
        <p><strong>Tanggal:</strong> {date}</p>
        <p><strong>Lokasi:</strong> {location}</p>
        <p><strong>Penyelenggara:</strong> {organizer}</p>

         <button className="btn-delete" onClick={() => onDelete(id)}>
          Hapus
        </button>
      </div>
    </div>
  );
}

export default EventCard;

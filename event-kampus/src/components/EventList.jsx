import React from "react";
import EventCard from "./EventCard";

function EventList({ events, onDelete }) {
  return (
    <div className="event-list">
      {events.map((event) => (
        <EventCard
          key={event.id}
          id={event.id}
          title={event.title}
          date={event.date}
          location={event.location}
          description={event.description}
          organizer={event.organizer}
          image={event.image}
          onDelete={onDelete}  
        />
      ))}
    </div>
  );
}

export default EventList;

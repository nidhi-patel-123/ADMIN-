import React, { useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import enUS from "date-fns/locale/en-US";
import "react-big-calendar/lib/css/react-big-calendar.css";

const locales = {
  "en-US": enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

// Custom Toolbar component
function CustomToolbar({ label, onNavigate, onView }) {
  return (
    <div className="rbc-toolbar" style={{ marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div className="rbc-btn-group">
        <button type="button" onClick={() => onNavigate("TODAY")}>
          Today
        </button>
        <button type="button" onClick={() => onNavigate("PREV")}>
          Back
        </button>
        <button type="button" onClick={() => onNavigate("NEXT")}>
          Next
        </button>
      </div>
      <span className="rbc-toolbar-label" style={{ fontWeight: "bold", fontSize: "1.2em" }}>
        {label}
      </span>
      <div className="rbc-btn-group">
        {/* Optional: View buttons */}
        <button type="button" onClick={() => onView("month")}>
          Month
        </button>
        <button type="button" onClick={() => onView("week")}>
          Week
        </button>
        <button type="button" onClick={() => onView("day")}>
          Day
        </button>
        {/* <button type="button" onClick={() => onView("agenda")}>
          Agenda
        </button> */}
      </div>
    </div>
  );
}

export default function MyCalendar() {
  const [events, setEvents] = useState([
    {
      title: "All Day Event",
      allDay: true,
      start: new Date(2018, 0, 1),
      end: new Date(2018, 0, 1),
    },
    {
      title: "Long Event",
      start: new Date(2018, 0, 7),
      end: new Date(2018, 0, 10),
    },
    {
      title: "Repeating Event",
      start: new Date(2018, 0, 9, 16, 0),
      end: new Date(2018, 0, 9, 17, 0),
    },
    {
      title: "Meeting",
      start: new Date(2018, 0, 12, 10, 30),
      end: new Date(2018, 0, 12, 11, 30),
    },
    {
      title: "Birthday Party",
      start: new Date(2018, 0, 13, 7, 0),
      end: new Date(2018, 0, 13, 10, 30),
    },
  ]);

  const [view, setView] = useState("month");
  const [date, setDate] = useState(new Date());

  const handleSelectSlot = ({ start, end }) => {
    const title = window.prompt("Enter Event Title");
    if (title) {
      setEvents((prevEvents) => [...prevEvents, { start, end, title }]);
    }
  };

  const handleSelectEvent = (event) => {
    if (window.confirm(`Delete event '${event.title}'?`)) {
      setEvents((prevEvents) => prevEvents.filter((e) => e !== event));
    }
  };

  // Handle navigation buttons
  const handleNavigate = (action) => {
    let newDate = date;
    switch (action) {
      case "TODAY":
        newDate = new Date();
        break;
      case "PREV":
        if (view === "month") {
          newDate = new Date(date.getFullYear(), date.getMonth() - 1, 1);
        } else if (view === "week") {
          newDate = new Date(date.getTime() - 7 * 24 * 60 * 60 * 1000);
        } else if (view === "day") {
          newDate = new Date(date.getTime() - 24 * 60 * 60 * 1000);
        }
        break;
      case "NEXT":
        if (view === "month") {
          newDate = new Date(date.getFullYear(), date.getMonth() + 1, 1);
        } else if (view === "week") {
          newDate = new Date(date.getTime() + 7 * 24 * 60 * 60 * 1000);
        } else if (view === "day") {
          newDate = new Date(date.getTime() + 24 * 60 * 60 * 1000);
        }
        break;
      default:
        break;
    }
    setDate(newDate);
  };

  return (
    <div className="p-4">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 700 }}
        selectable
        onSelectEvent={handleSelectEvent}
        onSelectSlot={handleSelectSlot}
        views={["month", "week", "day", "agenda"]}
        view={view}
        onView={setView}
        date={date}
        onNavigate={setDate}
        components={{
          toolbar: CustomToolbar,
        }}
        popup
      />
    </div>
  );
}
import React from "react";
import type { Contact } from "./types/contact";
import "./PersonInfo.css";

type PersonInfoProps = {
  contact: Contact;
  onToggleSelect: (id: string) => void;
  isSelected: boolean;
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const PersonInfo = React.memo(function PersonInfo({
  contact,
  isSelected,
  onToggleSelect,
}: PersonInfoProps) {
  const { emailAddress, firstNameLastName, id, jobTitle } = contact;

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onToggleSelect(id);
    }
  };

  return (
    <div
      className={`person-info ${isSelected ? "selected" : ""}`}
      onClick={() => onToggleSelect(id)}
      onKeyDown={onKeyDown}
      role="button"
      tabIndex={0}
      aria-pressed={isSelected}
    >
      <div className="person-avatar">{getInitials(firstNameLastName)}</div>
      <div className="person-details">
        <div className="person-name">{firstNameLastName}</div>
        <div className="person-job">{jobTitle}</div>
        <div className="person-email">{emailAddress}</div>
      </div>
    </div>
  );
});

export default PersonInfo;

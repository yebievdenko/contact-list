import { useMemo } from "react";
import { List, type RowComponentProps } from "react-window";
import PersonInfo from "../PersonInfo";
import type { Contact } from "../types/contact";
import "./VirtualizedContactList.css";

type VirtualizedContactListProps = {
  contacts: Contact[];
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
};

type RowData = {
  contacts: Contact[];
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
};

const ROW_HEIGHT = 128;
const ROW_OVERSCAN = 6;

function ContactRow({
  ariaAttributes,
  contacts,
  index,
  onToggleSelect,
  selectedIds,
  style,
}: RowComponentProps<RowData>) {
  const contact = contacts[index];

  return (
    <div className="list-row" style={style} {...ariaAttributes}>
      <PersonInfo
        contact={contact}
        isSelected={selectedIds.has(contact.id)}
        onToggleSelect={onToggleSelect}
      />
    </div>
  );
}

export default function VirtualizedContactList({
  contacts,
  onToggleSelect,
  selectedIds,
}: VirtualizedContactListProps) {
  const rowProps = useMemo<RowData>(() => {
    return {
      contacts,
      onToggleSelect,
      selectedIds,
    };
  }, [contacts, onToggleSelect, selectedIds]);

  return (
    <div className="list">
      <List
        className="virtual-list"
        defaultHeight={480}
        overscanCount={ROW_OVERSCAN}
        rowComponent={ContactRow}
        rowCount={contacts.length}
        rowHeight={ROW_HEIGHT}
        rowProps={rowProps}
        style={{ height: "100%", width: "100%" }}
      />
    </div>
  );
}

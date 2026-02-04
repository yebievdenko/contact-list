import { useCallback, useMemo, useState } from "react";
import type { Contact } from "../types/contact";

type UseContactSelectionResult = {
  onToggleSelect: (id: string) => void;
  orderedContacts: Contact[];
  selectedCount: number;
  selectedIds: Set<string>;
};

export function useContactSelection(
  contacts: Contact[]
): UseContactSelectionResult {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const onToggleSelect = useCallback((id: string) => {
    setSelectedIds((currentSelectedIds) => {
      const nextSelectedIds = new Set(currentSelectedIds);

      if (nextSelectedIds.has(id)) {
        nextSelectedIds.delete(id);
      } else {
        nextSelectedIds.add(id);
      }

      return nextSelectedIds;
    });
  }, []);

  const orderedContacts = useMemo(() => {
    const selectedContacts: Contact[] = [];
    const unselectedContacts: Contact[] = [];

    for (const contact of contacts) {
      if (selectedIds.has(contact.id)) {
        selectedContacts.push(contact);
      } else {
        unselectedContacts.push(contact);
      }
    }

    return [...selectedContacts, ...unselectedContacts];
  }, [contacts, selectedIds]);

  return {
    onToggleSelect,
    orderedContacts,
    selectedCount: selectedIds.size,
    selectedIds,
  };
}

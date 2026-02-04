import Spinner from "./components/Spinner";
import VirtualizedContactList from "./components/VirtualizedContactList";
import { useContactsPagination } from "./hooks/useContactsPagination";
import { useContactSelection } from "./hooks/useContactSelection";
import "./App.css";

export default function App() {
  const {
    contacts,
    error,
    fetchNextBatch,
    hasMore,
    isInitialLoading,
    isLoadingMore,
  } = useContactsPagination();

  const { onToggleSelect, orderedContacts, selectedCount, selectedIds } =
    useContactSelection(contacts);

  const isLoading = isInitialLoading || isLoadingMore;

  return (
    <div className="App">
      <div className="selected-title">Selected contacts: {selectedCount}</div>
      <div className="contacts-count">Contacts count: {contacts.length}</div>

      <VirtualizedContactList
        contacts={orderedContacts}
        selectedIds={selectedIds}
        onToggleSelect={onToggleSelect}
      />

      <div className="status-area">
        {isLoading && <Spinner />}
        {error && <div className="error">Error: {error.message}</div>}
      </div>

      <button
        onClick={() => void fetchNextBatch(error ? error.phase : "more")}
        disabled={isLoading || (!error && !hasMore)}
      >
        {error ? "Retry" : "Load more"}
      </button>
    </div>
  );
}

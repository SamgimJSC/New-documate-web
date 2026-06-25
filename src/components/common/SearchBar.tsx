import React, { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import { documentService } from "../../services/documentService";
import type { Document } from "../../types/document";
import "./SearchBar.css";

type SearchField = "title" | "tag" | "ocr";

interface Props {
  onSearch: (keyword: string, searchField?: SearchField) => void;
  placeholder?: string;
}

const RECENT_KEY = "documate_recent_searches";
const MAX_RECENT = 5;

const FIELD_LABELS: Record<SearchField, string> = {
  title: "문서명",
  tag: "태그",
  ocr: "OCR 본문",
};

export const SearchBar: React.FC<Props> = ({ onSearch, placeholder }) => {
  const [value, setValue] = useState("");
  const [activeField, setActiveField] = useState<SearchField | undefined>();
  const [suggestions, setSuggestions] = useState<Document[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem(RECENT_KEY);
    if (stored) setRecentSearches(JSON.parse(stored));
  }, []);

  useEffect(() => {
    if (!value.trim()) {
      setSuggestions([]);
      return;
    }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const results = await documentService.getDocuments({
          keyword: value,
          limit: 5,
        });
        setSuggestions(results);
      } catch {
        setSuggestions([]);
      }
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [value]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const saveRecent = (kw: string) => {
    const next = [kw, ...recentSearches.filter((r) => r !== kw)].slice(
      0,
      MAX_RECENT,
    );
    setRecentSearches(next);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  };

  const commit = (kw: string, field?: SearchField) => {
    if (!kw.trim()) return;
    saveRecent(kw);
    setValue(kw);
    setOpen(false);
    onSearch(kw, field ?? activeField);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") commit(value);
    if (e.key === "Escape") setOpen(false);
  };

  const handleClear = () => {
    setValue("");
    setSuggestions([]);
    setActiveField(undefined);
    onSearch("", undefined);
  };

  const toggleField = (field: SearchField) => {
    const next = activeField === field ? undefined : field;
    setActiveField(next);
    if (value.trim()) onSearch(value, next);
  };

  const showDropdown =
    open &&
    (recentSearches.length > 0 ||
      suggestions.length > 0 ||
      value.trim().length > 0);

  return (
    <div className="search-bar" ref={containerRef}>
      <div className="search-bar__input-wrap">
        <Search size={16} className="search-bar__icon" />
        <input
          className="search-bar__input"
          placeholder={placeholder ?? "문서명, 태그, OCR 본문 검색..."}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
        />
        {value && (
          <button className="search-bar__clear" onClick={handleClear}>
            <X size={14} />
          </button>
        )}
      </div>

      {showDropdown && (
        <div className="search-bar__dropdown">
          {recentSearches.length > 0 && !value && (
            <div className="search-bar__section">
              <span className="search-bar__label">추천 검색어</span>
              <div className="search-bar__chips">
                {recentSearches.map((r) => (
                  <button
                    key={r}
                    className="search-bar__chip"
                    onClick={() => commit(r)}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          )}

          {suggestions.length > 0 && (
            <div className="search-bar__section">
              <span className="search-bar__label">검색 제안</span>
              {suggestions.map((doc) => (
                <button
                  key={doc.document_id}
                  className="search-bar__suggestion"
                  onClick={() => commit(doc.title)}
                >
                  <span className="search-bar__suggestion-title">
                    {doc.title}
                  </span>
                  <span className="search-bar__suggestion-type">문서명</span>
                </button>
              ))}
            </div>
          )}

          <div className="search-bar__section">
            <span className="search-bar__label">빠른 필터</span>
            <div className="search-bar__chips">
              {(["title", "tag", "ocr"] as SearchField[]).map((f) => (
                <button
                  key={f}
                  className={`search-bar__chip${activeField === f ? " search-bar__chip--active" : ""}`}
                  onClick={() => toggleField(f)}
                >
                  {FIELD_LABELS[f]}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

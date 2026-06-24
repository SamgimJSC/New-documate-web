import { useEffect, useState } from "react";
import { documentService } from "../services/documentService";
import type { DocumentCategory } from "../types/document";

let cache: DocumentCategory[] | null = null;

export function useCategories() {
  const [categories, setCategories] = useState<DocumentCategory[]>(cache ?? []);

  useEffect(() => {
    if (cache) return;
    documentService.getCategories().then((data) => {
      cache = data;
      setCategories(data);
    });
  }, []);

  return categories;
}

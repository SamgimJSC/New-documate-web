import React, { useState } from "react";
import Modal from "../common/Modal";
import Button from "../common/Button";
import Select from "../common/Select";
import { useCategories } from "../../hooks/useCategories";
import { useToast } from "../common/Toast";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentCategoryId?: number;
}

const CategoryEditModal: React.FC<Props> = ({ isOpen, onClose, currentCategoryId }) => {
  const { showToast } = useToast();
  const categories = useCategories();
  const [categoryId, setCategoryId] = useState(String(currentCategoryId || ""));

  const options = categories.map((c) => ({ value: String(c.category_id), label: c.name }));

  const handleSave = () => {
    showToast("카테고리가 변경되었습니다.", "success");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="카테고리 변경" size="sm">
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Select
          label="카테고리"
          value={categoryId}
          options={options}
          onChange={(e) => setCategoryId(e.target.value)}
        />
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <Button variant="ghost" onClick={onClose}>취소</Button>
          <Button variant="primary" onClick={handleSave}>저장</Button>
        </div>
      </div>
    </Modal>
  );
};

export default CategoryEditModal;

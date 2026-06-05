import React from "react";
import "./FilterChip.css";

interface FilterChipProps {
  label: string;
  selected: boolean;
  onClick: () => void;
}

const FilterChip: React.FC<FilterChipProps> = ({ label, selected, onClick }) => {
  return (
    <button
      type="button"
      className={`filter-chip${selected ? " filter-chip--selected" : ""}`}
      onClick={onClick}
    >
      {label}
    </button>
  );
};

export default FilterChip;

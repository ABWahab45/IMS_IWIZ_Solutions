import React, { useState, useRef, useEffect } from 'react';

const SearchableDropdown = ({
  options,
  value,
  onChange,
  placeholder = "Search and select...",
  displayKey = "name",
  valueKey = "_id",
  searchKeys = ["name"],
  disabled = false,
  required = false,
  className = "form-control"
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOptions, setFilteredOptions] = useState(options);
  const dropdownRef = useRef(null);

  useEffect(() => {
    setFilteredOptions(options);
  }, [options]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearch = (term) => {
    setSearchTerm(term);
    if (!term.trim()) {
      setFilteredOptions(options);
      return;
    }

    const filtered = options.filter(option => {
      return searchKeys.some(key => {
        const value = option[key];
        return value && value.toString().toLowerCase().includes(term.toLowerCase());
      });
    });
    setFilteredOptions(filtered);
  };

  const handleSelect = (option) => {
    onChange(option[valueKey]);
    setSearchTerm('');
    setIsOpen(false);
  };

  const selectedOption = options.find(option => option[valueKey] === value);

  return (
    <div className="position-relative" ref={dropdownRef}>
      <div className="position-relative">
        <input
          type="text"
          className={className}
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => setIsOpen(true)}
          placeholder={selectedOption ? selectedOption[displayKey] : placeholder}
          disabled={disabled}
          required={required}
          style={{ paddingRight: '40px' }}
        />
        <button
          className="btn btn-link position-absolute"
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          disabled={disabled}
          style={{
            right: '8px',
            top: '50%',
            transform: 'translateY(-50%)',
            border: 'none',
            background: 'transparent',
            color: '#6c757d',
            padding: '0',
            zIndex: 2
          }}
        >
          <i className={`fas fa-chevron-${isOpen ? 'up' : 'down'}`}></i>
        </button>
      </div>
      
      {isOpen && (
        <div className="position-absolute w-100 mt-1 border rounded bg-white shadow-lg" style={{ zIndex: 1000, maxHeight: '200px', overflowY: 'auto' }}>
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option, index) => (
              <div
                key={option[valueKey] || index}
                className="px-3 py-2 cursor-pointer hover-bg-light"
                style={{ cursor: 'pointer' }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                onClick={() => handleSelect(option)}
              >
                {option[displayKey]}
              </div>
            ))
          ) : (
            <div className="px-3 py-2 text-muted">
              No options found
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchableDropdown;

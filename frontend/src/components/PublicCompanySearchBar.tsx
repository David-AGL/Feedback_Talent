import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, ListGroup, Spinner, Image } from 'react-bootstrap';
import { FaSearch, FaBuilding } from 'react-icons/fa';

interface Company {
  _id: string;
  companyName: string;
  profileImageUrl?: string;
}

const PublicCompanySearchBar: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (searchTerm.length < 2) {
      setResults([]);
      return;
    }

    const fetchCompanies = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `http://localhost:4000/api/auth/companies/search?q=${encodeURIComponent(searchTerm)}`
        );
        const data = await response.json();
        // The search endpoint returns 'name', but the top companies endpoint returns 'companyName'.
        // I will adapt to what the search endpoint returns, assuming it's 'name'.
        // If not, I'll need to adjust. Let's assume the property is `name` for now.
        const formattedData = data.map((c: any) => ({ ...c, companyName: c.name }));
        setResults(formattedData);
      } catch (error) {
        console.error('Error searching companies:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchCompanies, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelectCompany = (companyId: string) => {
    setSearchTerm('');
    setShowResults(false);
    navigate(`/company/${companyId}`);
  };

  return (
    <div ref={searchRef} className="position-relative">
      <div className="input-group">
        <span className="input-group-text bg-white border-end-0">
          <FaSearch />
        </span>
        <Form.Control
          type="text"
          placeholder="Buscar una empresa..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setShowResults(true)}
          className="border-start-0"
        />
      </div>
      {showResults && (searchTerm.length > 0) && (
        <ListGroup className="position-absolute w-100" style={{ zIndex: 1000 }}>
          {loading ? (
            <ListGroup.Item className="text-center">
              <Spinner animation="border" size="sm" />
              <span className="ms-2">Buscando...</span>
            </ListGroup.Item>
          ) : results.length > 0 ? (
            results.map((company) => (
              <ListGroup.Item
                key={company._id}
                action
                onClick={() => handleSelectCompany(company._id)}
                className="d-flex align-items-center"
              >
                {company.profileImageUrl ? (
                  <Image src={company.profileImageUrl} roundedCircle width="40" height="40" className="me-3" />
                ) : (
                  <div className="me-3 bg-light rounded-circle d-flex align-items-center justify-content-center" style={{ width: 40, height: 40 }}>
                    <FaBuilding />
                  </div>
                )}
                {company.companyName}
              </ListGroup.Item>
            ))
          ) : (
            searchTerm.length > 1 && <ListGroup.Item>No se encontraron empresas.</ListGroup.Item>
          )}
        </ListGroup>
      )}
    </div>
  );
};

export default PublicCompanySearchBar;

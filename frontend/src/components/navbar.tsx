import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from '../contexts/AuthContext';

const MyNavbar: React.FC = () => {
  const { isAuthenticated, logout, role, companyId, user } = useAuth(); // Obtener companyId y user
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  console.log('isAuthenticated:', isAuthenticated);

  return (
    <Navbar expand="lg">
      <Container>
        <Navbar.Brand as={Link} to="/">
          <img
            src="../pagina-principal.png"
            alt="Logo de Feedback Talent"
            width="40"
            height="40"
            className="d-inline-block align-top me-2"
          />
          Feedback Talent
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />

        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            {isAuthenticated ? (
              <>
                <Nav.Link as={Link} to="/">Inicio</Nav.Link>

                {/* Mostrar Encuestas solo para employee y candidate */}
                {(role === 'employee' || role === 'candidate') && (
                  <>
                    <NavDropdown title="Encuestas" id="basic-nav-dropdown">
                      {role === 'candidate' && (
                        <NavDropdown.Item as={Link} to="/surveycandidate">
                          Candidato
                        </NavDropdown.Item>
                      )}
                      {role === 'employee' && (
                        <NavDropdown.Item as={Link} to="/surveyemployee">
                          Empleado
                        </NavDropdown.Item>
                      )}
                    </NavDropdown>
                    <Nav.Link as={Link} to="/feedback-history">Historial</Nav.Link>
                  </>
                )}

                {/* Mostrar Dashboard solo para company */}
                {role === 'company' && (
                  <Nav.Link as={Link} to="/dashboard">Dashboard</Nav.Link>
                )}

                {/* Mostrar Perfil de Empresa solo para company */}
                {role === 'company' && (
                  <Nav.Link as={Link} to={`/company-profile/${companyId}`}>Perfil</Nav.Link>
                )}

                {/* Mostrar Perfil de Usuario solo para employee y candidate */}
                {(role === 'employee' || role === 'candidate') && user && (
                  <Nav.Link as={Link} to={`/user-profile/${user._id}`}>Perfil</Nav.Link>
                )}

                <Nav.Link onClick={handleLogout} style={{ 
                    cursor: 'pointer',
                    fontWeight: 500,
                    backgroundColor: 'var(--secondary-color)',
                    color: 'white',
                    borderRadius: '8px',
                    padding: '8px 16px',
                    marginLeft: '8px',
                    transition: 'all 0.3s ease' }}
                    onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--secondary-hover)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--secondary-color)';
                  }}>
                  Log out
                </Nav.Link>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login">Log in</Nav.Link>
                <Nav.Link as={Link} to="/register">Regístrate</Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default MyNavbar;

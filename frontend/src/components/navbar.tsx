import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from '../contexts/AuthContext';

const MyNavbar: React.FC = () => {
  const { isAuthenticated, logout, role } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  console.log('isAuthenticated:', isAuthenticated);

  return (
    <Navbar bg="dark" variant="dark" expand="lg" style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
      }}>
      <Container>
        <Navbar.Brand as={Link} to="/">
          <img
            src="../pagina-principal.png"
            alt="Logo"
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
                <Nav.Link as={Link} to="/" style={{ fontWeight: 500 }}>Inicio</Nav.Link>

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
                    <Nav.Link as={Link} to="/feedback-history" style={{ fontWeight: 500 }}>Historial</Nav.Link>
                  </>
                )}

                {/* Mostrar Dashboard solo para company */}
                {role === 'company' && (
                  <Nav.Link as={Link} to="/dashboard" style={{ fontWeight: 500 }}>Dashboard</Nav.Link>
                )}

                {/* Mostrar Perfil de Empresa solo para company */}
                {role === 'company' && (
                  <Nav.Link as={Link} to="/companyprofile" style={{ fontWeight: 500 }}>Perfil</Nav.Link>
                )}

                {/* Mostrar Perfil de Usuario solo para employee y candidate */}
                {(role === 'employee' || role === 'candidate') && (
                  <Nav.Link as={Link} to="/userprofile" style={{ fontWeight: 500 }}>Perfil</Nav.Link>
                )}

                <Nav.Link onClick={handleLogout} style={{ 
                    cursor: 'pointer',
                    fontWeight: 500,
                    background: 'rgba(255,255,255,0.2)',
                    borderRadius: '8px',
                    padding: '8px 16px',
                    marginLeft: '8px',
                    transition: 'all 0.3s ease' }}
                    onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
                  }}>
                  Log out
                </Nav.Link>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login" style={{ fontWeight: 500 }}>Log in</Nav.Link>
                <Nav.Link as={Link} to="/register" style={{ fontWeight: 500 }}>Regístrate</Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default MyNavbar;
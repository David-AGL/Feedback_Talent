import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css'; // Importamos Bootstrap
import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap'; // Importamos componentes de react-bootstrap
import { Link } from "react-router-dom";


const MyNavbar: React.FC = () => {
  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Container>
        {/* Logo o nombre del sitio */}
        <Navbar.Brand href='home' as={Link} to="/">
          <img
            src="../pagina-principal.png"
            alt="Logo"
            width="40"
            height="40"
            className="d-inline-block align-top me-2"
          />
          Feedback Talent
        </Navbar.Brand>

        {/* Botón de menú (solo visible en pantallas pequeñas) */}
        <Navbar.Toggle aria-controls="basic-navbar-nav" />

        {/* Contenedor del contenido colapsable */}
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link href="home">Inicio</Nav.Link>
            <Nav.Link href="profile">Perfil</Nav.Link>
            <NavDropdown title="Encuestas" id="basic-nav-dropdown">
              <NavDropdown.Item as={Link} to="/surveycandidate">Candidato</NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/surveyemployee">Empleado</NavDropdown.Item>
            </NavDropdown>
            <Nav.Link href="login">Log out</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default MyNavbar;
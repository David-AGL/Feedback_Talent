import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

const Footer: React.FC = () => {
  return (
    <footer style={{ backgroundColor: '#F8F9FA', color: 'black', padding: '1rem 0', marginTop: '2rem' }}>
      <Container>
        <Row>
          <Col md={12} style={{textAlign:'center'}}>
            <p>&copy; {new Date().getFullYear()} Feedback Talent. By <a href='https://www.magneto365.com/co' style={{textDecoration: 'none'}} >Magneto.</a></p>
            <p>Todos los derechos reservados.</p>
            <p>
              <a href="/privacidad" style={{ color: '#0A66C2', textDecoration: 'none' }}>Política de Privacidad</a> | 
              <a href="/cookies" style={{ color: '#0A66C2', textDecoration: 'none' }}>Uso de Cookies</a>
            </p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
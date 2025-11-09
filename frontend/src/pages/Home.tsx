import React, {useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Accordion, Button, Badge } from 'react-bootstrap';
import { FaUsers, FaChartLine, FaChartBar, FaChevronDown } from 'react-icons/fa';
import { getTopCompanies } from "../services/api";

const Home: React.FC = () => {
  const { isAuthenticated, role } = useAuth();
  const navigate = useNavigate();
  const [activeKey, setActiveKey] = useState<string | null>('0');
  const [topCompanies, setTopCompanies] = useState<any[]>([]); //para guardar las empresas mejores calificadas

  const handleAccordionToggle = (key: string) => {
    setActiveKey(activeKey === key ? null : key);
  };

  useEffect(() => {
    getTopCompanies()
      .then((data) => {
        console.log("Empresas mejor calificadas:", data);
        setTopCompanies(data);
      })
      .catch((err) => console.error("Error al obtener empresas:", err));
  }, []);

  // Noticias / Novedades
  const news = [
    {
      id: '0',
      title: '🎉 Nueva funcionalidad: Análisis de Feedback en tiempo real',
      date: '15 de Octubre, 2025',
      content:
        'Ahora las empresas pueden ver métricas y análisis detallados del feedback de sus candidatos y empleados en tiempo real. Incluye gráficos interactivos y reportes personalizables.',
      category: 'Actualización',
    },
    {
      id: '1',
      title: '📊 Mejoras en el sistema de encuestas',
      date: '10 de Octubre, 2025',
      content:
        'Hemos optimizado la experiencia de usuario en las encuestas con nuevas preguntas dinámicas, mejor diseño responsive y una barra de progreso que te permite ver cuánto has completado.',
      category: 'Mejora',
    },
    {
      id: '2',
      title: '🚀 Integración con Magneto365',
      date: '5 de Octubre, 2025',
      content:
        'Feedback Talent ahora está completamente integrado con Magneto365, permitiendo sincronización automática de datos de candidatos y empleados para una gestión más eficiente.',
      category: 'Integración',
    },
    {
      id: '3',
      title: '🔒 Mejoras de seguridad y privacidad',
      date: '1 de Octubre, 2025',
      content:
        'Implementamos nuevos protocolos de seguridad y encriptación para proteger tus datos. Todas las respuestas son completamente anónimas y seguras.',
      category: 'Seguridad',
    },
  ];

  // Estadísticas
  const stats = [
    { icon: <FaUsers size={40} />, value: '10,000+', label: 'Usuarios Activos', color: 'var(--primary-color)' },
    { icon: <FaChartBar size={40} />, value: '50,000+', label: 'Encuestas Completadas', color: 'var(--primary-hover)' },
    { icon: <FaChartLine size={40} />, value: '95%', label: 'Satisfacción', color: 'var(--secondary-color)' },
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Actualización':
        return 'primary';
      case 'Mejora':
        return 'success';
      case 'Integración':
        return 'info';
      case 'Seguridad':
        return 'secondary';
      default:
        return 'dark';
    }
  };

  return (
    <div className="bg-light min-vh-100">
      {/* Hero Section */}
      <section
        className="text-center text-white py-5"
        style={{
          background: `linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%)`,
        }}
      >
        <Container>
          <h1 className="fw-bold display-5 mb-3">Bienvenido a Feedback Talent</h1>
          <p className="fs-4 mb-4">
            La plataforma de feedback que impulsa el crecimiento profesional
          </p>

          {!isAuthenticated ? (
            <div className="d-flex justify-content-center gap-3 flex-wrap">
              <Button
                variant="light"
                size="lg"
                onClick={() => navigate('/register')}
                className="fw-semibold px-4 py-2"
              >
                Comenzar Ahora
              </Button>
              <Button
                variant="outline-light"
                size="lg"
                onClick={() => navigate('/login')}
                className="fw-semibold px-4 py-2"
              >
                Iniciar Sesión
              </Button>
            </div>
          ) : (
            <Button
              variant="light"
              size="lg"
              onClick={() => {
                if (role === 'employee') navigate('/surveyemployee');
                else if (role === 'candidate') navigate('/surveycandidate');
                else if (role === 'company') navigate('/dashboard');
              }}
              className="fw-semibold px-4 py-2"
            >
              Revisemos!
            </Button>
          )}
        </Container>
      </section>

      {/* Estadísticas */}
      <Container className="py-5">
        <Row className="g-4 mb-5">
          {stats.map((stat, i) => (
            <Col md={4} key={i}>
              <Card className="text-center border-0 shadow-sm h-100">
                <Card.Body>
                  <div style={{ color: stat.color }} className="mb-3">
                    {stat.icon}
                  </div>
                  <h2 className="fw-bold" style={{ color: stat.color }}>
                    {stat.value}
                  </h2>
                  <p className="text-muted">{stat.label}</p>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Empresas mejor calificadas */}
        <div className="bg-white p-4 rounded shadow-sm mb-5">
          <h3
            className="fw-bold mb-3 text-center"
            style={{
              background: `linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            🌟 Empresas mejor calificadas
          </h3>

          {topCompanies.length > 0 ? (
            <Row className="g-4 justify-content-center">
              {topCompanies.map((company) => (
                <Col md={4} key={company._id}>
                  <Card
                    className="border-0 shadow-sm h-100 text-center hover-shadow transition"
                    onClick={() => navigate(`/company/${company._id}`)}
                    title={`Ver perfil de ${company.companyName}`}
                    style={{ cursor: "pointer" }}
                  >
                    <Card.Body>
                      <h5 className="fw-bold mb-2">
                        {company.companyName || `Empresa #${company._id}`}
                      </h5>
                      <p className="text-muted mb-1">
                        ⭐ Promedio:{" "}
                        <span className="fw-semibold text-primary">
                          {company.avgRating ? company.avgRating.toFixed(2) : "N/A"}
                        </span>
                      </p>
                      <p className="text-muted mb-0">
                        📝 Feedbacks: {company.totalFeedbacks}
                      </p>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          ) : (
            <p className="text-center text-muted">
              No hay datos de empresas aún.
            </p>
          )}
        </div>


        {/* Noticias */}
        <div className="bg-white p-4 rounded shadow-sm mb-5">
          <h3
            className="fw-bold mb-2 text-center"
            style={{
              background: `linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Novedades y Actualizaciones
          </h3>
          <p className="text-muted text-center mb-4">
            Mantente al día con las últimas mejoras de Feedback Talent
          </p>

          <Accordion activeKey={activeKey}>
            {news.map((item) => (
              <Accordion.Item eventKey={item.id} key={item.id} className="mb-2 border-0 shadow-sm">
                <Accordion.Header onClick={() => handleAccordionToggle(item.id)}>
                  <Badge bg={getCategoryColor(item.category)} className="me-2">
                    {item.category}
                  </Badge>
                  <div className="flex-grow-1">
                    <h6 className="mb-0">{item.title}</h6>
                    <small className="text-muted">{item.date}</small>
                  </div>
                  <FaChevronDown className="ms-auto text-muted" />
                </Accordion.Header>
                <Accordion.Body>
                  <p className="text-muted mb-0">{item.content}</p>
                </Accordion.Body>
              </Accordion.Item>
            ))}
          </Accordion>
        </div>

        {/* Características */}
        <h3
          className="fw-bold text-center mb-4"
          style={{
            background: `linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          ¿Por qué elegir Feedback Talent?
        </h3>

        <Row className="g-4">
          {[
            {
              title: 'Feedback Anónimo',
              description: 'Respuestas completamente anónimas para mayor sinceridad',
              gradient: 'var(--primary-color)',
            },
            {
              title: 'Análisis en Tiempo Real',
              description: 'Visualiza métricas y tendencias instantáneamente',
              gradient: 'var(--secondary-color)',
            },
            {
              title: 'Fácil de Usar',
              description: 'Interfaz intuitiva diseñada para todos los usuarios',
              gradient: 'var(--primary-hover)',
            },
          ].map((feature, i) => (
            <Col md={4} key={i}>
              <Card
                className="text-white h-100 border-0 shadow-sm"
                style={{
                  background: feature.gradient,
                }}
              >
                <Card.Body>
                  <h5 className="fw-bold">{feature.title}</h5>
                  <p className="opacity-75">{feature.description}</p>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </div>
  );
};

export default Home;

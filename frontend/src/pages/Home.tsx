import React, {useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Accordion, Button, Badge } from 'react-bootstrap';
import { FaUsers, FaChartLine, FaChartBar } from 'react-icons/fa';
import { getTopCompanies } from "../services/api";
import PublicCompanySearchBar from '../components/PublicCompanySearchBar';

const Home: React.FC = () => {
  const { isAuthenticated, role } = useAuth();
  const navigate = useNavigate();
  const [activeKey, setActiveKey] = useState<string | null>('0');
  const [topCompanies, setTopCompanies] = useState<any[]>([]); //para guardar las empresas mejores calificadas
  const [selectedCategory, setSelectedCategory] = useState("general");

  const handleAccordionToggle = (key: string) => {
    setActiveKey(activeKey === key ? null : key);
  };

  useEffect(() => {
  const fetchCompanies = async () => {
    const url =
      selectedCategory === "general"
        ? "http://localhost:4000/api/responses/top-companies"
        : `http://localhost:4000/api/responses/top-companies/category/${encodeURIComponent(selectedCategory)}`;

    const res = await fetch(url);
    const data = await res.json();
    setTopCompanies(data);
  };

  fetchCompanies();
}, [selectedCategory]);

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
    { icon: <FaUsers size={40} aria-hidden="true" />, value: '10,000+', label: 'Usuarios Activos', color: 'var(--primary-color)' },
    { icon: <FaChartBar size={40} aria-hidden="true" />, value: '50,000+', label: 'Encuestas Completadas', color: 'var(--primary-hover)' },
    { icon: <FaChartLine size={40} aria-hidden="true" />, value: '95%', label: 'Satisfacción', color: 'var(--secondary-color)' },
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
    <main className="bg-light min-vh-100">
      <Helmet>
        <title>Feedback Talent - Tu Plataforma de Feedback Profesional</title>
        <meta name="description" content="Feedback Talent es una plataforma para dar y recibir feedback anónimo y constructivo, impulsando el crecimiento profesional y la mejora continua en las empresas." />
        <meta name="keywords" content="feedback, retroalimentación, profesional, empresas, crecimiento, anónimo, talento" />
      </Helmet>
      {/* Hero Section */}
      <section
        className="text-center text-white py-5"
        style={{
          background: `linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%)`,
        }}
        aria-labelledby="hero-heading"
      >
        <Container>
          <h1 id="hero-heading" className="fw-bold display-5 mb-3">Bienvenido a Feedback Talent</h1>
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

      <Container className="py-5">
        {/* Estadísticas */}
        <section aria-labelledby="stats-heading">
          <h2 id="stats-heading" className="visually-hidden">Estadísticas de la Plataforma</h2>
          <Row className="g-4 mb-5">
            {stats.map((stat, i) => (
              <Col md={4} key={i}>
                <Card className="text-center border-0 shadow-sm h-100">
                  <Card.Body>
                    <div style={{ color: stat.color }} className="mb-3">
                      {stat.icon}
                    </div>
                    <h3 className="fw-bold h2" style={{ color: stat.color }}>
                      {stat.value}
                    </h3>
                    <p className="text-muted">{stat.label}</p>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </section>

        {/* Barra de búsqueda de empresas */}
        <section className="mb-5" aria-labelledby="search-heading">
          <h2 id="search-heading" className="visually-hidden">Búsqueda de Empresas</h2>
          <PublicCompanySearchBar />
        </section>

        <section aria-labelledby="filter-heading">
          <h2 id="filter-heading" className="visually-hidden">Filtro de Empresas</h2>
          <div className="flex justify-center my-8">
            <div className="bg-white shadow-md rounded-xl px-6 py-3 flex items-center gap-4 border border-gray-100 hover:shadow-lg transition">
              <span className="text-primary text-xl" role="img" aria-label="target emoji">🎯</span>
              <label
                htmlFor="categoria"
                className="font-semibold text-gray-700 tracking-wide"
                style={{ fontFamily: 'inherit' }}
              >
                Filtrar por categoría:
              </label>
              <select
                id="categoria"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="ml-2 border border-gray-200 rounded-lg px-3 py-1.5 text-gray-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
              >
                <option value="general">General</option>
                <option value="Cultura empresarial percibida">Cultura empresarial percibida</option>
                <option value="Cultura empresarial y ambiente laboral">Cultura empresarial y ambiente laboral</option>
                <option value="Desarrollo y prospectiva profesional">Desarrollo y prospectiva profesional</option>
                <option value="Motivación y compromiso">Motivación y compromiso</option>
                <option value="Procesos internos y gestión">Procesos internos y gestión</option>
                <option value="Salarios y beneficios">Salarios y beneficios</option>
                {/*<option value="Pregunta abierta">Pregunta abierta</option>*/}
              </select>
            </div>
          </div>
        </section>

        {/* Empresas mejor calificadas */}
        <section className="bg-white p-4 rounded shadow-sm mb-5" aria-labelledby="top-companies-heading">
          <h3
            id="top-companies-heading"
            className="fw-bold mb-3 text-center"
            style={{
              background: `linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            <span role="img" aria-label="star emoji">🌟</span> Empresas mejor calificadas
          </h3>

          {topCompanies.length > 0 ? (
            <Row className="g-4 justify-content-center">
              {topCompanies.map((company) => (
                <Col md={4} key={company._id}>
                  <Card
                    className="border-0 h-100 text-center transition"
                    onClick={() => navigate(`/company/${company._id}`)}
                    title={`Ver perfil de ${company.companyName}`}
                    style={{
                      cursor: "pointer",
                      borderRadius: "15px",
                      boxShadow: "0 4px 10px rgba(0, 0, 0, 0.05)",
                      transition: "all 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background =
                        "linear-gradient(135deg, rgba(21,53,110,0.08) 0%, rgba(59,158,140,0.08) 100%)";
                      e.currentTarget.style.transform = "translateY(-5px)";
                      e.currentTarget.style.boxShadow = "0 6px 14px rgba(0,0,0,0.1)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "white";
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "0 4px 10px rgba(0, 0, 0, 0.05)";
                    }}
                  >
                    <Card.Body>
                      <h4 className="fw-bold mb-2 text-dark h5">
                        {company.companyName || `Empresa #${company._id}`}
                      </h4>
                      <p className="text-muted mb-1">
                        <span role="img" aria-label="star emoji">⭐</span> Promedio:{" "}
                        <span className="fw-semibold text-primary">
                          {company.avgRating ? company.avgRating.toFixed(2) : "N/A"}
                        </span>
                      </p>
                      <p className="text-muted mb-0">
                        <span role="img" aria-label="memo emoji">📝</span> Feedbacks: {company.totalFeedbacks}
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
        </section>


        {/* Noticias */}
        <section className="bg-white p-4 rounded shadow-sm mb-5" aria-labelledby="news-heading">
          <h3
            id="news-heading"
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
                    <h4 className="mb-0 h6">{item.title}</h4>
                    <small className="text-muted">{item.date}</small>
                  </div>
                </Accordion.Header>
                <Accordion.Body>
                  <p className="text-muted mb-0">{item.content}</p>
                </Accordion.Body>
              </Accordion.Item>
            ))}
          </Accordion>
        </section>

        {/* Características */}
        <section aria-labelledby="features-heading">
          <h3
            id="features-heading"
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
                    <h4 className="fw-bold h5">{feature.title}</h4>
                    <p className="opacity-75">{feature.description}</p>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </section>
      </Container>
    </main>
  );
};

export default Home;

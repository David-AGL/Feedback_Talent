import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Badge,
  Modal,
  Form,
  Alert,
  Spinner,
  Accordion,
} from 'react-bootstrap';
import { FaEdit, FaTrash, FaBuilding, FaCalendar, FaFilter } from 'react-icons/fa';

interface Question {
  _id: string;
  contenido: string;
  tipo: 'rating' | 'text' | 'slider';
  categoria: string;
}

interface Company {
  _id: string;
  name: string;
  email: string;
}

interface FeedbackResponse {
  _id: string;
  userId: string;
  companyUserId: string;
  questionId: string;
  answer: string | number;
  role: 'employee' | 'candidate';
  categoria: string;
  createdAt: string;
  updatedAt: string;
  company: Company;
  question: Question;
}

const FeedbackHistory: React.FC = () => {
  const { token, role } = useAuth();
  const navigate = useNavigate();

  const [feedbacks, setFeedbacks] = useState<FeedbackResponse[]>([]);
  const [filteredFeedbacks, setFilteredFeedbacks] = useState<FeedbackResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Estados para el modal de edición
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingFeedback, setEditingFeedback] = useState<FeedbackResponse | null>(null);
  const [editAnswer, setEditAnswer] = useState<string | number>('');

  // Estados para filtros
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCompany, setSelectedCompany] = useState<string>('all');

  // Redirigir si no es employee o candidate
  useEffect(() => {
    if (role !== 'employee' && role !== 'candidate') {
      navigate('/');
    }
  }, [role, navigate]);

  // Obtener feedbacks al cargar
  useEffect(() => {
    fetchFeedbacks();
  }, [token]);

  // Aplicar filtros
  useEffect(() => {
    applyFilters();
  }, [feedbacks, selectedCategory, selectedCompany]);

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('http://localhost:4000/api/feedback-history/my-feedbacks', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Error al obtener feedbacks');
      }

      const data = await response.json();
      setFeedbacks(data.data);
      setFilteredFeedbacks(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...feedbacks];

    if (selectedCategory !== 'all') {
      filtered = filtered.filter((f) => f.categoria === selectedCategory);
    }

    if (selectedCompany !== 'all') {
      filtered = filtered.filter((f) => f.companyUserId === selectedCompany);
    }

    setFilteredFeedbacks(filtered);
  };

  const handleEditClick = (feedback: FeedbackResponse) => {
    setEditingFeedback(feedback);
    setEditAnswer(feedback.answer);
    setShowEditModal(true);
  };

  const handleEditSubmit = async () => {
    if (!editingFeedback) return;

    try {
      const response = await fetch(
        `http://localhost:4000/api/feedback-history/${editingFeedback._id}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ answer: editAnswer }),
        }
      );

      if (!response.ok) {
        throw new Error('Error al actualizar feedback');
      }

      setSuccess('Feedback actualizado exitosamente');
      setShowEditModal(false);
      fetchFeedbacks(); // Recargar feedbacks

      // Limpiar mensaje de éxito después de 3 segundos
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    }
  };

  const handleDelete = async (feedbackId: string) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este feedback individual?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:4000/api/feedback-history/${feedbackId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error al eliminar feedback');
      }

      setSuccess('Feedback eliminado exitosamente');
      fetchFeedbacks(); // Recargar feedbacks

      // Limpiar mensaje de éxito después de 3 segundos
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    }
  };

  const handleDeleteByCompany = async (companyId: string, companyName: string) => {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar TODOS los feedbacks para ${companyName}?`)) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:4000/api/feedback-history/company/${companyId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error al eliminar feedbacks por empresa');
      }

      setSuccess('Feedbacks eliminados exitosamente');
      fetchFeedbacks();

      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    }
  };

  // Obtener categorías únicas
  const uniqueCategories = Array.from(new Set(feedbacks.map((f) => f.categoria)));
  const uniqueCompanies = Array.from(
    new Map(feedbacks.map((f) => [f.companyUserId, f.company])).values()
  );

  // Agrupar feedbacks por empresa
  const groupedByCompany = filteredFeedbacks.reduce((acc, feedback) => {
    const companyId = feedback.companyUserId;
    if (!acc[companyId]) {
      acc[companyId] = {
        company: feedback.company,
        feedbacks: [],
      };
    }
    acc[companyId].feedbacks.push(feedback);
    return acc;
  }, {} as Record<string, { company: Company; feedbacks: FeedbackResponse[] }>);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const renderAnswer = (answer: string | number, tipo: string) => {
    if (tipo === 'rating') {
      return (
        <div className="d-flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <span key={star} style={{ color: star <= Number(answer) ? '#ffc107' : '#e0e0e0' }}>
              ★
            </span>
          ))}
        </div>
      );
    }
    if (tipo === 'slider') {
      return <Badge bg="info">{answer}/10</Badge>;
    }
    return <p className="mb-0 text-muted">{answer}</p>;
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Cargando historial de feedbacks...</p>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      {/* Header */}
      <div className="mb-4">
        <h2 className="fw-bold mb-2">Mi Historial de Feedbacks</h2>
        <p className="text-muted">
          Aquí puedes ver, editar y eliminar todos los feedbacks que has enviado.
        </p>
      </div>

      {/* Alertas */}
      {error && (
        <Alert variant="danger" onClose={() => setError(null)} dismissible>
          {error}
        </Alert>
      )}
      {success && (
        <Alert variant="success" onClose={() => setSuccess(null)} dismissible>
          {success}
        </Alert>
      )}

      {/* Filtros */}
      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <div className="d-flex align-items-center mb-3">
            <FaFilter className="me-2" />
            <h5 className="mb-0">Filtros</h5>
          </div>
          <Row>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Categoría</Form.Label>
                <Form.Select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="all">Todas las categorías</option>
                  {uniqueCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Empresa</Form.Label>
                <Form.Select
                  value={selectedCompany}
                  onChange={(e) => setSelectedCompany(e.target.value)}
                >
                  <option value="all">Todas las empresas</option>
                  {uniqueCompanies.map((company) => (
                    <option key={company._id} value={company._id}>
                      {company.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Resumen */}
      <Card className="mb-4 shadow-sm bg-light">
        <Card.Body>
          <Row className="text-center">
            <Col md={4}>
              <h3 className="fw-bold text-primary">{feedbacks.length}</h3>
              <p className="text-muted mb-0">Feedbacks Totales</p>
            </Col>
            <Col md={4}>
              <h3 className="fw-bold text-success">{uniqueCompanies.length}</h3>
              <p className="text-muted mb-0">Empresas Evaluadas</p>
            </Col>
            <Col md={4}>
              <h3 className="fw-bold text-info">{uniqueCategories.length}</h3>
              <p className="text-muted mb-0">Categorías</p>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Lista de Feedbacks */}
      {filteredFeedbacks.length === 0 ? (
        <Card className="shadow-sm">
          <Card.Body className="text-center py-5">
            <p className="text-muted mb-0">No se encontraron feedbacks.</p>
          </Card.Body>
        </Card>
      ) : (
        <Accordion>
          {Object.entries(groupedByCompany).map(([companyId, data], idx) => (
            <Accordion.Item eventKey={idx.toString()} key={companyId} className="mb-3">
              <Accordion.Header>
                <div className="d-flex align-items-center w-100">
                  <FaBuilding className="me-2 text-primary" />
                  <div className="flex-grow-1">
                    <h6 className="mb-0">{data.company.name}</h6>
                    <small className="text-muted">{data.company.email}</small>
                  </div>
                  <div className="d-flex align-items-center ms-auto me-3">
                    <Badge bg="secondary" className="me-3">
                      {data.feedbacks.length} feedback(s)
                    </Badge>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteByCompany(companyId, data.company.name);
                      }}
                    >
                      <FaTrash /> Eliminar Todos
                    </Button>
                  </div>
                </div>
              </Accordion.Header>
              <Accordion.Body>
                <Row>
                  {data.feedbacks.map((feedback) => (
                    <Col md={12} key={feedback._id} className="mb-3">
                      <Card className="border">
                        <Card.Body>
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <div className="flex-grow-1">
                              <Badge bg="primary" className="mb-2">
                                {feedback.categoria}
                              </Badge>
                              <h6 className="fw-bold">{feedback.question.contenido}</h6>
                            </div>
                            <div className="d-flex gap-2">
                              <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() => handleEditClick(feedback)}
                              >
                                <FaEdit />
                              </Button>
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => handleDelete(feedback._id)}
                              >
                                <FaTrash />
                              </Button>
                            </div>
                          </div>

                          <div className="mb-2">
                            <strong>Tu respuesta: </strong>
                            {renderAnswer(feedback.answer, feedback.question.tipo)}
                          </div>

                          <div className="d-flex align-items-center text-muted">
                            <FaCalendar className="me-2" />
                            <small>
                              Enviado el {formatDate(feedback.createdAt)}
                              {feedback.createdAt !== feedback.updatedAt && (
                                <> (Editado el {formatDate(feedback.updatedAt)})</>
                              )}
                            </small>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </Accordion.Body>
            </Accordion.Item>
          ))}
        </Accordion>
      )}

      {/* Modal de Edición */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Editar Feedback</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {editingFeedback && (
            <>
              <p className="text-muted mb-3">{editingFeedback.question.contenido}</p>

              {editingFeedback.question.tipo === 'text' && (
                <Form.Group>
                  <Form.Label>Tu respuesta</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    value={editAnswer}
                    onChange={(e) => setEditAnswer(e.target.value)}
                  />
                </Form.Group>
              )}

              {editingFeedback.question.tipo === 'rating' && (
                <Form.Group>
                  <Form.Label>Calificación (1-5)</Form.Label>
                  <div className="d-flex gap-2 fs-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        style={{
                          cursor: 'pointer',
                          color: star <= Number(editAnswer) ? '#ffc107' : '#e0e0e0',
                        }}
                        onClick={() => setEditAnswer(star)}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </Form.Group>
              )}

              {editingFeedback.question.tipo === 'slider' && (
                <Form.Group>
                  <Form.Label>Valor: {editAnswer}/10</Form.Label>
                  <Form.Range
                    min={0}
                    max={10}
                    value={Number(editAnswer)}
                    onChange={(e) => setEditAnswer(Number(e.target.value))}
                  />
                </Form.Group>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleEditSubmit}>
            Guardar Cambios
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default FeedbackHistory;

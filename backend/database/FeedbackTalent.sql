-- Created by Vertabelo (http://vertabelo.com)
-- Last modification date: 2025-09-24 21:13:58.196

-- tables
-- Table: Categoria
CREATE TABLE Categoria (
    idCategoria int  NOT NULL,
    tipo varchar(25)  NOT NULL,
    CONSTRAINT Categoria_pk PRIMARY KEY (idCategoria)
);

-- Table: Feedback
CREATE TABLE Feedback (
    idFeedback int  NOT NULL,
    fecha date  NOT NULL,
    esAnonimo boolean  NOT NULL,
    CONSTRAINT Feedback_pk PRIMARY KEY (idFeedback)
);

-- Table: FeedbackPregunta
CREATE TABLE FeedbackPregunta (
    idPregunta int  NOT NULL,
    idFeedback int  NOT NULL,
    CONSTRAINT FeedbackPregunta_pk PRIMARY KEY (idPregunta,idFeedback)
);

-- Table: FeedbackXMarca
CREATE TABLE FeedbackXMarca (
    idMarca int  NOT NULL,
    idFeedback int  NOT NULL,
    CONSTRAINT FeedbackXMarca_pk PRIMARY KEY (idFeedback,idMarca)
);

-- Table: MarcaEmpleadora
CREATE TABLE MarcaEmpleadora (
    idMarca int  NOT NULL,
    nombre varchar(50)  NOT NULL,
    email varchar(50)  NOT NULL,
    contrasena varchar(50)  NOT NULL,
    descripcion varchar(150)  NOT NULL,
    CONSTRAINT MarcaEmpleadora_pk PRIMARY KEY (idMarca)
);

-- Table: Pregunta
CREATE TABLE Pregunta (
    idPregunta int  NOT NULL,
    idCategoria int  NOT NULL,
    contenido varchar(250)  NOT NULL,
    CONSTRAINT Pregunta_pk PRIMARY KEY (idPregunta)
);

-- Table: Respuesta
CREATE TABLE Respuesta (
    idRespuesta int  NOT NULL,
    contenido varchar(250)  NOT NULL,
    idPregunta int  NOT NULL,
    CONSTRAINT Respuesta_pk PRIMARY KEY (idRespuesta)
);

-- Table: Usuario
CREATE TABLE Usuario (
    idUsuario int  NOT NULL,
    nombre varchar(50)  NOT NULL,
    email varchar(50)  NOT NULL,
    contrasena varchar(50)  NOT NULL,
    fechaNacimiento date  NOT NULL,
    rol varchar(25)  NOT NULL,
    descripcion varchar(250)  NOT NULL,
    CONSTRAINT Usuario_pk PRIMARY KEY (idUsuario)
);

-- Table: UsuarioFeedback
CREATE TABLE UsuarioFeedback (
    idFeedback int  NOT NULL,
    idUsuario int  NOT NULL,
    CONSTRAINT UsuarioFeedback_pk PRIMARY KEY (idUsuario,idFeedback)
);

-- foreign keys
-- Reference: FormularioFeedback_Feedback (table: FeedbackPregunta)
ALTER TABLE FeedbackPregunta ADD CONSTRAINT FormularioFeedback_Feedback
    FOREIGN KEY (idFeedback)
    REFERENCES Feedback (idFeedback)  
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Reference: FormularioFeedback_Pregunta (table: FeedbackPregunta)
ALTER TABLE FeedbackPregunta ADD CONSTRAINT FormularioFeedback_Pregunta
    FOREIGN KEY (idPregunta)
    REFERENCES Pregunta (idPregunta)  
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Reference: Pregunta_Categoria (table: Pregunta)
ALTER TABLE Pregunta ADD CONSTRAINT Pregunta_Categoria
    FOREIGN KEY (idCategoria)
    REFERENCES Categoria (idCategoria)  
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Reference: Respuesta_Pregunta (table: Respuesta)
ALTER TABLE Respuesta ADD CONSTRAINT Respuesta_Pregunta
    FOREIGN KEY (idPregunta)
    REFERENCES Pregunta (idPregunta)  
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Reference: Table_17_Feedback (table: FeedbackXMarca)
ALTER TABLE FeedbackXMarca ADD CONSTRAINT Table_17_Feedback
    FOREIGN KEY (idFeedback)
    REFERENCES Feedback (idFeedback)  
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Reference: Table_17_MarcaEmpleadora (table: FeedbackXMarca)
ALTER TABLE FeedbackXMarca ADD CONSTRAINT Table_17_MarcaEmpleadora
    FOREIGN KEY (idMarca)
    REFERENCES MarcaEmpleadora (idMarca)  
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Reference: UsuarioFeedback_Feedback (table: UsuarioFeedback)
ALTER TABLE UsuarioFeedback ADD CONSTRAINT UsuarioFeedback_Feedback
    FOREIGN KEY (idFeedback)
    REFERENCES Feedback (idFeedback)  
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Reference: UsuarioFeedback_Usuario (table: UsuarioFeedback)
ALTER TABLE UsuarioFeedback ADD CONSTRAINT UsuarioFeedback_Usuario
    FOREIGN KEY (idUsuario)
    REFERENCES Usuario (idUsuario)  
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- End of file.


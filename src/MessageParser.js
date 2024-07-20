// MessageParser.js
class MessageParser {
  constructor(actionProvider) {
    this.actionProvider = actionProvider;
  }

  parse(message) {
    const lowerCaseMessage = message.toLowerCase();

    if (lowerCaseMessage.includes("hola") || lowerCaseMessage.includes("hi") || lowerCaseMessage.includes("hello")) {
      this.actionProvider.greet();
    } else if (lowerCaseMessage.includes("servicios")) {
      this.actionProvider.handleServices();
    } else if (lowerCaseMessage.includes("empleos") || lowerCaseMessage.includes("trabajos")) {
      this.actionProvider.handleJobPostings();
    } else if (lowerCaseMessage.includes("registrar") || lowerCaseMessage.includes("registro")) {
      this.actionProvider.handleRegistration();
    } else if (lowerCaseMessage.includes("notificaciones")) {
      this.actionProvider.handleJobNotifications();
    } else if (lowerCaseMessage.includes("publicar empleo")) {
      this.actionProvider.handlePostJob();
    } else if (lowerCaseMessage.includes("ofrecer servicio")) {
      this.actionProvider.handlePostService();
    } else if (lowerCaseMessage.includes("editar empleo")) {
      this.actionProvider.handleEditJob();
    } else if (lowerCaseMessage.includes("editar servicio")) {
      this.actionProvider.handleEditService();
    } else if (lowerCaseMessage.includes("detalles del empleo")) {
      this.actionProvider.handleViewJobDetails();
    } else if (lowerCaseMessage.includes("detalles del servicio")) {
      this.actionProvider.handleViewServiceDetails();
    } else if (lowerCaseMessage.includes("filtros de búsqueda de empleos")) {
      this.actionProvider.handleJobSearchFilters();
    } else if (lowerCaseMessage.includes("filtros de búsqueda de servicios")) {
      this.actionProvider.handleServiceSearchFilters();
    } else if (lowerCaseMessage.includes("preguntas frecuentes")) {
      this.actionProvider.handleCommonQuestions();
    } else if (lowerCaseMessage.includes("testimonios")) {
      this.actionProvider.handleTestimonials();
    } else if (lowerCaseMessage.includes("calificar") || lowerCaseMessage.includes("rating")) {
      this.actionProvider.handleSubmitRating();
    } else if (lowerCaseMessage.includes("comentar") || lowerCaseMessage.includes("comentarios")) {
      this.actionProvider.handleCommenting();
    } else if (lowerCaseMessage.includes("responder")) {
      this.actionProvider.handleReplying();
    } else {
      this.actionProvider.defaultResponse();
    }
  }
}

export default MessageParser;

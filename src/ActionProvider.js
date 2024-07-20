// ActionProvider.js
class ActionProvider {
    constructor(createChatBotMessage, setStateFunc) {
      this.createChatBotMessage = createChatBotMessage;
      this.setState = setStateFunc;
    }
  
    greet() {
      const greetingMessage = this.createChatBotMessage("¡Hola! ¿Cómo puedo asistirte hoy?");
      this.updateChatbotState(greetingMessage);
    }
  
    handleServices() {
      const servicesMessage = this.createChatBotMessage(
        "Ofrecemos una variedad de servicios: carpintería, plomería, electricidad, programación, y más. ¿En cuál estás interesado?"
      );
      this.updateChatbotState(servicesMessage);
    }
  
    handleJobPostings() {
      const jobPostingsMessage = this.createChatBotMessage(
        "Puedes buscar empleos en nuestra plataforma navegando a la sección de búsqueda de empleos. ¿Te gustaría recibir notificaciones de nuevos empleos?"
      );
      this.updateChatbotState(jobPostingsMessage);
    }
  
    handleRegistration() {
      const registrationMessage = this.createChatBotMessage(
        "Para registrarte, por favor visita nuestra página de registro y completa el formulario."
      );
      this.updateChatbotState(registrationMessage);
    }
  
    handleJobNotifications() {
      const notificationsMessage = this.createChatBotMessage(
        "Para suscribirte a las notificaciones de nuevos empleos, ve a la página del empleo de tu interés y haz clic en 'Suscribirse a notificaciones'."
      );
      this.updateChatbotState(notificationsMessage);
    }
  
    handlePostJob() {
      const postJobMessage = this.createChatBotMessage(
        "Para publicar un empleo, navega a la página 'Ofrecer Empleo' y completa el formulario con la información del empleo."
      );
      this.updateChatbotState(postJobMessage);
    }
  
    handlePostService() {
      const postServiceMessage = this.createChatBotMessage(
        "Para ofrecer un servicio, navega a la página 'Ofrecer Servicio' y completa el formulario con la información del servicio."
      );
      this.updateChatbotState(postServiceMessage);
    }
  
    handleEditJob() {
      const editJobMessage = this.createChatBotMessage(
        "Para editar un empleo, ve a la sección 'Tus Empleos', selecciona el empleo que deseas editar y realiza los cambios necesarios."
      );
      this.updateChatbotState(editJobMessage);
    }
  
    handleEditService() {
      const editServiceMessage = this.createChatBotMessage(
        "Para editar un servicio, ve a la sección 'Tus Servicios', selecciona el servicio que deseas editar y realiza los cambios necesarios."
      );
      this.updateChatbotState(editServiceMessage);
    }
  
    handleViewJobDetails() {
      const viewJobDetailsMessage = this.createChatBotMessage(
        "Para ver los detalles de un empleo, haz clic en el título del empleo en la lista de empleos disponibles."
      );
      this.updateChatbotState(viewJobDetailsMessage);
    }
  
    handleViewServiceDetails() {
      const viewServiceDetailsMessage = this.createChatBotMessage(
        "Para ver los detalles de un servicio, haz clic en el título del servicio en la lista de servicios disponibles."
      );
      this.updateChatbotState(viewServiceDetailsMessage);
    }
  
    handleJobSearchFilters() {
      const jobSearchFiltersMessage = this.createChatBotMessage(
        "Para filtrar la búsqueda de empleos, usa los filtros disponibles como empresa, rango de salarios, disponibilidad y ubicación."
      );
      this.updateChatbotState(jobSearchFiltersMessage);
    }
  
    handleServiceSearchFilters() {
      const serviceSearchFiltersMessage = this.createChatBotMessage(
        "Para filtrar la búsqueda de servicios, usa los filtros disponibles como tipo de servicio, costo, disponibilidad y ubicación."
      );
      this.updateChatbotState(serviceSearchFiltersMessage);
    }
  
    handleCommonQuestions() {
      const commonQuestionsMessage = this.createChatBotMessage(
        "En la sección de Preguntas Frecuentes puedes encontrar respuestas a las preguntas más comunes."
      );
      this.updateChatbotState(commonQuestionsMessage);
    }
  
    handleTestimonials() {
      const testimonialsMessage = this.createChatBotMessage(
        "Puedes leer testimonios de otros usuarios en la sección de Testimonios."
      );
      this.updateChatbotState(testimonialsMessage);
    }
  
    handleSubmitRating() {
      const submitRatingMessage = this.createChatBotMessage(
        "Para calificar un servicio o empleo, navega a la página de detalles y selecciona la calificación que deseas dar."
      );
      this.updateChatbotState(submitRatingMessage);
    }
  
    handleCommenting() {
      const commentingMessage = this.createChatBotMessage(
        "Para comentar en un servicio, navega a la página de detalles del servicio y escribe tu comentario en la sección de comentarios."
      );
      this.updateChatbotState(commentingMessage);
    }
  
    handleReplying() {
      const replyingMessage = this.createChatBotMessage(
        "Para responder a un comentario, haz clic en el botón de responder debajo del comentario y escribe tu respuesta."
      );
      this.updateChatbotState(replyingMessage);
    }
  
    defaultResponse() {
      const defaultMessage = this.createChatBotMessage("Lo siento, no entiendo tu pregunta. ¿Podrías reformularla?");
      this.updateChatbotState(defaultMessage);
    }
  
    updateChatbotState(message) {
      this.setState(prevState => ({
        ...prevState,
        messages: [...prevState.messages, message]
      }));
    }
  }
  
  export default ActionProvider;
  
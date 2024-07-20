import React, { useState } from 'react';
import Chatbot from 'react-chatbot-kit';
import 'react-chatbot-kit/build/main.css';
import config from './config';
import MessageParser from './MessageParser';
import ActionProvider from './ActionProvider';
import botIcon from './assets/características.png'; // Asegúrate de tener esta imagen en tu carpeta de assets
import './ChatbotComponent.css';
import { FaTimes } from 'react-icons/fa';

const ChatbotComponent = () => {
  const [isOpen, setIsOpen] = useState(false); // Inicializa como false para que esté oculto al cargar la página
  const [resetCount, setResetCount] = useState(0);

  const handleClose = () => {
    setIsOpen(false);
    setResetCount(prev => prev + 1); // Incrementar el contador para reiniciar el chatbot
  };

  const handleOpen = () => {
    setIsOpen(true);
  };

  return (
    <div className="chatbot-container">
      {isOpen ? (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <span>Support</span>
            <div className="chatbot-header-buttons">
              <button onClick={handleClose}>
                <FaTimes />
              </button>
            </div>
          </div>
          <Chatbot
            key={resetCount} // Esto reiniciará el chatbot al cambiar el contador
            config={config}
            messageParser={MessageParser}
            actionProvider={ActionProvider}
          />
        </div>
      ) : (
        <div className="chatbot-icon" onClick={handleOpen}>
          <img src={botIcon} alt="Chatbot Icon" />
        </div>
      )}
    </div>
  );
};

export default ChatbotComponent;

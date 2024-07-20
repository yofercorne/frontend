import { createChatBotMessage } from 'react-chatbot-kit';
import botIcon from './assets/logo2.png'; // Asegúrate de tener esta imagen en tu carpeta de assets

const config = {
  botName: "ChambaBot",
  initialMessages: [createChatBotMessage(`¡Hola! Soy ChambaBot, ¿cómo puedo ayudarte hoy?`)],
  customComponents: {
    header: () => <div className="custom-header"></div>,
    botAvatar: () => (
      <img
        src={botIcon}
        alt="Bot Avatar"
        style={{
          borderRadius: '50%',
          width: '30px',
          height: '30px',
        }}
      />
    ),
  },
  customStyles: {
    botMessageBox: {
      backgroundColor: '#b28238',
    },
    chatButton: {
      backgroundColor: '#b28238',
    },
  },
};

export default config;

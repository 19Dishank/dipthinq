import ChatUI from './components/ChatUI';
import { ThemeProvider } from './contexts/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <ChatUI />
    </ThemeProvider>
  );
}

export default App;

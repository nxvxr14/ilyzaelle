import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/context/AuthContext';
import { router } from '@/router';

const App = () => {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1a1a2e',
            color: '#e0e0e0',
            border: '2px solid #6c5ce7',
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '10px',
          },
        }}
      />
    </AuthProvider>
  );
};

export default App;

// apps/web/src/app/layout.tsx
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from 'react-hot-toast';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster 
          position="top-right" 
          toastOptions={{ 
            style: { 
              background: '#18181b', 
              color: '#fff', 
              border: '1px solid #27272a',
              borderRadius: '12px',
              fontSize: '14px'
            } 
          }} 
        />
      </body>
    </html>
  );
}
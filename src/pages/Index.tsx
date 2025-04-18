
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const Index = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    const hasUserName = !!localStorage.getItem('userName');

    if (!isAuthenticated) {
      navigate('/onboarding');
    } else if (!hasUserName) {
      navigate('/onboarding');
    } else {
      navigate('/home');
    }
  }, [navigate]);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <p className="text-xl text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
};

export default Index;

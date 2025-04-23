
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface MemoErrorProps {
  message?: string;
  onBack?: () => void;
}

const MemoError = ({ message = "Memo not found", onBack }: MemoErrorProps) => {
  const navigate = useNavigate();
  
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate('/home');
    }
  };
  
  return (
    <div className="container max-w-md mx-auto py-8 px-4">
      <p>{message}</p>
      <Button variant="link" onClick={handleBack}>Go back</Button>
    </div>
  );
};

export default MemoError;


import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const MemoError = () => {
  const navigate = useNavigate();
  
  return (
    <div className="container max-w-md mx-auto py-8 px-4">
      <p>Memo not found</p>
      <Button variant="link" onClick={() => navigate('/home')}>Go back to home</Button>
    </div>
  );
};

export default MemoError;

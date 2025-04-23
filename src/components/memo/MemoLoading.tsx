
import { Loader2 } from "lucide-react";

const MemoLoading = () => {
  return (
    <div className="container max-w-md mx-auto py-8 px-4 flex justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
    </div>
  );
};

export default MemoLoading;

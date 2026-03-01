import { Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useShareUrl } from "@/hooks/useMiniKit";

interface ShareButtonProps {
  url?: string;
  text?: string;
  label?: string;
  className?: string;
}

const ShareButton = ({
  url = window.location.href,
  text = "Check out The POP Up — Physical Art. Onchain Ownership.",
  label = "Share",
  className,
}: ShareButtonProps) => {
  const { shareUrl, isInMiniApp } = useShareUrl();

  if (!isInMiniApp && !navigator.share) return null;

  return (
    <Button
      variant="ghost"
      size="sm"
      className={className}
      onClick={() => shareUrl(url, text)}
    >
      <Share2 className="w-4 h-4" />
      {label}
    </Button>
  );
};

export default ShareButton;

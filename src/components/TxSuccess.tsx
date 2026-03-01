/**
 * TxSuccess — reusable success state shown after a transaction confirms.
 */
import { Award, ExternalLink, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface TxSuccessProps {
  title: string;
  description: string;
  txHash: string | null;
  onDone: () => void;
  doneLabel?: string;
}

const TxSuccess = ({ title, description, txHash, onDone, doneLabel = "Done" }: TxSuccessProps) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="text-center py-4"
  >
    {/* Animated checkmark ring */}
    <div className="relative w-20 h-20 mx-auto mb-5">
      <div className="absolute inset-0 rounded-full bg-primary/10 animate-ping opacity-30" />
      <div className="relative w-20 h-20 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center">
        <Award className="w-9 h-9 text-primary" />
      </div>
    </div>

    <h3 className="font-display text-xl font-extrabold mb-1">{title}</h3>
    <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{description}</p>

    {txHash && (
      <a
        href={`https://basescan.org/tx/${txHash}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-[11px] text-primary hover:underline mb-5"
      >
        <CheckCircle2 className="w-3.5 h-3.5" />
        {txHash.slice(0, 10)}…{txHash.slice(-8)}
        <ExternalLink className="w-3 h-3" />
      </a>
    )}

    <Button variant="hero" className="w-full mt-2" onClick={onDone}>
      {doneLabel}
    </Button>
  </motion.div>
);

export default TxSuccess;

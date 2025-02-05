import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { Tooltip } from "@/primitive/components";

const CopyButton = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
    });
  };

  return (
    <Tooltip content={<p>Copy</p>}>
      <button
        onClick={handleCopy}
        className='flex items-center space-x-2 text-muted-foreground'
      >
        {copied ? <Check className='size-16' /> : <Copy className='size-16' />}
      </button>
    </Tooltip>
  );
};

export default CopyButton;

import { Button } from "@/primitive/components";

export function CancelButton({ onClick }: { onClick: () => void }) {
  return (
    <Button size='s' variant='secondary' onClick={onClick}>
      Cancel
    </Button>
  );
}

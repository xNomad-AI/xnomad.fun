import { Container } from "@/app/layout/contianer";
import { InfoSection } from "./info";

export default function Page({
  params,
}: {
  params: {
    address: string;
  };
}) {
  const address = params.address;
  return (
    <Container className='flex gap-48 w-full'>
      <InfoSection address={address} />
    </Container>
  );
}

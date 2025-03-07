const partners = [
  "/partner/xnomad.svg",
  "/partner/eliza.svg",
  "/partner/phala.svg",
];
export function Partners() {
  return (
    <div className='w-full flex flex-col gap-24 items-center'>
      <span className='text-size-16'>Powered by</span>
      <div className='flex items-center gap-64'>
        {partners.map((partner) => (
          <img
            key={partner}
            src={partner}
            alt='partner'
            className='w-[130px] h-[36px] object-contain'
          />
        ))}
      </div>
    </div>
  );
}

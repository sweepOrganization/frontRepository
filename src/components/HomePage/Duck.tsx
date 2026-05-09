type DuckProps = {
  image: string;
};

export default function Duck({ image }: DuckProps) {
  return (
    <div
      className="h-[39px] w-[39px] bg-contain bg-center bg-no-repeat transition-all duration-500 ease-out"
      style={{
        backgroundImage: `url(${image})`,
        opacity: 1,
      }}
    />
  );
}

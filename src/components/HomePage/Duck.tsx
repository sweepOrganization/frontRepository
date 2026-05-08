type DuckProps = {
  image?: string;
};

export default function Duck({ image = "/duck-01.svg" }: DuckProps) {
  return <img src={image} alt="오리" className="h-[39px] w-[28px]" />;
}

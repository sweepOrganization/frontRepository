import { useNavigate } from "react-router-dom";

type BackHeaderProps = {
  title?: string;
};

export default function BackHeader({ title }: BackHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="flex h-[56px] w-full items-center px-4 py-[16px]">
      <button
        type="button"
        aria-label="뒤로가기"
        className="flex h-[24px] w-[24px] items-center justify-center"
        onClick={() => navigate(-1)}
      >
        <img src="/Vector.png" alt="뒤로가기" className="h-4 w-[9px]" />
      </button>
      {title ? (
        <h1 className="mx-auto pr-[24px] text-[16px] font-semibold text-(--Dark)">
          {title}
        </h1>
      ) : null}
    </div>
  );
}

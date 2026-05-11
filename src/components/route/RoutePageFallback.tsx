export default function RoutePageFallback() {
  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <div className="h-[285px] w-full animate-pulse bg-[#e9ecef]" />
      <div className="mt-5 flex flex-1 flex-col px-4">
        <div className="h-12 animate-pulse rounded-[9px] bg-[#eef1f4]" />
        <div className="mt-[14px] h-12 animate-pulse rounded-[9px] bg-[#eef1f4]" />
        <div className="mt-6 h-[80px] animate-pulse rounded-[10px] bg-[#eef1f4]" />
        <div className="mt-6 flex-1 animate-pulse rounded-[10px] bg-[#f3f5f7]" />
      </div>
    </div>
  );
}

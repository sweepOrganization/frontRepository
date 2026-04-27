import { useState } from "react";

export default function NotificationStep2Page() {
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [places, setPlaces] = useState<any[]>([]);
  const [activeInput, setActiveInput] = useState<"start" | "end" | null>(null);

  const searchPlaces = async (keyword: string) => {
    if (keyword.length < 2) {
      setPlaces([]);
      return;
    }

    try {
      const res = await fetch(
        `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(
          keyword,
        )}`,
        {
          headers: {
            Authorization: `KakaoAK ${import.meta.env.VITE_KAKAO_API_KEY}`,
          },
        },
      );

      const data = await res.json();
      if (!res.ok) return setPlaces([]);
      setPlaces(data.documents ?? []);
    } catch {
      setPlaces([]);
    }
  };

  const handleSearch = (value: string, type: "start" | "end") => {
    setActiveInput(type);
    type === "start" ? setStart(value) : setEnd(value);
    searchPlaces(value);
  };

  const handleSelectPlace = (place: any) => {
    if (activeInput === "start") setStart(place.place_name);
    if (activeInput === "end") setEnd(place.place_name);
    setPlaces([]);
  };

  const highlightText = (text: string, keyword: string) => {
    if (!keyword.trim()) return text;
    const regex = new RegExp(`(${keyword})`, "gi");
    return text.split(regex).map((part, i) =>
      part.toLowerCase() === keyword.toLowerCase() ? (
        <span key={i} className="text-[var(--GreenNormal)]">
          {part}
        </span>
      ) : (
        part
      ),
    );
  };

  const keyword = activeInput === "start" ? start : end;
  const isActive = start && end;

  return (
    <div className="flex h-screen flex-col bg-white">
      {/* 상단 고정 */}
      <div className="border-b-3 border-[#E4E4E4] bg-[#FBFBFB] pt-[24px] pr-[20px] pb-[30px] pl-[30px]">
        <h1 className="text-[23px] font-normal">
          출발지와 일정 장소는 어디인가요?
        </h1>

        <p className="mt-1 text-[15px] font-normal text-[var(--Lightgray)]">
          최적의 경로를 찾아드릴게요
        </p>

        <div className="mt-6 flex items-start gap-3">
          {/* 왼쪽 점 + 선 */}
          <div className="flex flex-col">
            <div className="flex h-[104px] flex-col items-center justify-center">
              <div
                className={`h-2 w-2 rounded-full border transition-colors duration-200 ${
                  activeInput === "start"
                    ? "border-[var(--GreenNormal)] bg-[var(--GreenNormal)]"
                    : "border-[var(--GreenNormal)] bg-transparent"
                }`}
              />

              <div className="h-[50px] w-[1px] bg-[#E4E4E4]" />

              <div
                className={`h-2 w-2 rounded-full border transition-colors duration-200 ${
                  activeInput === "end"
                    ? "border-[var(--GreenNormal)] bg-[var(--GreenNormal)]"
                    : "border-[var(--GreenNormal)] bg-transparent"
                }`}
              />
            </div>
          </div>

          {/* 인풋 */}
          <div className="flex flex-1 flex-col gap-[8px]">
            <input
              value={start}
              onFocus={() => setActiveInput("start")}
              onChange={(e) => handleSearch(e.target.value, "start")}
              placeholder="출발지를 입력해주세요"
              className="h-[48px] rounded-lg border border-[var(--GreenLightActive)] bg-white px-4 text-[17px] font-normal outline-none placeholder:font-normal placeholder:text-[var(--Gray)] focus:border-[var(--GreenNormal)]"
            />

            <input
              value={end}
              onFocus={() => setActiveInput("end")}
              onChange={(e) => handleSearch(e.target.value, "end")}
              placeholder="도착지를 입력해주세요"
              className="h-[48px] rounded-lg border border-[var(--GreenLightActive)] bg-white px-4 text-[17px] font-normal outline-none placeholder:font-normal placeholder:text-[var(--Gray)] focus:border-[var(--GreenNormal)]"
            />
          </div>
        </div>
      </div>

      {/* 스크롤 영역 */}
      <div className="custom-scroll flex-1 overflow-y-auto bg-white">
        {places.length > 0 && (
          <>
            <div className="px-[30px] py-[25px]">
              {places.map((place) => (
                <button
                  key={place.id}
                  onClick={() => handleSelectPlace(place)}
                  className="mb-5 flex w-full gap-3 text-left"
                >
                  <img
                    src="/icon-location.svg"
                    alt=""
                    className="mt-[2px] h-[14px] w-[11px]"
                  />
                  <div>
                    <p className="text-[17px] leading-none font-normal">
                      {highlightText(place.place_name, keyword)}
                    </p>

                    <p className="text-[15px] leading-[220%] font-normal text-gray-400">
                      {place.address_name}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* 하단 고정 버튼 */}
      <div className="border-t border-[#E5E7EB] bg-white">
        <button
          disabled={!isActive}
          className={`h-[60px] w-full text-lg font-semibold ${
            isActive
              ? "bg-[var(--GreenNormal)] text-white"
              : "bg-gray-100 text-gray-300"
          }`}
        >
          경로 보기
        </button>
      </div>
    </div>
  );
}

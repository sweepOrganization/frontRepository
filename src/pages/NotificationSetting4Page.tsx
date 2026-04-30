import { useState } from "react";
import TimeBanner from "../components/Setting4Page/TimeBanner";

export default function NotificationSetting4Page() {
  const reminderOptions = [0, 5, 10, 15, 20];
  const [checklist, setChecklist] = useState("");
  const [selectedReminderMinutes, setSelectedReminderMinutes] = useState<
    number | null
  >(null);
  const [hour, setHour] = useState("");
  const [minute, setMinute] = useState("");
  const [isHourFocused, setIsHourFocused] = useState(false);
  const [isMinuteFocused, setIsMinuteFocused] = useState(false);

  const handleHourChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setHour(event.target.value);
  };

  const handleMinuteChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMinute(event.target.value);
  };

  const handleChecklistChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    const limitedByLength = event.target.value.slice(0, 24);
    const lines = limitedByLength.split("\n");
    setChecklist(lines.slice(0, 2).join("\n"));
  };

  const handleReminderClick = (value: number) => {
    setSelectedReminderMinutes(value);
  };

  return (
    <div className="flex h-screen flex-col">
      <div className="mx-4 mt-[14px] flex flex-1 flex-col overflow-y-auto pb-6">
        <div className="mb-[45px] flex h-16 flex-col gap-[4px]">
          <span className="text-[23px] leading-[34px] font-bold">
            준비는 얼마나 걸리세요?
          </span>
          <span className="text-[17px] leading-[24px] text-(--DarkGray)">
            준비에 필요한 시간을 입력해주세요
          </span>
        </div>

        <TimeBanner />

        <div className="flex flex-col gap-10">
          <div className="flex flex-col gap-[10px]">
            <span className="text-[17px] leading-[17px] text-(--DarkGray)">
              준비시간
            </span>
            <div className="flex items-center gap-5">
              <div className="flex min-w-0 flex-1 items-end gap-[6px]">
                <input
                  value={hour}
                  onFocus={() => setIsHourFocused(true)}
                  onBlur={() => setIsHourFocused(false)}
                  onChange={handleHourChange}
                  placeholder="숫자입력"
                  className="h-11 min-w-0 flex-1 rounded-[8px] border border-(--GreenLightActive) text-center text-(--GreenNormalActive) focus:border-(--Green) focus:outline-none"
                />
                <span
                  className={`shrink-0 text-[17px] leading-[17px] whitespace-nowrap ${
                    isHourFocused || hour
                      ? "text-(--GreenDarkHover)"
                      : "text-(--Gray)"
                  }`}
                >
                  시간
                </span>
              </div>
              <div className="flex min-w-0 flex-1 items-end gap-[6px]">
                <input
                  value={minute}
                  onFocus={() => setIsMinuteFocused(true)}
                  onBlur={() => setIsMinuteFocused(false)}
                  onChange={handleMinuteChange}
                  placeholder="숫자입력"
                  className="h-11 min-w-0 flex-1 rounded-[8px] border border-(--GreenLightActive) text-center text-(--GreenNormalActive) focus:border-(--Green) focus:outline-none"
                />
                <span
                  className={`shrink-0 text-[17px] leading-[17px] whitespace-nowrap ${
                    isMinuteFocused || minute
                      ? "text-(--GreenDarkHover)"
                      : "text-(--Gray)"
                  }`}
                >
                  분
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-[10px]">
            <span className="text-[17px] leading-[17px] text-(--DarkGray)">
              다시알림 간격
            </span>
            <div className="flex gap-[3px] text-[17px] leading-[17px] text-[#b5ccb8]">
              {reminderOptions.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => handleReminderClick(value)}
                  className={`flex-1 rounded-[8px] border px-[10px] py-[10px] ${
                    selectedReminderMinutes === value
                      ? "border-(--GreenNormal) bg-(--GreenNormal) text-(--White)"
                      : "border-(--GreenLightActive)"
                  }`}
                >
                  {value}분
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-[10px]">
            <span className="text-[17px] leading-[17px] text-(--DarkGray)">
              출발 전 챙길 것을 적어보세요
              <span className="ml-[6px] text-[17px] leading-[17px] text-(--Lightgray)">
                (선택)
              </span>
            </span>
            <textarea
              placeholder="ex) 우산, 지갑"
              value={checklist}
              onChange={handleChecklistChange}
              className="h-20 w-full rounded-[10px] border border-(--GreenLightActive) p-4"
            />
            <span className="text-[13px] leading-[13px] text-(--Lightgray)">
              최대 24자 작성 가능
            </span>
          </div>
        </div>
      </div>

      <div>
        <div className="h-1.5 w-full rounded-full bg-[#e4e4e4]">
          <div className="h-full w-full rounded-full bg-(--GreenNormal)" />
        </div>
        <button
          type="button"
          className="h-[67px] w-full bg-(--GreenLight) text-[17px] font-bold text-[#b1d8b6]"
        >
          최종 확인하기
        </button>
      </div>
    </div>
  );
}

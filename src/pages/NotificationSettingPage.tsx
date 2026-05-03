import "./NotificationSettingPage.css";
import { useState } from "react";
import {
  useSetAlarmTitle,
  useSetAlarmArrivalTime,
} from "../stores/useAlarmStore";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Picker from "react-mobile-picker";
import { ko } from "date-fns/locale";

export default function NotificationSettingPage() {
  const setAlarmTitle = useSetAlarmTitle();
  const setAlarmArrivalTime = useSetAlarmArrivalTime();
  const [date, setDate] = useState<Date | null>(null);
  const [time, setTime] = useState({
    period: "오후",
    hour: "",
    minute: "",
  });

  const [title, setTitle] = useState("");

  const formatDate = (d: Date | null) => {
    if (!d) return "";
    return d.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "numeric",
      day: "numeric",
      weekday: "long",
    });
  };

  return (
    <div className="box-border min-h-screen w-full px-5 pt-[52px]">
      <h1 className="text-[26px] leading-[150%] font-semibold text-[var(--Normal)]">
        일정이 언제인가요?
      </h1>

      <p className="mt-[4px] text-[17px] font-normal text-[var(--Darkgray)]">
        날짜와 시간을 알려주세요
      </p>

      {/* 주제 */}
      <div className="mt-[40px]">
        <label className="mb-[10px] block text-[17px] font-semibold text-[var(--Normal)]">
          주제{" "}
          <span className="font-normal text-[var(--Lightgray)]">(선택)</span>
        </label>

        <input
          type="text"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            setAlarmTitle(e.target.value);
          }}
          placeholder="예) 점심 약속, 병원 가기 등"
          className={`h-[48px] w-full rounded-[9px] border px-4 text-[16px] outline-none ${title ? "border-[var(--GreenNormal)]" : "border-[#e4e4e4]"} focus:border-[var(--GreenNormal)]`}
        />
      </div>

      {/* 날짜 */}
      <div className="mt-[24px]">
        <label className="mb-[10px] block text-[17px] font-semibold text-[var(--Normal)]">
          날짜
        </label>

        <input
          type="text"
          readOnly
          value={formatDate(date)}
          placeholder="날짜를 선택해 주세요"
          className={`mb-[16px] h-[48px] w-full rounded-[9px] border px-4 text-[16px] outline-none ${
            date
              ? "border-[#e4e4e4] bg-[#f9f9f9] font-medium text-[#6d6d6d]"
              : "border-[#e4e4e4] bg-white text-[var(--Lightgray)]"
          } `}
        />

        <div
          className={`rounded-[9px] border p-[20px] ${
            date ? "border-[var(--GreenNormal)]" : "border-[#e4e4e4]"
          }`}
        >
          <DatePicker
            selected={date}
            onChange={(d: Date | null) => setDate(d)}
            locale={ko}
            inline
            renderCustomHeader={({ date, decreaseMonth, increaseMonth }) => (
              <div className="mb-[16px] flex items-center justify-between">
                <span className="text-[17px] font-medium text-[#6d6d6d]">
                  {date.getFullYear()}년 {date.getMonth() + 1}월
                </span>

                <div className="flex gap-[12px]">
                  <button onClick={decreaseMonth} className="p-2">
                    <div className="h-[10px] w-[10px] rotate-45 border-b-2 border-l-2 border-[var(--GreenNormal)]" />
                  </button>

                  <button onClick={increaseMonth} className="p-2">
                    <div className="h-[10px] w-[10px] -rotate-45 border-r-2 border-b-2 border-[var(--GreenNormal)]" />
                  </button>
                </div>
              </div>
            )}
          />
        </div>
      </div>

      {/* 도착 시간 */}
      <div className="mt-[32px]">
        <label className="mb-[10px] block text-[17px] font-semibold text-[var(--Normal)]">
          도착 시간
        </label>

        <input
          type="text"
          readOnly
          value={
            time.hour && time.minute
              ? `${time.period} ${time.hour}시 ${time.minute}분`
              : ""
          }
          placeholder="도착 시간을 선택해 주세요"
          className={`mb-[12px] h-[48px] w-full rounded-[9px] border border-[#e4e4e4] px-4 text-[16px] outline-none ${
            time.hour && time.minute
              ? "bg-[#F9F9F9] text-[var(--Darkgray)]"
              : "font-normal"
          }`}
        />

        <div className="relative overflow-hidden rounded-[12px] border border-[#e4e4e4] bg-white [&_*]:!border-t-0 [&_*]:!border-b-0 [&_*]:!shadow-none">
          <div className="absolute top-1/2 right-[24px] left-[24px] h-[44px] -translate-y-1/2 rounded-full bg-[#eff9f1]" />

          <Picker
            value={time}
            onChange={(value) => {
              const newTime = value as {
                period: string;
                hour: string;
                minute: string;
              };

              setTime(newTime);

              if (newTime.hour && newTime.minute) {
                setAlarmArrivalTime(
                  `${newTime.period} ${newTime.hour}시 ${newTime.minute}분`,
                );
              }
            }}
            height={220}
            itemHeight={44}
          >
            <Picker.Column name="period">
              {["오후", "오전"].map((item) => (
                <Picker.Item key={item} value={item}>
                  {({ selected }) => (
                    <span
                      className={
                        selected
                          ? "text-[20px] font-semibold text-[var(--GreenNormal)]"
                          : "text-[20px] text-[#d6d6d6]"
                      }
                    >
                      {item}
                    </span>
                  )}
                </Picker.Item>
              ))}
            </Picker.Column>

            <Picker.Column name="hour">
              {Array.from({ length: 12 }, (_, i) => String(i + 1)).map(
                (item) => (
                  <Picker.Item key={item} value={item}>
                    {({ selected }) => (
                      <span
                        className={
                          selected
                            ? "text-[20px] font-normal text-[var(--GreenNormal)]"
                            : "text-[20px] text-[#d6d6d6]"
                        }
                      >
                        {item}
                      </span>
                    )}
                  </Picker.Item>
                ),
              )}
            </Picker.Column>

            <Picker.Column name="minute">
              {Array.from({ length: 60 }, (_, i) =>
                String(i).padStart(2, "0"),
              ).map((item) => (
                <Picker.Item key={item} value={item}>
                  {({ selected }) => (
                    <span
                      className={
                        selected
                          ? "text-[20px] font-normal text-[var(--GreenNormal)]"
                          : "text-[20px] text-[#d6d6d6]"
                      }
                    >
                      {item}
                    </span>
                  )}
                </Picker.Item>
              ))}
            </Picker.Column>
          </Picker>

          <div className="pointer-events-none absolute inset-x-0 top-0 h-[16px] bg-gradient-to-b from-white to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[16px] bg-gradient-to-t from-white to-transparent" />
        </div>
      </div>
    </div>
  );
}

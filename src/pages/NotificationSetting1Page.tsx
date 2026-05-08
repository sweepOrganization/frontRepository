import { ko } from "date-fns/locale";
import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Picker from "react-mobile-picker";
import { useNavigate } from "react-router-dom";
import {
  useSetAlarmArrivalTime,
  useSetAlarmTitle,
} from "../stores/useAlarmStore";
import "./NotificationSetting1Page.css";

export default function NotificationSettingPage() {
  const navigate = useNavigate();
  const setAlarmTitle = useSetAlarmTitle();
  const setAlarmArrivalTime = useSetAlarmArrivalTime();
  const [date, setDate] = useState<Date | null>(null);
  const [time, setTime] = useState({
    period: "오후",
    hour: "1",
    minute: "00",
  });
  const [isTimeSelected, setIsTimeSelected] = useState(false);

  const [title, setTitle] = useState("");

  useEffect(() => {
    if (!date || !isTimeSelected) return;

    const hour24 =
      time.period === "오후"
        ? (Number(time.hour) % 12) + 12
        : Number(time.hour) % 12;

    const formattedDate = `${date.getFullYear()}-${String(
      date.getMonth() + 1,
    ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

    const formattedTime = `${formattedDate}T${String(hour24).padStart(2, "0")}:${String(
      time.minute,
    ).padStart(2, "0")}:00`;

    setAlarmArrivalTime(formattedTime);
  }, [date, time, isTimeSelected, setAlarmArrivalTime]);

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
    <div className="box-border min-h-screen w-full px-4 pt-[14px] pb-[143px]">
      <h1 className="text-[23px] leading-[150%] font-semibold text-(--Normal)">
        일정을 언제로 할까요?
      </h1>

      <p className="mt-[4px] text-[15px] font-normal text-(--Darkgray)">
        날짜와 도착 시간을 알려주세요
      </p>

      <div className="mt-[40px]">
        <label className="mb-[10px] block text-[17px] font-semibold text-(--Normal)">
          주제 <span className="font-normal text-(--Lightgray)">(선택)</span>
        </label>

        <input
          type="text"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            setAlarmTitle(e.target.value);
          }}
          placeholder="예: 점심 약속, 병원 가기"
          className={`h-[48px] w-full rounded-[9px] border px-4 text-[16px] outline-none ${title ? "border-(--GreenNormal)" : "border-[#e4e4e4]"} focus:border-(--GreenNormal)`}
        />
      </div>

      <div className="mt-[24px]">
        <label className="mb-[10px] block text-[17px] font-semibold text-(--Normal)">
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
              : "border-[#e4e4e4] bg-white text-(--Lightgray)"
          } `}
        />

        <div
          className={`rounded-[9px] border p-[20px] ${
            date ? "border-(--GreenNormal)" : "border-[#e4e4e4]"
          }`}
        >
          <DatePicker
            selected={date}
            onChange={(d: Date | null) => setDate(d)}
            minDate={new Date()}
            locale={ko}
            inline
            renderCustomHeader={({ date, decreaseMonth, increaseMonth }) => (
              <div className="mb-[16px] flex items-center justify-between">
                <span className="text-[17px] font-medium text-[#6d6d6d]">
                  {date.getFullYear()}년 {date.getMonth() + 1}월
                </span>

                <div className="flex gap-[12px]">
                  <button onClick={decreaseMonth} className="p-2" type="button">
                    <div className="h-[10px] w-[10px] rotate-45 border-b-2 border-l-2 border-(--GreenNormal)" />
                  </button>

                  <button onClick={increaseMonth} className="p-2" type="button">
                    <div className="h-[10px] w-[10px] -rotate-45 border-r-2 border-b-2 border-(--GreenNormal)" />
                  </button>
                </div>
              </div>
            )}
          />
        </div>
      </div>

      <div className="mt-[32px]">
        <label className="mb-[10px] block text-[17px] font-semibold text-(--Normal)">
          도착 시간
        </label>

        <input
          type="text"
          readOnly
          value={
            isTimeSelected
              ? `${time.period} ${time.hour}시 ${time.minute}분`
              : ""
          }
          placeholder="도착 시간을 선택해 주세요"
          className={`mb-[12px] h-[48px] w-full rounded-[9px] border border-[#e4e4e4] px-4 text-[16px] outline-none ${
            time.hour && time.minute
              ? "bg-[#F9F9F9] text-(--Darkgray)"
              : "font-normal"
          }`}
        />

        <div className="relative touch-pan-y overflow-hidden rounded-[12px] border border-[#e4e4e4] bg-white **:border-t-0! **:border-b-0! **:shadow-none!">
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
              setIsTimeSelected(true);
            }}
            wheelMode="normal"
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
                          ? "text-[20px] font-semibold text-(--GreenNormal)"
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
                            ? "text-[20px] font-normal text-(--GreenNormal)"
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
                          ? "text-[20px] font-normal text-(--GreenNormal)"
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

          <div className="pointer-events-none absolute inset-x-0 top-0 h-[16px] bg-linear-to-b from-white to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[16px] bg-linear-to-t from-white to-transparent" />
        </div>
      </div>

      <div className="fixed right-0 bottom-0 left-0 bg-white">
        <div className="h-1.5 w-full rounded-none bg-[#e4e4e4]">
          <div className="h-full w-1/4 rounded-l-none rounded-r-[300px] bg-(--GreenNormal)" />
        </div>

        <button
          type="button"
          disabled={!date || !isTimeSelected}
          onClick={() => {
            navigate("/notification-setting-2");
          }}
          className={`h-[67px] w-full text-[21px] font-normal ${
            !date || !isTimeSelected
              ? "bg-(--GreenLight) text-[#b1d8b6]"
              : "bg-(--GreenNormal) text-white"
          }`}
        >
          출발지 설정하기
        </button>
      </div>
    </div>
  );
}

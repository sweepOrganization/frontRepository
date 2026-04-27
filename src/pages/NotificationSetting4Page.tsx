export default function NotificationSetting4Page() {
  return (
    <div className="flex h-screen flex-col">
      <div className="mx-4 mt-[14px] flex flex-1 flex-col overflow-y-auto pb-6">
        <div className="mb-[45px] flex h-16 flex-col gap-[4px]">
          <span className="text-[23px] leading-[34px] font-bold">
            준비는 얼마나 걸리나요?
          </span>
          <span className="text-[17px] leading-[24px] text-(--DarkGray)">
            준비에 소요되는 시간을 입력해주세요
          </span>
        </div>
        {/* 출발시간 / 도착시간 배너 */}
        <div className="flex flex-col gap-10">
          {/* 준비시간 */}
          <div className="flex flex-col gap-[10px]">
            <span>준비시간</span>
            <div>
              <input type="number" />
              <span>시간</span>
              <input type="number" />
              <span>분</span>
            </div>
          </div>
          {/* 다시알림 간격 */}
          <div className="flex flex-col gap-[10px]">
            <span>다시알림 간격</span>
            <div className="flex justify-between">
              <button>0분</button>
              <button>5분</button>
              <button>10분</button>
              <button>15분</button>
              <button>20분</button>
            </div>
          </div>
          {/* 출발전, 챙길 것을 적어보세요 */}
          <div className="flex flex-col gap-[10px]">
            <span>출발전, 챙길 것을 적어보세요 (선택)</span>
            <textarea placeholder="ex) 우산, 지갑 등" />
            <span>최대 24자 작성 가능</span>
          </div>
        </div>
      </div>

      <div>
        <div className="h-1.5 w-full rounded-full bg-[#e4e4e4]">
          <div className="h-full w-4/4 rounded-full bg-(--GreenNormal)" />
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

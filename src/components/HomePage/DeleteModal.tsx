import useDeleteAlarmMutation from "../../hooks/mutations/useDeleteAlarmMutation";

type DeleteModalProps = {
  alarmId: number;
  onClose: () => void;
};

export default function DeleteModal({ alarmId, onClose }: DeleteModalProps) {
  const { mutate: deleteAlarm } = useDeleteAlarmMutation({
    onSuccess: () => {
      onClose();
    },
  });

  const handleDeleteAlarm = () => {
    deleteAlarm({ alarmId });
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <div className="flex h-[297px] w-[285px] flex-col overflow-hidden rounded-[10px] border border-[#E4E4E4] bg-white">
      <div className="mx-[70.5px] mt-5 mb-[27px] flex flex-col items-center justify-between">
        <img
          src="/delete-duck-icon.svg"
          alt="오리"
          className="mx-[35px] mb-[14px]"
        />
        <span className="px-[3px]text-[17px] mb-2 font-semibold text-(--Normal)">
          알람을 삭제할까요?
        </span>
        <p className="text-center text-[15px] font-normal text-(--Darkgray)">
          지금까지 기록한 일정
          <br />
          정보들이 모두 삭제돼요.
          <br />
          그래도 삭제할까요?
        </p>
      </div>
      <div className="flex w-full flex-1 items-stretch">
        <button
          className="h-full flex-1 border-t border-[#E4E4E4]"
          onClick={handleCancel}
        >
          취소
        </button>
        <button
          className="h-full flex-1 border-t border-[#E4E4E4] bg-(--GreenNormal) text-white"
          onClick={handleDeleteAlarm}
        >
          삭제
        </button>
      </div>
    </div>
  );
}

import clsx from "clsx";
import { Dropdown } from "../dropdown";
import { IconCheck, IconClock } from "../icon";
import { useEffect } from "react";
const Hours = [
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21,
  22, 23,
] as const;
const Minutes = [
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21,
  22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40,
  41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59,
] as const;
const Seconds = Minutes;
export type Hour = (typeof Hours)[number];
export type Minute = (typeof Minutes)[number];
type Second = (typeof Seconds)[number];
type Time = [Hour, Minute];
export function TimeSelectPanel({
  selectedTime,
  onSelect,
  disable,
}: {
  selectedTime: Time;
  disabledHours?: Hour[];
  disabledMinutes?: Minute[];
  disable?: boolean;
  onSelect: (time: Time) => void;
}) {
  useEffect(() => {
    document
      .getElementById(`time-select-panel-hour-${selectedTime[0]}`)
      ?.scrollIntoView();
    document
      .getElementById(`time-select-panel-minute-${selectedTime[1]}`)
      ?.scrollIntoView();
  }, []);
  return (
    <div className='flex gap-8 -mt-5 w-full'>
      <Dropdown
        nest
        className='!w-full'
        trigger={["click"]}
        content={
          <div className='flex'>
            <div className='flex flex-col max-h-[12.5rem] overflow-y-auto no-scrollbar border-r'>
              {Array.from({ length: 24 }).map((_, index) => (
                <div
                  className='h-40 flex-shrink-0 cursor-pointer hover:bg-surface w-[5rem] flex items-center px-12 gap-x-8'
                  key={index}
                  id={`time-select-panel-hour-${index}`}
                  onClick={() => {
                    onSelect([index as Hour, selectedTime[1]]);
                  }}
                >
                  <span className='w-32'>
                    {index < 10 ? `0${index}` : index}
                  </span>
                  {index === selectedTime[0] && <IconCheck />}
                </div>
              ))}
            </div>
            <div className='flex flex-col max-h-[12.5rem] overflow-y-auto no-scrollbar border-r'>
              {Array.from({ length: 60 }).map((_, index) => (
                <div
                  className='h-40 flex-shrink-0 cursor-pointer hover:bg-surface w-[5rem] flex items-center px-12 gap-x-8'
                  key={index}
                  id={`time-select-panel-minute-${index}`}
                  onClick={() => {
                    onSelect([selectedTime[0], index as Minute]);
                  }}
                >
                  <span className='w-32'>
                    {index < 10 ? `0${index}` : index}
                  </span>
                  {index === selectedTime[1] && <IconCheck />}
                </div>
              ))}
            </div>
            {/* <div className='flex flex-col'>
              <div
                className='h-40 w-[5rem] flex items-center px-12 gap-x-8 cursor-pointer'
                onClick={() => {
                  onSelect([selectedTime[0], selectedTime[1], "AM"]);
                }}
              >
                <span className='w-32'>AM</span>
                {selectedTime[2] === "AM" && <IconCheck />}
              </div>
              <div
                className='h-40 w-[5rem] flex items-center px-12 gap-x-8 cursor-pointer'
                onClick={() => {
                  onSelect([selectedTime[0], selectedTime[1], "PM"]);
                }}
              >
                <span className='w-32'>PM</span>
                {selectedTime[2] === "PM" && <IconCheck />}
              </div>
            </div> */}
          </div>
        }
      >
        <div
          className={clsx(
            "h-40 rounded-6 px-12 flex items-center bg-surface gap-8 w-full cursor-pointer",
            {
              "!cursor-not-allowed": disable,
            }
          )}
          onClick={(e) => {
            if (disable) {
              e.preventDefault();
              e.stopPropagation();
            }
          }}
        >
          <IconClock />
          <span>
            {selectedTime[0] < 10 ? `0${selectedTime[0]}` : selectedTime[0]} :{" "}
            {selectedTime[1] < 10 ? `0${selectedTime[1]}` : selectedTime[1]}{" "}
            {/* {selectedTime[2]} */}
          </span>
        </div>
      </Dropdown>
    </div>
  );
}

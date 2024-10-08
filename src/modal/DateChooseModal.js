import React, { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { axiosInstance } from "../axiosinstance/Axiosinstance";
import "../style/DateChooseModal.css";

const DateChooseModal = ({
    show,
    onClose,
    setSelectedDates,
    destinationId,
    setPlanId,
    formatDate,
}) => {
    const [calendarEvents, setCalendarEvents] = useState([]);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [vehicle, setVehicle] = useState("PUBLIC_TRANSPORTATION");

    const currentMonth = new Date();
    currentMonth.setDate(1);

    const nextMonth = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth() + 1,
        1
    );

    if (!show) {
        return null;
    }

    const handleDateSelect = (selectInfo) => {
        const { start, end } = selectInfo;
        if (!startDate) {
            setStartDate(start);
            setCalendarEvents([
                {
                    start,
                    end: new Date(start).setDate(start.getDate() + 1),
                    display: "background",
                    backgroundColor: "#000",
                },
            ]);
        } else if (!endDate) {
            const adjustedEnd = new Date(end);
            adjustedEnd.setDate(adjustedEnd.getDate() - 1);
            setEndDate(adjustedEnd);

            const formattedStartDate = formatDate(startDate);
            const formattedEndDate = formatDate(adjustedEnd);

            setCalendarEvents([
                {
                    start: startDate,
                    end: adjustedEnd,
                    display: "background",
                    backgroundColor: "#000",
                },
            ]);

            setSelectedDates(`${formattedStartDate} ~ ${formattedEndDate}`);
        }
    };

    const handleReset = () => {
        setStartDate(null);
        setEndDate(null);
        setCalendarEvents([]);
    };

    const handleSelectClick = async () => {
        if (startDate && endDate && !isWrongDate()) {
            const token = localStorage.getItem("token");

            // 한국 시간으로 변환하여 문자열로 저장
            const formatToKST = (date) => {
                const options = {
                    timeZone: "Asia/Seoul",
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    hour12: false,
                };
                return new Date(date)
                    .toLocaleString("sv-SE", options)
                    .replace(" ", "T");
            };

            const data = {
                destinationId: destinationId,
                startedAt: formatToKST(startDate),
                endedAt: formatToKST(endDate),
                vehicle: vehicle,
            };
            console.log("요청 data", data);

            try {
                const response = await axiosInstance.post("/plans", data, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                const planId = response.data.planId;
                console.log("일정 생성 응답 :", response);

                setPlanId(planId);
                onClose();
            } catch (error) {
                console.error("요청 중 오류 발생:", error);
            }
        }
    };


    const isWrongDate = () => {
        return startDate && endDate && startDate > endDate;
    };



    return (
        <div className="datechoosemodal">
            <div className="datechoosemodal-content">
                <h2>여행 기간이 어떻게 되시나요?</h2>
                <p>* 여행 일자는 최대 10일까지 설정 가능합니다.</p>
                <p>현지 여행 기간(여행지 도착 날짜, 여행지 출발 날짜)으로 입력해 주세요.</p>
                <div className="calendar-container">
                    <div className="calendar">
                        <FullCalendar
                            plugins={[dayGridPlugin, interactionPlugin]}
                            initialView="dayGridMonth"
                            initialDate={currentMonth}
                            selectable={true}
                            select={handleDateSelect}
                            events={calendarEvents}
                            dayMaxEvents={true}
                        />
                    </div>
                    <div className="calendar">
                        <FullCalendar
                            plugins={[dayGridPlugin, interactionPlugin]}
                            initialView="dayGridMonth"
                            initialDate={nextMonth}
                            selectable={true}
                            select={handleDateSelect}
                            events={calendarEvents}
                            dayMaxEvents={true}
                        />
                    </div>
                </div>

                <div className={`selected-date ${isWrongDate() ? 'wrong' : ''}`}>
                    선택한 날짜 :{" "}
                    <strong>
                        {startDate && endDate
                            ? isWrongDate()
                                ? "시작 날짜가 마지막 날짜보다 늦습니다. 다시 선택을 눌러서 날짜를 선택해주세요."
                                : `${formatDate(startDate)} ~ ${formatDate(endDate)}`
                            : "날짜를 선택해주세요."}
                    </strong>
                </div>

                <div className="vehicle-select">
                    <p>이동 수단 선택:</p>
                    <label>
                        <input
                            type="radio"
                            value="PUBLIC_TRANSPORTATION"
                            checked={vehicle === "PUBLIC_TRANSPORTATION"}
                            onChange={(e) => setVehicle(e.target.value)}
                        />
                        대중교통 이용
                    </label>
                    <label>
                        <input
                            type="radio"
                            value="OWN_CAR"
                            checked={vehicle === "OWN_CAR"}
                            onChange={(e) => setVehicle(e.target.value)}
                        />
                        자가용
                    </label>
                </div>

                <button onClick={handleReset}>다시 선택</button>
                <button
                    onClick={handleSelectClick}
                    disabled={!startDate || !endDate || isWrongDate()}
                    className={`select-button ${!startDate || !endDate || isWrongDate()
                        ? "disabled"
                        : ""
                        }`}
                >
                    선택
                </button>
            </div>
        </div>
    );
};

export default DateChooseModal;

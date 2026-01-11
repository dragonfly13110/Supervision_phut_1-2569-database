import { useState, useMemo } from 'react';
import { FiChevronLeft, FiChevronRight, FiCalendar } from 'react-icons/fi';
import detailedBudgetProjectsData from '../data/detailedBudgetProjects.json';

interface DetailedProject {
    name: string;
    subActivity: string;
    relevantPolicies?: string;
    target: string;
    budget: string;
    result: string;
    problem: string;
    solution: string;
    status?: 'pending' | 'scheduled' | 'in_progress' | 'completed';
    images?: { url: string; caption?: string }[];
}

interface BudgetGroup {
    id: string;
    title: string;
    strategicIssues?: string[];
    projects: DetailedProject[];
}

interface CalendarEvent {
    date: Date;
    title: string;
    subActivity: string;
    status?: string;
    result: string;
}

// Thai month names
const THAI_MONTHS = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
];

const THAI_DAYS = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];

// Parse multiple dates from Thai text (e.g. "20 และ 22 ม.ค. 2569")
function parseThaiDates(text: string): Date[] {
    if (!text || text === '-') return [];

    const thaiMonthMap: Record<string, number> = {
        'มกราคม': 0, 'ม.ค.': 0, 'ม.ค': 0,
        'กุมภาพันธ์': 1, 'ก.พ.': 1, 'ก.พ': 1,
        'มีนาคม': 2, 'มี.ค.': 2, 'มี.ค': 2,
        'เมษายน': 3, 'เม.ย.': 3, 'เม.ย': 3,
        'พฤษภาคม': 4, 'พ.ค.': 4, 'พ.ค': 4,
        'มิถุนายน': 5, 'มิ.ย.': 5, 'มิ.ย': 5,
        'กรกฎาคม': 6, 'ก.ค.': 6, 'ก.ค': 6,
        'สิงหาคม': 7, 'ส.ค.': 7, 'ส.ค': 7,
        'กันยายน': 8, 'ก.ย.': 8, 'ก.ย': 8,
        'ตุลาคม': 9, 'ต.ค.': 9, 'ต.ค': 9,
        'พฤศจิกายน': 10, 'พ.ย.': 10, 'พ.ย': 10,
        'ธันวาคม': 11, 'ธ.ค.': 11, 'ธ.ค': 11
    };

    const dates: Date[] = [];

    // Find all month references in text
    const monthPattern = /(มกราคม|กุมภาพันธ์|มีนาคม|เมษายน|พฤษภาคม|มิถุนายน|กรกฎาคม|สิงหาคม|กันยายน|ตุลาคม|พฤศจิกายน|ธันวาคม|ม\.ค\.|ก\.พ\.|มี\.ค\.|เม\.ย\.|พ\.ค\.|มิ\.ย\.|ก\.ค\.|ส\.ค\.|ก\.ย\.|ต\.ค\.|พ\.ย\.|ธ\.ค\.)/;
    const monthMatch = text.match(monthPattern);

    if (monthMatch && monthMatch.index !== undefined) {
        const month = thaiMonthMap[monthMatch[1]];
        const monthIndex = monthMatch.index;

        // Get text BEFORE the month (where day numbers should be)
        const textBeforeMonth = text.substring(0, monthIndex);

        // Get year from text AFTER month
        const textAfterMonth = text.substring(monthIndex);
        const yearMatch = textAfterMonth.match(/25(6[89]|70)/);
        let year = 2026; // Default
        if (yearMatch) {
            year = parseInt('25' + yearMatch[1]) - 543;
        }

        // Find all day numbers before the month
        // Pattern to find "วันที่ X และ Y" or "X และ Y" or just single numbers
        const daysPattern = /(\d{1,2})(?:\s*(?:และ|,|\/)\s*(\d{1,2}))?(?:\s*(?:และ|,|\/)\s*(\d{1,2}))?/g;
        let daysMatch;
        const foundDays: number[] = [];

        while ((daysMatch = daysPattern.exec(textBeforeMonth)) !== null) {
            if (daysMatch[1]) foundDays.push(parseInt(daysMatch[1]));
            if (daysMatch[2]) foundDays.push(parseInt(daysMatch[2]));
            if (daysMatch[3]) foundDays.push(parseInt(daysMatch[3]));
        }

        // Filter valid days (1-31) and create dates
        foundDays
            .filter(day => day >= 1 && day <= 31 && !foundDays.includes(year % 100)) // exclude year digits
            .forEach(day => {
                dates.push(new Date(year, month, day));
            });
    }

    return dates;
}

// Get status color
function getStatusColor(status?: string): string {
    switch (status) {
        case 'completed': return '#10b981';
        case 'in_progress': return '#3b82f6';
        case 'scheduled': return '#f59e0b';
        default: return '#6b7280';
    }
}

export function SectionCalendar() {
    const [currentDate, setCurrentDate] = useState(new Date(2026, 0, 1)); // Start at Jan 2026
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    const budgetGroups = detailedBudgetProjectsData as unknown as BudgetGroup[];

    // Parse events from project data
    const events = useMemo(() => {
        const eventList: CalendarEvent[] = [];

        budgetGroups.forEach(group => {
            group.projects.forEach(project => {
                const dates = parseThaiDates(project.result);
                dates.forEach(date => {
                    eventList.push({
                        date,
                        title: project.name,
                        subActivity: project.subActivity,
                        status: project.status,
                        result: project.result
                    });
                });
            });
        });

        return eventList;
    }, [budgetGroups]);

    // Get first day of month and total days
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();

    // Get events for a specific date
    const getEventsForDate = (day: number): CalendarEvent[] => {
        return events.filter(event =>
            event.date.getDate() === day &&
            event.date.getMonth() === currentDate.getMonth() &&
            event.date.getFullYear() === currentDate.getFullYear()
        );
    };

    // Get events for selected date
    const selectedDateEvents = selectedDate
        ? events.filter(event =>
            event.date.getDate() === selectedDate.getDate() &&
            event.date.getMonth() === selectedDate.getMonth() &&
            event.date.getFullYear() === selectedDate.getFullYear()
        )
        : [];

    // Navigate months
    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
        setSelectedDate(null);
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
        setSelectedDate(null);
    };

    // Generate calendar grid
    const calendarDays = [];
    for (let i = 0; i < firstDay; i++) {
        calendarDays.push(null); // Empty cells before first day
    }
    for (let day = 1; day <= daysInMonth; day++) {
        calendarDays.push(day);
    }

    return (
        <section className="section section-container">
            <div className="section-header">
                <div className="section-icon">
                    <FiCalendar />
                </div>
                <div>
                    <h2 className="section-title">ปฏิทินกิจกรรม</h2>
                    <p className="section-subtitle">ดูกำหนดการโครงการและกิจกรรมตามวันที่</p>
                </div>
            </div>

            <div className="calendar-container">
                {/* Calendar Header */}
                <div className="calendar-header">
                    <button className="calendar-nav-btn" onClick={prevMonth}>
                        <FiChevronLeft />
                    </button>
                    <h3 className="calendar-month-title">
                        {THAI_MONTHS[currentDate.getMonth()]} {currentDate.getFullYear() + 543}
                    </h3>
                    <button className="calendar-nav-btn" onClick={nextMonth}>
                        <FiChevronRight />
                    </button>
                </div>

                {/* Calendar Grid */}
                <div className="calendar-grid">
                    {/* Day headers */}
                    {THAI_DAYS.map((day, index) => (
                        <div key={index} className="calendar-day-header">
                            {day}
                        </div>
                    ))}

                    {/* Calendar days */}
                    {calendarDays.map((day, index) => {
                        if (day === null) {
                            return <div key={`empty-${index}`} className="calendar-day empty"></div>;
                        }

                        const dayEvents = getEventsForDate(day);
                        const isSelected = selectedDate?.getDate() === day &&
                            selectedDate?.getMonth() === currentDate.getMonth();
                        const isToday = new Date().getDate() === day &&
                            new Date().getMonth() === currentDate.getMonth() &&
                            new Date().getFullYear() === currentDate.getFullYear();

                        return (
                            <div
                                key={day}
                                className={`calendar-day ${dayEvents.length > 0 ? 'has-events' : ''} ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''}`}
                                onClick={() => setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))}
                            >
                                <span className="calendar-day-number">{day}</span>
                                {dayEvents.length > 0 && (
                                    <div className="calendar-event-dots">
                                        {dayEvents.slice(0, 3).map((event, i) => (
                                            <span
                                                key={i}
                                                className="calendar-event-dot"
                                                style={{ background: getStatusColor(event.status) }}
                                            ></span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Selected Date Events */}
                {selectedDate && (
                    <div className="calendar-events-panel">
                        <h4 className="calendar-events-title">
                            กิจกรรมวันที่ {selectedDate.getDate()} {THAI_MONTHS[selectedDate.getMonth()]} {selectedDate.getFullYear() + 543}
                        </h4>
                        {selectedDateEvents.length > 0 ? (
                            <div className="calendar-events-list">
                                {selectedDateEvents.map((event, index) => (
                                    <div key={index} className="calendar-event-item">
                                        <div
                                            className="calendar-event-status"
                                            style={{ background: getStatusColor(event.status) }}
                                        ></div>
                                        <div className="calendar-event-content">
                                            <div className="calendar-event-title">{event.subActivity || event.title}</div>
                                            <div className="calendar-event-desc">{event.result}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="calendar-no-events">ไม่มีกิจกรรมในวันนี้</p>
                        )}
                    </div>
                )}

                {/* Legend */}
                <div className="calendar-legend">
                    <div className="calendar-legend-item">
                        <span className="calendar-legend-dot" style={{ background: '#10b981' }}></span>
                        <span>เสร็จสิ้น</span>
                    </div>
                    <div className="calendar-legend-item">
                        <span className="calendar-legend-dot" style={{ background: '#3b82f6' }}></span>
                        <span>กำลังดำเนินการ</span>
                    </div>
                    <div className="calendar-legend-item">
                        <span className="calendar-legend-dot" style={{ background: '#f59e0b' }}></span>
                        <span>กำหนดวันแล้ว</span>
                    </div>
                    <div className="calendar-legend-item">
                        <span className="calendar-legend-dot" style={{ background: '#6b7280' }}></span>
                        <span>รอดำเนินการ</span>
                    </div>
                </div>
            </div>
        </section>
    );
}

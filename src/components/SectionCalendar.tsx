import { useState, useMemo } from 'react';
import { FiChevronLeft, FiChevronRight, FiCalendar } from 'react-icons/fi';
import detailedBudgetProjectsDataRound1 from '../data/detailedBudgetProjects.json';
import detailedBudgetProjectsDataRound2 from '../data/detailedBudgetProjects.round2.json';
import { useRound } from './RoundContext';


interface DetailedProject {
    name: string;
    subActivity?: string;
    relevantPolicies?: string;
    target?: string;
    budget?: string;
    result: string;
    progress?: string;
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
    subActivity?: string;
    status?: string;
    result: string;
}

// Thai month names
const THAI_MONTHS = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
];

const THAI_DAYS = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];

// Parse multiple dates from Thai text - supports many formats
function parseThaiDates(text: string): Date[] {
    if (!text || text === '-') return [];

    const thaiMonthMap: Record<string, number> = {
        // Full Thai names
        'มกราคม': 0, 'กุมภาพันธ์': 1, 'มีนาคม': 2, 'เมษายน': 3,
        'พฤษภาคม': 4, 'มิถุนายน': 5, 'กรกฎาคม': 6, 'สิงหาคม': 7,
        'กันยายน': 8, 'ตุลาคม': 9, 'พฤศจิกายน': 10, 'ธันวาคม': 11,
        // Short Thai with dot
        'ม.ค.': 0, 'ก.พ.': 1, 'มี.ค.': 2, 'เม.ย.': 3,
        'พ.ค.': 4, 'มิ.ย.': 5, 'ก.ค.': 6, 'ส.ค.': 7,
        'ก.ย.': 8, 'ต.ค.': 9, 'พ.ย.': 10, 'ธ.ค.': 11,
        // Short Thai without dot
        'มค': 0, 'กพ': 1, 'มีค': 2, 'เมย': 3,
        'พค': 4, 'มิย': 5, 'กค': 6, 'สค': 7,
        'กย': 8, 'ตค': 9, 'พย': 10, 'ธค': 11,
        // English months
        'jan': 0, 'feb': 1, 'mar': 2, 'apr': 3,
        'may': 4, 'jun': 5, 'jul': 6, 'aug': 7,
        'sep': 8, 'oct': 9, 'nov': 10, 'dec': 11,
        'january': 0, 'february': 1, 'march': 2, 'april': 3,
        'june': 5, 'july': 6, 'august': 7, 'september': 8,
        'october': 9, 'november': 10, 'december': 11
    };

    const dates: Date[] = [];
    const currentYear = new Date().getFullYear();

    // Helper: parse year (supports both พ.ศ. and ค.ศ.)
    const parseYear = (yearStr: string): number => {
        const y = parseInt(yearStr);
        if (isNaN(y)) return currentYear;
        if (y > 2400) return y - 543; // พ.ศ. -> ค.ศ.
        if (y < 100) return 2000 + y; // 69 -> 2069 -> but we need 2026 if it's 26
        return y;
    };

    // Pattern 1: DD/MM/YYYY or DD-MM-YYYY or DD.MM.YYYY
    const slashPattern = /(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})/g;
    let match;
    while ((match = slashPattern.exec(text)) !== null) {
        const day = parseInt(match[1]);
        const month = parseInt(match[2]) - 1; // 0-indexed
        const year = parseYear(match[3]);
        if (day >= 1 && day <= 31 && month >= 0 && month <= 11) {
            dates.push(new Date(year, month, day));
        }
    }

    // Pattern 2: Thai month pattern (e.g., "28 มกราคม 2569", "20 และ 22 ม.ค. 69")
    const thaiMonthPattern = /(มกราคม|กุมภาพันธ์|มีนาคม|เมษายน|พฤษภาคม|มิถุนายน|กรกฎาคม|สิงหาคม|กันยายน|ตุลาคม|พฤศจิกายน|ธันวาคม|ม\.ค\.|ก\.พ\.|มี\.ค\.|เม\.ย\.|พ\.ค\.|มิ\.ย\.|ก\.ค\.|ส\.ค\.|ก\.ย\.|ต\.ค\.|พ\.ย\.|ธ\.ค\.|มค|กพ|มีค|เมย|พค|มิย|กค|สค|กย|ตค|พย|ธค)/gi;

    let monthMatch;
    while ((monthMatch = thaiMonthPattern.exec(text)) !== null) {
        const monthStr = monthMatch[1].toLowerCase();
        const month = thaiMonthMap[monthStr] ?? thaiMonthMap[monthMatch[1]];
        if (month === undefined) continue;

        const monthIndex = monthMatch.index;

        // Get text BEFORE the month (for day numbers)
        const textBeforeMonth = text.substring(Math.max(0, monthIndex - 50), monthIndex);

        // Get text AFTER month (for year)
        const textAfterMonth = text.substring(monthIndex, monthIndex + 30);

        // Parse year - look for 2 or 4 digit year
        const yearMatch = textAfterMonth.match(/\s*\.?\s*(\d{2,4})/);
        let year = currentYear;
        if (yearMatch) {
            year = parseYear(yearMatch[1]);
        }

        // Find day numbers - support various separators
        const daysText = textBeforeMonth;
        const dayNumbers: number[] = [];

        // Match patterns like: "20 และ 22", "20, 22", "20-22", "วันที่ 20"
        const dayPattern = /\b(\d{1,2})\b/g;
        let dayMatch;
        while ((dayMatch = dayPattern.exec(daysText)) !== null) {
            const day = parseInt(dayMatch[1]);
            if (day >= 1 && day <= 31) {
                dayNumbers.push(day);
            }
        }

        // Check for day range (e.g., "15-17")
        const rangeMatch = textBeforeMonth.match(/(\d{1,2})\s*[-–]\s*(\d{1,2})\s*$/);
        if (rangeMatch) {
            const start = parseInt(rangeMatch[1]);
            const end = parseInt(rangeMatch[2]);
            if (start <= end && start >= 1 && end <= 31) {
                dayNumbers.length = 0; // clear existing
                for (let d = start; d <= end; d++) {
                    dayNumbers.push(d);
                }
            }
        }

        // Create dates
        dayNumbers.forEach(day => {
            const newDate = new Date(year, month, day);
            // Avoid duplicates
            if (!dates.some(d => d.getTime() === newDate.getTime())) {
                dates.push(newDate);
            }
        });
    }

    // Pattern 3: ISO format YYYY-MM-DD
    const isoPattern = /(\d{4})-(\d{2})-(\d{2})/g;
    while ((match = isoPattern.exec(text)) !== null) {
        let year = parseInt(match[1]);
        if (year > 2400) year -= 543; // พ.ศ. format
        const month = parseInt(match[2]) - 1;
        const day = parseInt(match[3]);
        if (day >= 1 && day <= 31 && month >= 0 && month <= 11) {
            const newDate = new Date(year, month, day);
            if (!dates.some(d => d.getTime() === newDate.getTime())) {
                dates.push(newDate);
            }
        }
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
    const { selectedRound } = useRound();
    const [currentDate, setCurrentDate] = useState(new Date(2026, 0, 1)); // Start at Jan 2026
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    const budgetGroups = (selectedRound === 'round1'
        ? detailedBudgetProjectsDataRound1
        : detailedBudgetProjectsDataRound2) as unknown as BudgetGroup[];


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
                {selectedRound !== 'round2' && (
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
                )}
            </div>
        </section>
    );
}

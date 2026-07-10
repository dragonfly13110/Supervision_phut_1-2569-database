import { useState, useEffect, useMemo } from 'react';
import { FiSearch, FiX, FiFilter } from 'react-icons/fi';
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
}

interface BudgetGroup {
    id: string;
    title: string;
    projects: DetailedProject[];
}

interface SearchResult {
    groupId: string;
    groupTitle: string;
    projectIndex: number;
    project: DetailedProject;
    matchField: string;
}

interface SearchFilterProps {
    onNavigate?: (section: string) => void;
}

// Status filter options
const STATUS_FILTERS = [
    { value: 'all', label: 'ทั้งหมด', color: '#6b7280' },
    { value: 'completed', label: 'เสร็จสิ้น', color: '#10b981' },
    { value: 'in_progress', label: 'กำลังดำเนินการ', color: '#3b82f6' },
    { value: 'scheduled', label: 'กำหนดวันแล้ว', color: '#f59e0b' },
    { value: 'pending', label: 'รอดำเนินการ', color: '#6b7280' },
];

export function SearchFilter({ onNavigate }: SearchFilterProps) {
    const { selectedRound } = useRound();
    const [query, setQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [isOpen, setIsOpen] = useState(false);
    const [showFilters, setShowFilters] = useState(false);

    const budgetGroups = (selectedRound === 'round1'
        ? detailedBudgetProjectsDataRound1
        : detailedBudgetProjectsDataRound2) as unknown as BudgetGroup[];


    // Search results
    const results = useMemo(() => {
        if (!query.trim() && statusFilter === 'all') return [];

        const searchResults: SearchResult[] = [];
        const lowerQuery = query.toLowerCase().trim();

        budgetGroups.forEach(group => {
            group.projects.forEach((project, projectIndex) => {
                // Status filter
                if (statusFilter !== 'all') {
                    const projectStatus = project.status || 'pending';
                    if (projectStatus !== statusFilter) return;
                }

                // Text search
                if (lowerQuery) {
                    const fieldsToSearch = [
                        { field: 'name', value: project.name || '' },
                        { field: 'subActivity', value: project.subActivity || '' },
                        { field: 'result', value: project.result || '' },
                        { field: 'progress', value: project.progress || '' },
                        { field: 'problem', value: project.problem || '' },
                        { field: 'solution', value: project.solution || '' },
                        { field: 'target', value: project.target || '' },
                        { field: 'relevantPolicies', value: project.relevantPolicies || '' },
                    ];

                    for (const { field, value } of fieldsToSearch) {
                        if (value.toLowerCase().includes(lowerQuery)) {
                            searchResults.push({
                                groupId: group.id,
                                groupTitle: group.title,
                                projectIndex,
                                project,
                                matchField: field
                            });
                            break; // Only add once per project
                        }
                    }
                } else {
                    // No text query, just status filter
                    searchResults.push({
                        groupId: group.id,
                        groupTitle: group.title,
                        projectIndex,
                        project,
                        matchField: 'status'
                    });
                }
            });
        });

        return searchResults.slice(0, 10); // Limit to 10 results
    }, [query, statusFilter, budgetGroups]);

    // Handle result click
    const handleResultClick = (result: SearchResult) => {
        if (onNavigate) {
            onNavigate(`section2-${result.groupId}`);
        }
        setIsOpen(false);
        setQuery('');
    };

    // Get status color
    const getStatusColor = (status?: string) => {
        switch (status) {
            case 'completed': return '#10b981';
            case 'in_progress': return '#3b82f6';
            case 'scheduled': return '#f59e0b';
            default: return '#6b7280';
        }
    };

    const getStatusLabel = (status?: string) => {
        switch (status) {
            case 'completed': return 'เสร็จสิ้น';
            case 'in_progress': return 'กำลังดำเนินการ';
            case 'scheduled': return 'กำหนดวันแล้ว';
            default: return 'รอดำเนินการ';
        }
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (!target.closest('.search-filter-container')) {
                setIsOpen(false);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    return (
        <div className="search-filter-container">
            <div className="search-filter-input-wrapper">
                <FiSearch className="search-filter-icon" />
                <input
                    type="text"
                    className="search-filter-input"
                    placeholder="ค้นหาโครงการ กิจกรรม..."
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                />
                {query && (
                    <button
                        className="search-filter-clear"
                        onClick={() => {
                            setQuery('');
                            setIsOpen(false);
                        }}
                    >
                        <FiX />
                    </button>
                )}
                {selectedRound !== 'round2' && (
                    <button
                        className={`search-filter-toggle ${showFilters ? 'active' : ''}`}
                        onClick={() => setShowFilters(!showFilters)}
                        title="ตัวกรอง"
                    >
                        <FiFilter />
                    </button>
                )}
            </div>

            {/* Filter chips */}
            {showFilters && (
                <div className="search-filter-chips">
                    {STATUS_FILTERS.map(filter => (
                        <button
                            key={filter.value}
                            className={`search-filter-chip ${statusFilter === filter.value ? 'active' : ''}`}
                            style={{
                                '--chip-color': filter.color
                            } as React.CSSProperties}
                            onClick={() => {
                                setStatusFilter(filter.value);
                                setIsOpen(true);
                            }}
                        >
                            <span
                                className="search-filter-chip-dot"
                                style={{ background: filter.color }}
                            ></span>
                            {filter.label}
                        </button>
                    ))}
                </div>
            )}

            {/* Results dropdown */}
            {isOpen && (query.trim() || statusFilter !== 'all') && (
                <div className="search-filter-results">
                    {results.length > 0 ? (
                        <>
                            <div className="search-filter-results-header">
                                พบ {results.length} รายการ
                            </div>
                            {results.map((result, index) => (
                                <div
                                    key={`${result.groupId}-${result.projectIndex}-${index}`}
                                    className="search-filter-result-item"
                                    onClick={() => handleResultClick(result)}
                                >
                                    {selectedRound !== 'round2' && (
                                        <div
                                            className="search-filter-result-status"
                                            style={{ background: getStatusColor(result.project.status) }}
                                        ></div>
                                    )}
                                    <div className="search-filter-result-content">
                                        <div className="search-filter-result-title">
                                            {result.project.subActivity || result.project.name}
                                        </div>
                                        <div className="search-filter-result-meta">
                                            <span className="search-filter-result-group">
                                                {result.groupTitle.substring(0, 50)}...
                                            </span>
                                            {selectedRound !== 'round2' && (
                                                <span
                                                    className="search-filter-result-badge"
                                                    style={{
                                                        background: `${getStatusColor(result.project.status)}20`,
                                                        color: getStatusColor(result.project.status)
                                                    }}
                                                >
                                                    {getStatusLabel(result.project.status)}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </>
                    ) : (
                        <div className="search-filter-no-results">
                            ไม่พบผลลัพธ์
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

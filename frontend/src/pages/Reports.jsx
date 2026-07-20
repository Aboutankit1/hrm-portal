import { LuFileChartColumn, LuDownload } from 'react-icons/lu';

const reports = [
  { name: 'Attendance Report', desc: 'Daily/monthly attendance summary for all employees' },
  { name: 'Employee Report', desc: 'Full employee roster with department & designation' },
  { name: 'Department Report', desc: 'Headcount and performance by department' },
  { name: 'Task Report', desc: 'Task completion rates and overdue tasks' },
  { name: 'Performance Report', desc: 'Monthly performance scores' },
  { name: 'Leave Report', desc: 'Leave requests and approval history' },
];

const Reports = () => {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold">Reports</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Generate and export reports as PDF or Excel</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {reports.map((r) => (
          <div key={r.name} className="card p-5 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/30 text-primary-600 flex items-center justify-center shrink-0">
              <LuFileChartColumn size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm">{r.name}</h3>
              <p className="text-xs text-gray-400 mt-1">{r.desc}</p>
              <button className="btn-secondary text-xs mt-3 flex items-center gap-1.5 px-3 py-1.5">
                <LuDownload size={13} /> Export
              </button>
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-400">
        Export wiring (PDF/Excel generation) connects to the report endpoints — hook up a backend export route per
        report to enable downloads.
      </p>
    </div>
  );
};

export default Reports;

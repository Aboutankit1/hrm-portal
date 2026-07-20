import { motion } from 'framer-motion';

const colorMap = {
  indigo: 'bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-300',
  green: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300',
  red: 'bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-300',
  yellow: 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300',
  blue: 'bg-sky-50 text-sky-600 dark:bg-sky-900/30 dark:text-sky-300',
  purple: 'bg-violet-50 text-violet-600 dark:bg-violet-900/30 dark:text-violet-300',
};

const StatCard = ({ icon: Icon, label, value, color = 'indigo', delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="card p-5 flex items-center gap-4"
    >
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${colorMap[color]}`}>
        <Icon size={20} />
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-bold leading-tight">{value}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{label}</p>
      </div>
    </motion.div>
  );
};

export default StatCard;

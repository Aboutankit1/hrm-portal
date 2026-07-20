import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { LuCheck, LuUserPlus, LuUserMinus, LuSettings2, LuX, LuPlus, LuTrash2 } from 'react-icons/lu';
import {
  fetchChecklists,
  fetchTemplate,
  updateTemplate,
  toggleChecklistItem,
} from '../redux/slices/checklistSlice';

const TemplateEditorModal = ({ type, onClose }) => {
  const dispatch = useDispatch();
  const template = useSelector((state) =>
    type === 'onboarding' ? state.checklists.onboardingTemplate : state.checklists.offboardingTemplate
  );
  const [items, setItems] = useState(template);
  const [newItem, setNewItem] = useState('');

  const addItem = () => {
    if (!newItem.trim()) return;
    setItems([...items, newItem.trim()]);
    setNewItem('');
  };

  const removeItem = (idx) => setItems(items.filter((_, i) => i !== idx));

  const handleSave = async () => {
    if (items.length === 0) {
      toast.error('Add at least one checklist item');
      return;
    }
    try {
      await dispatch(updateTemplate({ type, items })).unwrap();
      toast.success('Default checklist updated — future employees will use this list');
      onClose();
    } catch (err) {
      toast.error(err || 'Failed to save');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="card w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-lg capitalize">Default {type} checklist</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <LuX size={20} />
          </button>
        </div>
        <p className="text-xs text-gray-400 mb-4">
          This is the checklist used automatically for {type === 'onboarding' ? 'every new hire' : 'every offboarding'}.
        </p>

        <div className="space-y-2 max-h-64 overflow-y-auto mb-4">
          {items.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800/60 rounded-lg px-3 py-2">
              <span className="text-sm flex-1">{item}</span>
              <button onClick={() => removeItem(idx)} className="text-gray-300 hover:text-rose-500 shrink-0">
                <LuTrash2 size={14} />
              </button>
            </div>
          ))}
        </div>

        <div className="flex gap-2 mb-4">
          <input
            className="input-field"
            placeholder="Add a new item…"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addItem();
              }
            }}
          />
          <button type="button" onClick={addItem} className="btn-secondary shrink-0 px-3">
            <LuPlus size={16} />
          </button>
        </div>

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button onClick={handleSave} className="btn-primary">
            Save Template
          </button>
        </div>
      </div>
    </div>
  );
};

const ChecklistCard = ({ checklist }) => {
  const dispatch = useDispatch();

  const handleToggle = async (itemId) => {
    try {
      await dispatch(toggleChecklistItem({ checklistId: checklist._id, itemId })).unwrap();
    } catch (err) {
      toast.error(err || 'Failed to update item');
    }
  };

  const doneCount = checklist.items.filter((i) => i.completed).length;
  const total = checklist.items.length;

  return (
    <div className="card p-5">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-medium text-sm">{checklist.employee?.name}</p>
          <p className="text-xs text-gray-400">{checklist.employee?.employeeId}</p>
        </div>
        <span
          className={`text-xs px-2 py-1 rounded-full font-medium ${
            checklist.status === 'completed'
              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
              : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
          }`}
        >
          {doneCount}/{total} done
        </span>
      </div>

      <div className="space-y-1.5">
        {checklist.items.map((item) => (
          <button
            key={item._id}
            onClick={() => handleToggle(item._id)}
            className="w-full flex items-center gap-2.5 text-left px-2 py-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/60"
          >
            <span
              className={`rounded border flex items-center justify-center shrink-0 ${
                item.completed
                  ? 'bg-primary-600 border-primary-600 text-white'
                  : 'border-gray-300 dark:border-gray-600'
              }`}
              style={{ width: 18, height: 18 }}
            >
              {item.completed && <LuCheck size={12} />}
            </span>
            <span className={`text-sm ${item.completed ? 'line-through text-gray-400' : ''}`}>{item.text}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

const Checklists = () => {
  const dispatch = useDispatch();
  const { list, isLoading } = useSelector((state) => state.checklists);
  const [tab, setTab] = useState('onboarding');
  const [editingTemplate, setEditingTemplate] = useState(null);

  useEffect(() => {
    dispatch(fetchChecklists({ type: tab }));
    dispatch(fetchTemplate(tab));
  }, [dispatch, tab]);

  const inProgress = list.filter((c) => c.status === 'in_progress');
  const completed = list.filter((c) => c.status === 'completed');

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">Onboarding & Offboarding</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Onboarding checklists are created automatically when you add a new employee. Start offboarding from the
            Employees page.
          </p>
        </div>
        <button onClick={() => setEditingTemplate(tab)} className="btn-secondary flex items-center gap-2 shrink-0">
          <LuSettings2 size={15} /> Edit default checklist
        </button>
      </div>

      <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1 w-fit">
        <button
          onClick={() => setTab('onboarding')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            tab === 'onboarding' ? 'bg-white dark:bg-gray-900 shadow-sm text-primary-600' : 'text-gray-500'
          }`}
        >
          <LuUserPlus size={15} /> Onboarding
        </button>
        <button
          onClick={() => setTab('offboarding')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            tab === 'offboarding' ? 'bg-white dark:bg-gray-900 shadow-sm text-primary-600' : 'text-gray-500'
          }`}
        >
          <LuUserMinus size={15} /> Offboarding
        </button>
      </div>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card p-5 h-48 skeleton" />
          ))}
        </div>
      ) : list.length === 0 ? (
        <div className="card p-10 text-center text-gray-400">No {tab} checklists yet.</div>
      ) : (
        <>
          {inProgress.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">
                In progress ({inProgress.length})
              </h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {inProgress.map((c) => (
                  <ChecklistCard key={c._id} checklist={c} />
                ))}
              </div>
            </div>
          )}
          {completed.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3 mt-6">
                Completed ({completed.length})
              </h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {completed.map((c) => (
                  <ChecklistCard key={c._id} checklist={c} />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {editingTemplate && <TemplateEditorModal type={editingTemplate} onClose={() => setEditingTemplate(null)} />}
    </div>
  );
};

export default Checklists;

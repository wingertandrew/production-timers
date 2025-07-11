
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface TimerEditModalProps {
  editMinutes: number;
  editSeconds: number;
  setEditMinutes: (minutes: number) => void;
  setEditSeconds: (seconds: number) => void;
  onSave: () => void;
  onCancel: () => void;
}

const TimerEditModal: React.FC<TimerEditModalProps> = ({
  editMinutes,
  editSeconds,
  setEditMinutes,
  setEditSeconds,
  onSave,
  onCancel
}) => {
  return (
    <div className="px-6 pb-4 border-t border-gray-600 pt-4">
      <div className="flex justify-center items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-white">Minutes:</label>
          <Input
            type="number"
            min="0"
            max="59"
            value={editMinutes}
            onChange={(e) => setEditMinutes(parseInt(e.target.value) || 0)}
            className="w-20 bg-gray-700 border-gray-500 text-white text-center"
          />
          <div className="flex flex-col ml-2 gap-1">
            <Button size="sm" className="h-6 px-2" onClick={() => setEditMinutes(Math.min(59, editMinutes + 1))}>+</Button>
            <Button size="sm" className="h-6 px-2" onClick={() => setEditMinutes(Math.max(0, editMinutes - 1))}>-</Button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-white">Seconds:</label>
          <Input
            type="number"
            min="0"
            max="59"
            value={editSeconds}
            onChange={(e) => setEditSeconds(parseInt(e.target.value) || 0)}
            className="w-20 bg-gray-700 border-gray-500 text-white text-center"
          />
          <div className="flex flex-col ml-2 gap-1">
            <Button size="sm" className="h-6 px-2" onClick={() => setEditSeconds(Math.min(59, editSeconds + 1))}>+</Button>
            <Button size="sm" className="h-6 px-2" onClick={() => setEditSeconds(Math.max(0, editSeconds - 1))}>-</Button>
          </div>
        </div>
        <Button
          onClick={onSave}
          className="bg-green-600 hover:bg-green-500 text-white"
        >
          Save
        </Button>
        <Button
          onClick={onCancel}
          className="bg-gray-600 hover:bg-gray-500 text-white"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default TimerEditModal;

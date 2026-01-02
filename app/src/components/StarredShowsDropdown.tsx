import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { ShowMetadata } from '@/types';

interface StarredShowsDropdownProps {
  starredShows: ShowMetadata[];
  onSelectShow: (show: ShowMetadata) => void;
  onRemoveStarred: (id: string) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
  className?: string;
}

interface SortableItemProps {
  show: ShowMetadata;
  onSelect: () => void;
  onRemove: () => void;
}

function SortableItem({ show, onSelect, onRemove }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useSortable({ id: show.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : undefined,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className="group flex items-center gap-2 px-3 py-2.5 hover:bg-white/10 bg-slate-800"
    >
      {/* Drag handle */}
      <button
        className="p-1 text-gray-500 hover:text-gray-300 cursor-grab active:cursor-grabbing touch-none"
        {...attributes}
        {...listeners}
        aria-label="Drag to reorder"
      >
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-4 h-4"
        >
          <path d="M8 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm8-12a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0z" />
        </svg>
      </button>

      {/* Show title - clickable to navigate */}
      <span
        onClick={onSelect}
        className="flex-1 text-gray-200 truncate cursor-pointer hover:text-white"
      >
        {show.title}
      </span>

      {/* Filled star - click to unstar */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="p-1 text-yellow-400 hover:text-yellow-300 transition-smooth"
        title="Remove from starred"
        aria-label={`Remove ${show.title} from starred`}
      >
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-4 h-4"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      </button>
    </li>
  );
}

export function StarredShowsDropdown({
  starredShows,
  onSelectShow,
  onRemoveStarred,
  onReorder,
  className = '',
}: StarredShowsDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = starredShows.findIndex((s) => s.id === active.id);
      const newIndex = starredShows.findIndex((s) => s.id === over.id);
      onReorder(oldIndex, newIndex);
    }
  };

  const handleSelectShow = (show: ShowMetadata) => {
    onSelectShow(show);
    setIsOpen(false);
  };

  return (
    <div
      className={`relative ${className}`}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button
        className="flex items-center justify-center gap-2 w-full px-3 py-1.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-sm font-medium transition-smooth hover:bg-white/20"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-3.5 h-3.5 text-yellow-400"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
        <span className="text-gray-300">Starred</span>
        {starredShows.length > 0 && (
          <span className="px-1.5 py-0.5 text-xs bg-yellow-400/20 text-yellow-400 rounded-full">
            {starredShows.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full pt-2 z-[100]">
          <div className="w-72 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden">
          {starredShows.length === 0 ? (
            <div className="px-4 py-6 text-center text-gray-500">
              No starred shows yet
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={starredShows.map((s) => s.id)}
                strategy={verticalListSortingStrategy}
              >
                <ul className="max-h-80 overflow-y-auto overflow-x-hidden py-1">
                  {starredShows.map((show) => (
                    <SortableItem
                      key={show.id}
                      show={show}
                      onSelect={() => handleSelectShow(show)}
                      onRemove={() => onRemoveStarred(show.id)}
                    />
                  ))}
                </ul>
              </SortableContext>
            </DndContext>
          )}
          </div>
        </div>
      )}
    </div>
  );
}

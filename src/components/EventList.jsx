import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import EventCard from './EventCard'

function EventList({ events, onUpdate, onDelete, onReorder }) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event) => {
    const { active, over } = event

    if (active.id !== over.id) {
      const oldIndex = events.findIndex(e => e.id === active.id)
      const newIndex = events.findIndex(e => e.id === over.id)
      onReorder(arrayMove(events, oldIndex, newIndex))
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-white">
          📋 事件列表 ({events.length})
        </h2>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={events.map(e => e.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3">
            {events.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onUpdate={onUpdate}
                onDelete={onDelete}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  )
}

export default EventList


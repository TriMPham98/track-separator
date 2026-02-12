"use client";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useStore } from "@/store";
import TrackLane from "./TrackLane";

export default function TrackList() {
  const tracks = useStore((s) => s.tracks);
  const reorderTracks = useStore((s) => s.reorderTracks);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const ids = tracks.map((t) => t.id);
    const oldIndex = ids.indexOf(active.id as string);
    const newIndex = ids.indexOf(over.id as string);

    const newIds = [...ids];
    newIds.splice(oldIndex, 1);
    newIds.splice(newIndex, 0, active.id as string);
    reorderTracks(newIds);
  };

  const sortedTracks = [...tracks].sort((a, b) => a.order - b.order);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={sortedTracks.map((t) => t.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex-1 overflow-y-auto">
          {sortedTracks.map((track) => (
            <TrackLane key={track.id} track={track} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

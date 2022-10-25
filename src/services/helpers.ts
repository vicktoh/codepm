import { Crop } from "react-image-crop";
import { Task, KanbanColumn, TaskStatus } from "../types/Project";

export const getCroppedImg = (image: HTMLImageElement, crop: Crop) => {
  const canvas = document.createElement("canvas");
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;
  canvas.width = crop.width;
  canvas.height = crop.height;
  const ctx = canvas.getContext("2d");

  ctx &&
    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height,
    );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        resolve(blob);
      },
      "image/jpeg",
      1,
    );
  });
};

export const toMB = (size: number) => {
  return (size / 1024).toFixed(2);
};

function dec2hex(dec: number) {
  return dec.toString(16).padStart(2, "0");
}

// generateId :: Integer -> String
export function generateId(len: number) {
  const arr = new Uint8Array((len || 40) / 2);
  window.crypto.getRandomValues(arr);
  return Array.from(arr, dec2hex).join("");
}
export function tasksToKanbanBoard(tasks: Task[]) {
  const notStartedColumn: KanbanColumn = {
    title: TaskStatus["not-started"],
    id: 2,
    cards: [],
  };
  const ongoingColumn: KanbanColumn = {
    title: TaskStatus["ongoing"],
    id: 3,
    cards: [],
  };
  const completedColumn: KanbanColumn = {
    title: TaskStatus["completed"],
    id: 4,
    cards: [],
  };
  const plannedColumn: KanbanColumn = {
    title: TaskStatus["planned"],
    id: 1,
    cards: [],
  };

  tasks.forEach((task) => {
    switch (task.status) {
      case TaskStatus.ongoing:
        ongoingColumn.cards.push(task);
        break;
      case TaskStatus.completed:
        completedColumn.cards.push(task);
        break;
      case TaskStatus["not-started"]:
        notStartedColumn.cards.push(task);
        break;
      case TaskStatus.planned:
        plannedColumn.cards.push(task);
        break;
    }
  });

  return {
    columns: [plannedColumn, notStartedColumn, ongoingColumn, completedColumn],
  };
}

export const STATUS_INDEX_MAP: TaskStatus[] = [
  TaskStatus.planned,
  TaskStatus["not-started"],
  TaskStatus.ongoing,
  TaskStatus.completed,
];

export const pdfRequisition = () => {
  console.log("holla");
};

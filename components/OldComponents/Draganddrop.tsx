/* eslint-disable @next/next/no-img-element */
/* eslint-disable jsx-a11y/alt-text */
import React, { useState, useCallback, useEffect } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import update from "immutability-helper";
import LargeImageModal from "../LargeImageModal";

const ItemType = {
  IMAGE: "image",
};

interface ImageProps {
  src: string;
  index: number;
  bookmarkIndex: number;
  moveImage: (
    dragIndex: number,
    hoverIndex: number,
    dragBookmarkIndex: number,
    hoverBookmarkIndex: number
  ) => void;
}

const Image: React.FC<ImageProps> = ({
  src,
  index,
  bookmarkIndex,
  moveImage,
}) => {
  const [{ isDragging }, drag] = useDrag({
    type: ItemType.IMAGE,
    item: { index, bookmarkIndex },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: ItemType.IMAGE,
    hover: (draggedItem: { index: number; bookmarkIndex: number }) => {
      if (
        draggedItem.index !== index ||
        draggedItem.bookmarkIndex !== bookmarkIndex
      ) {
        moveImage(
          draggedItem.index,
          index,
          draggedItem.bookmarkIndex,
          bookmarkIndex
        );
        draggedItem.index = index;
        draggedItem.bookmarkIndex = bookmarkIndex;
      }
    },
  });

  return (
    <img
      ref={(node) => drag(drop(node))}
      alt=""
      src={src}
      width="100"
      height="600"
      style={{ opacity: isDragging ? 0.5 : 1, cursor: "move" }}
    />
  );
};

interface FileData {
  bookmark: string;
  pdf: string[];
}

const DropTarget: React.FC<{
  children: React.ReactNode;
  index: number;
  moveImage: (
    dragIndex: number,
    hoverIndex: number,
    dragBookmarkIndex: number,
    hoverBookmarkIndex: number
  ) => void;
  bookmarkIndex: number;
}> = ({ children, index, moveImage, bookmarkIndex }) => {
  const [, drop] = useDrop({
    accept: ItemType.IMAGE,
    hover: (draggedItem: { index: number; bookmarkIndex: number }) => {
      if (draggedItem.bookmarkIndex !== bookmarkIndex) {
        moveImage(
          draggedItem.index,
          index,
          draggedItem.bookmarkIndex,
          bookmarkIndex
        );
        draggedItem.index = index;
        draggedItem.bookmarkIndex = bookmarkIndex;
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  return (
    <div
      ref={drop}
      className="flex items-center justify-start border border-white min-w-[95%] min-h-[100px] rounded-lg p-5 gap-4"
    >
      {children}
    </div>
  );
};

interface DragAndDropProps {
  fileData: FileData[];
  setFileData: any;
  onDataChange: (updatedData: FileData[]) => void;
}

const DragAndDrop: React.FC<DragAndDropProps> = ({
  fileData,
  setFileData,
  onDataChange,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalImageSrc, setModalImageSrc] = useState<string | null>(null);

  const moveImage = useCallback(
    (
      dragIndex: number,
      hoverIndex: number,
      dragBookmarkIndex: number,
      hoverBookmarkIndex: number
    ) => {
      const dragImage = fileData[dragBookmarkIndex].pdf[dragIndex];

      let updatedData = [...fileData];

      if (dragBookmarkIndex === hoverBookmarkIndex) {
        const currentList = updatedData[dragBookmarkIndex].pdf;
        updatedData[dragBookmarkIndex].pdf = update(currentList, {
          $splice: [
            [dragIndex, 1],
            [hoverIndex, 0, dragImage],
          ],
        });
      } else {
        updatedData[dragBookmarkIndex].pdf.splice(dragIndex, 1);
        updatedData[hoverBookmarkIndex].pdf.splice(hoverIndex, 0, dragImage);
      }

      updatedData = updatedData.map((item) => ({
        ...item,
        pdf: Array.from(
          new Set(item.pdf.filter((pdf) => pdf !== null && pdf !== undefined))
        ),
      }));

      setFileData(updatedData);
      onDataChange(updatedData);
    },
    [fileData, onDataChange]
  );

  const openImageModal = (src: string) => {
    setModalImageSrc(src);
    setModalOpen(true);
  };

  const closeImageModal = () => {
    setModalOpen(false);
    setModalImageSrc(null);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <td className="flex flex-col">
        {fileData.map((data, bookmarkIndex) => (
          <div
            className="flex px-6 py-4 gap-[15px] items-start justify-start"
            key={bookmarkIndex}
          >
            <p className="font-bold flex items-center justify-center min-w-[5%]">
              {data.bookmark + ":"}
            </p>
            <DropTarget
              index={bookmarkIndex}
              moveImage={moveImage}
              bookmarkIndex={bookmarkIndex}
            >
              {data.pdf.length === 0 ? (
                <p className="text-gray-500">Drop images here</p>
              ) : (
                data.pdf.map(
                  (src, index) =>
                    src && (
                      <div onClick={() => openImageModal(src)} key={src}>
                        <Image
                          src={src}
                          index={index}
                          bookmarkIndex={bookmarkIndex}
                          moveImage={moveImage}
                        />
                      </div>
                    )
                )
              )}
            </DropTarget>
          </div>
        ))}
      </td>

      {/* {modalImageSrc && (
        <LargeImageModal
          open={modalOpen}
          src={modalImageSrc}
          onClose={closeImageModal}
        />
      )} */}
    </DndProvider>
  );
};

export default DragAndDrop;

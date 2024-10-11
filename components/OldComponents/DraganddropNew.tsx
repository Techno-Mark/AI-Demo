/* eslint-disable @next/next/no-img-element */
import React, { useState, useCallback } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import LargeImageModal from "../LargeImageModal";

interface FileData {
  bookmark: string;
  pdf: string[];
}

interface DragAndDropProps {
  fileData: FileData[];
  setFileData: React.Dispatch<React.SetStateAction<FileData[]>>;
  onDataChange: (updatedData: FileData[]) => void;
}

const ItemTypes = {
  PDF: "pdf",
};

const PdfItem: React.FC<{
  pdfUrl: string;
  index: number;
  bookmarkIndex: number;
  movePdf: (
    bookmarkIndex: number,
    dragIndex: number,
    hoverIndex: number
  ) => void;
  onReset: () => void;
  openModal: () => void;
}> = ({ pdfUrl, index, bookmarkIndex, movePdf, onReset, openModal }) => {
  const [{ isDragging }, ref] = useDrag({
    type: ItemTypes.PDF,
    item: { index, bookmarkIndex },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: ItemTypes.PDF,
    hover: (item: { index: number; bookmarkIndex: number }) => {
      if (item.bookmarkIndex === bookmarkIndex && item.index !== index) {
        movePdf(bookmarkIndex, item.index, index);
        item.index = index;
      }
    },
  });

  return (
    <img
      ref={(node) => ref(drop(node))}
      src={pdfUrl}
      alt={`Page ${index + 1}`}
      style={{
        width: "100px",
        height: "150px",
        margin: "5px",
        cursor: "move",
        opacity: isDragging ? 0.5 : 1,
      }}
      onDragEnd={onReset}
      onClick={openModal}
    />
  );
};

const DraganddropNew: React.FC<DragAndDropProps> = ({
  fileData,
  setFileData,
  onDataChange,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalImageSrc, setModalImageSrc] = useState<string | null>(null);
  const [selectedPdf, setSelectedPdf] = useState<{
    bookmarkIndex: number;
    pdfIndex: number;
  } | null>(null);

  const movePdf = useCallback(
    (bookmarkIndex: number, dragIndex: number, hoverIndex: number) => {
      const updatedFileData = [...fileData];
      const pdfs = updatedFileData[bookmarkIndex].pdf;
      const [draggedPdf] = pdfs.splice(dragIndex, 1);
      pdfs.splice(hoverIndex, 0, draggedPdf);

      setFileData(updatedFileData);
      onDataChange(updatedFileData);
    },
    [fileData, setFileData, onDataChange]
  );

  const resetPosition = useCallback(
    (bookmarkIndex: number) => {
      setFileData([...fileData]);
    },
    [fileData, setFileData]
  );

  const BoundaryDropZone: React.FC = () => {
    const [, drop] = useDrop({
      accept: ItemTypes.PDF,
      drop: () => ({ name: "BoundaryDropZone" }),
      collect: (monitor) => ({
        isOver: monitor.isOver(),
      }),
    });

    return <div ref={drop} style={{ width: "100%", height: "100%" }} />;
  };

  const openImageModal = (
    bookmarkIndex: number,
    pdfIndex: number,
    src: string
  ) => {
    setSelectedPdf({ bookmarkIndex, pdfIndex });
    setModalImageSrc(src);
    setModalOpen(true);
  };

  const closeImageModal = () => {
    setModalOpen(false);
    setModalImageSrc(null);
    setSelectedPdf(null);
  };

  const handleMove = (selectedBookmark: string) => {
    if (selectedPdf) {
      const { bookmarkIndex, pdfIndex } = selectedPdf;
      const updatedFileData = [...fileData];
      const [movedPdf] = updatedFileData[bookmarkIndex].pdf.splice(pdfIndex, 1);
      const targetBookmarkIndex = updatedFileData.findIndex(
        (file) => file.bookmark === selectedBookmark
      );
      if (targetBookmarkIndex !== -1) {
        updatedFileData[targetBookmarkIndex].pdf.push(movedPdf);
      }
      setFileData(updatedFileData);
      onDataChange(updatedFileData);
    }
  };
  const handleDelete = () => {
    if (selectedPdf) {
      const { bookmarkIndex, pdfIndex } = selectedPdf;
      const updatedFileData = [...fileData];
      updatedFileData[bookmarkIndex].pdf.splice(pdfIndex, 1);
      setFileData(updatedFileData);
      onDataChange(updatedFileData);
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <BoundaryDropZone />
      <div className="flex flex-col">
        {fileData.map((file, bookmarkIndex) => (
          <div
            className="flex px-6 py-4 gap-[15px] items-start justify-start"
            key={bookmarkIndex}
          >
            <p className="font-bold flex items-center justify-center min-w-[10%] max-w-[10%]">
              {file.bookmark + ":"}
            </p>
            {file.pdf?.length > 0 && (
              <div className="min-w-[90%] max-w-[90%] flex flex-row items-center justify-start p-2 gap-2 border rounded-lg flex-wrap">
                {file.pdf.map((pdfUrl, pdfIndex) => (
                  <PdfItem
                    key={pdfIndex}
                    pdfUrl={"https://pythonapi.pacificabs.com:5000/" + pdfUrl}
                    index={pdfIndex}
                    bookmarkIndex={bookmarkIndex}
                    movePdf={movePdf}
                    onReset={() => resetPosition(bookmarkIndex)}
                    openModal={() =>
                      openImageModal(bookmarkIndex, pdfIndex, pdfUrl)
                    }
                  />
                ))}
              </div>
            )}
            {file.pdf.length <= 0 && <div>No PDFs available</div>}
          </div>
        ))}
      </div>

      {/* {modalImageSrc && (
        <LargeImageModal
          open={modalOpen}
          src={modalImageSrc}
          onClose={closeImageModal}
          bookmarks={fileData.map((file) => file.bookmark)}
          onMove={handleMove}
          onDelete={handleDelete}
        />
      )} */}
    </DndProvider>
  );
};

export default DraganddropNew;

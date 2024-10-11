/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
import React, { useState } from "react";
import LargeImageModal from "./LargeImageModal";

interface FileData {
  bookmark: string;
  pdf: string[];
}

interface DisplayImagesProps {
  fileData: FileData[];
  download: boolean;
}

interface ImageProps {
  src: string;
  download: boolean;
}

const Image: React.FC<ImageProps> = ({ src, download }) => {
  return (
    <img
      alt=""
      src={
        `${
          download
            ? "https://pythonapi.pacificabs.com:5000/"
            : "https://pythonapi.pacificabs.com:5001/"
        }` + src
      }
      width="100"
      height="600"
      style={{ opacity: 1, cursor: "pointer" }}
    />
  );
};

const DropTarget: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const containerStyle: React.CSSProperties = {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
    cursor: "pointer",
  };

  return (
    <div className="flex items-center justify-start border border-white min-w-[95%] min-h-[100px] rounded-lg p-5 gap-4">
      <div style={containerStyle}>{children}</div>
    </div>
  );
};

const DisplayImages: React.FC<DisplayImagesProps> = ({
  fileData,
  download,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalImageSrc, setModalImageSrc] = useState<string | null>(null);

  const openImageModal = (src: string) => {
    setModalImageSrc(src);
    setModalOpen(true);
  };

  const closeImageModal = () => {
    setModalOpen(false);
    setModalImageSrc(null);
  };

  return (
    <>
      <td className="flex flex-col">
        {fileData.map((data, bookmarkIndex) => (
          <div
            className="flex px-6 py-4 gap-[15px] items-start justify-start"
            key={bookmarkIndex}
          >
            <p className="font-bold flex items-center justify-center min-w-[5%]">
              {data.bookmark + ":"}
            </p>
            <DropTarget>
              {data.pdf.length === 0 ? (
                <p className="text-gray-500">No Data found</p>
              ) : (
                data.pdf.map(
                  (src, index) =>
                    src && (
                      <div onClick={() => openImageModal(src)} key={src}>
                        <Image src={src} download={download} />
                      </div>
                    )
                )
              )}
            </DropTarget>
          </div>
        ))}
      </td>

      {modalImageSrc && (
        <LargeImageModal
          open={modalOpen}
          src={modalImageSrc}
          onClose={closeImageModal}
          download={download}
        />
      )}
    </>
  );
};

export default DisplayImages;

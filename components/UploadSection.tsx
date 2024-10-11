// UploadSection.tsx
import React from "react";

interface UploadSectionProps {
  fileUploaded: boolean;
  fileError: boolean;
  fileErrMsg: string;
  disabled: boolean;
  uploadBtn: boolean;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleUpload: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

const UploadSection: React.FC<UploadSectionProps> = ({
  fileUploaded,
  fileError,
  fileErrMsg,
  disabled,
  uploadBtn,
  handleChange,
  handleUpload,
}) => {
  return (
    <section className="automationSection px-5 py-9">
      <div className="container mx-auto px-20">
        <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr className="text-center">
                <th scope="col" className="px-6 py-3 text-start">
                  Indexing & Bookmarking
                </th>
                <th scope="col" className="px-6 py-3">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 text-center">
                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white text-start">
                  <input
                    className="w-full text-sm text-gray-900 border border-gray-300 cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
                    aria-describedby="file_input_help"
                    id="file_input"
                    type="file"
                    onChange={handleChange}
                  />
                  {fileError && (
                    <p
                      className="mt-1 text-sm text-red-500 dark:text-red-300"
                      id="file_input_help"
                    >
                      {fileErrMsg}
                    </p>
                  )}
                  {!fileError && (
                    <p
                      className="mt-1 text-sm text-gray-500 dark:text-gray-300"
                      id="file_input_help"
                    >
                      Upload your .zip file here.
                    </p>
                  )}
                </td>
                <td className="flex px-6 py-4 gap-[15px] justify-center">
                  <button
                    className={`flex gap-[15px] bg-[#1492c8] text-white text-sm font-semibold px-4 py-2 rounded-md ${
                      disabled || fileError || !uploadBtn
                        ? "cursor-not-allowed opacity-50"
                        : ""
                    }`}
                    onClick={
                      disabled || !uploadBtn || fileError
                        ? undefined
                        : handleUpload
                    }
                  >
                    Upload
                    {disabled ? <span>Loading...</span> : ""}
                  </button>
                  {/* <button
                    className={`flex gap-[15px] bg-[#259916] text-white text-sm font-semibold px-4 py-2 rounded-md ${
                      !fileUploaded ? "cursor-not-allowed opacity-50" : ""
                    }`}
                    onClick={!fileUploaded ? undefined : handleUpload}
                  >
                    Preview
                  </button> */}
                </td>
              </tr>
              <tr>
                <td colSpan={2} className="bg-white py-3 px-5">
                  <p>
                    <strong>Important Notes:</strong>
                  </p>
                  <ol className="list-decimal ps-4 pt-2">
                    <li className="pb-1">
                      To utilize the Indexing and Bookmarking Tool, users must
                      upload a single .zip folder.
                    </li>
                    <li className="pb-1">
                      The .zip folder should consistently contain subfolders
                      with the following names: 1040, Organizer, Emails, and
                      Standard Documents.
                    </li>
                    <li className="pb-1">
                      Note that the page sequence for 1040, Organizer, and
                      Emails will not function linearly; it will follow the
                      order of 1040, Organizer, and Emails.
                    </li>
                    <li className="pb-1">
                      This specific sequence, however, applies only to standard
                      documents.
                    </li>
                    <li className="pb-1">
                      In the case of standard documents, if two forms are
                      identified under a single page, they will be bookmarked as
                      &quot;Brokerage&quot;.
                    </li>
                    <li className="pb-1">
                      If the form name cannot be identified, it will be
                      categorized under the bookmark name as &quot;Other.&quot;{" "}
                    </li>
                    <li className="pb-1">
                      Indexing and Bookmarking Tool exclusively works with PDF
                      files and does not support other file formats such as
                      Images, Word, Excel, PowerPoint, etc...
                    </li>
                    <li className="pb-1">
                      Before proceeding with further processing, it is essential
                      for the user to re-validate the indexing and bookmarking
                      file generated by the system.
                    </li>
                  </ol>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default UploadSection;

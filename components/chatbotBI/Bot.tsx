import React, { useState } from "react";
import { toast, ToastContainer, ToastOptions } from "react-toastify";
import FinanceChart from "./FinanceChart";
import "react-toastify/dist/ReactToastify.css";
import DynamicTable from "./DynamicTable";

const toastOptions: ToastOptions = {
  position: "top-right",
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
  theme: "light",
};

const data = {
  prompt: "user_prompt",
  response: "sql_query",
  is_table: true,
  is_graph: true,
  count: 2,
  data: [
    {
      Month: 1,
      TotalAmount: 324555378.98,
    },
    {
      Month: 3,
      TotalAmount: 641455378.98,
    },
  ],
  database_status: "Data retrieved successfully",
};

const Bot = () => {
  const [disabled, setDisabled] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDisabled(true);
    setResponse(null);

    try {
      const res = await fetch(
        `http://127.0.0.1:5001/chatbot`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ prompt: prompt.trim() }),
        }
      );

      if (!res.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await res.json();
      setResponse(data);
      setDisabled(false);
    } catch (error) {
      setResponse(null);
      setPrompt("");
      setDisabled(false);
    } finally {
      setDisabled(false);
    }
  };

  return (
    <section className="automationSection px-5 py-9">
      <div className="container mx-auto px-20">
        <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
          <ToastContainer
            position="top-center"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr className="text-center">
                <th scope="col" className="px-6 py-3 text-start">
                  Copilot
                </th>
                <th scope="col" className="px-6 py-3">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 text-center">
                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white text-start">
                  <textarea
                    className="w-full f-16 py-2 px-4 rounded-lg text-sm text-gray-900 border border-gray-300 bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
                    placeholder="Type your prompt here..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                  />
                </td>
                <td className="flex px-6 py-4 gap-[15px] justify-center">
                  <button
                    className={`flex gap-[15px] bg-[#1492c8] text-white text-sm font-semibold px-4 py-2 rounded-md ${
                      disabled ? "cursor-not-allowed opacity-50" : ""
                    }`}
                    onClick={disabled ? undefined : handleSubmit}
                  >
                    {disabled ? "Loading..." : "Get Answer"}
                  </button>
                </td>
              </tr>

              {!!response &&
                !!response.data &&
                response.data.length > 0 &&
                response.is_graph && (
                  <tr>
                    <td colSpan={2} className="bg-white py-3 px-5">
                      <div className="bg-gray-100 border border-gray-200 rounded-lg p-4">
                        <p className="text-base font-semibold text-gray-700 mb-4">
                          <strong>Result:</strong>
                        </p>
                        <div className="grid grid-cols-2 gap-10">
                          <div className="chart-container">
                            <FinanceChart
                              data={response.data}
                              chartType="line"
                            />
                          </div>
                          <div className="chart-container">
                            <FinanceChart
                              data={response.data}
                              chartType="area"
                            />
                          </div>
                          <div className="chart-container">
                            <FinanceChart
                              data={response.data}
                              chartType="column"
                            />
                          </div>
                          <div className="chart-container">
                            <FinanceChart
                              data={response.data}
                              chartType="bar"
                            />
                          </div>
                          <div className="chart-container">
                            <FinanceChart
                              data={response.data}
                              chartType="pie"
                            />
                          </div>
                          <div className="chart-container">
                            <FinanceChart
                              data={response.data}
                              chartType="scatter"
                            />
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              {!!response &&
                !!response.data &&
                response.data.length > 0 &&
                response.is_table && (
                  <tr>
                    <td colSpan={2} className="bg-white py-3 px-5">
                      <div className="bg-gray-100 border border-gray-200 rounded-lg p-4">
                        <p className="text-base font-semibold text-gray-700 mb-4">
                          <strong>Result:</strong>
                        </p>
                        <DynamicTable data={response.data} />
                      </div>
                    </td>
                  </tr>
                )}
              {!!response &&
              !!response.data &&
              !response.is_table &&
              !response.is_graph &&
              Array.isArray(response.data) &&
              response.data.length > 0 ? (
                <tr>
                  <td colSpan={2} className="bg-white py-3 px-5">
                    <div className="bg-gray-100 border border-gray-200 rounded-lg p-4">
                      <p className="text-base font-semibold text-gray-700">
                        <strong>Result:</strong>
                      </p>
                      <pre>Total count is {response.count}</pre>
                      <pre className="mt-2">
                        Data = [
                        {response.data.map((item: any, index: number) => (
                          <div key={index}>
                            {JSON.stringify(item, null, 2)}
                            {index < response.data.length - 1 ? "," : ""}
                          </div>
                        ))}
                        ]
                      </pre>
                    </div>
                  </td>
                </tr>
              ) : !!response ? (
                <tr>
                  <td colSpan={2} className="bg-white py-3 px-5">
                    {!!response.response ? response.response : "No data found."}
                  </td>
                </tr>
              ) : (
                ""
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default Bot;

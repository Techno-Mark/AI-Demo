import React from "react";

const DynamicTable = ({ data }: any) => {
  const rearrangeKeys = (entry: any) => {
    if (entry.Day !== undefined && entry.DailyAmount !== undefined) {
      return {
        Day: entry.Day,
        DailyAmount: entry.DailyAmount,
      };
    }
    return entry;
  };

  const headers = Object.keys(rearrangeKeys(data[0]));

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse table-auto">
        <thead>
          <tr>
            {headers.map((header) => (
              <th
                key={header}
                className="px-4 py-2 bg-gray-100 text-left border-b border-gray-300 text-gray-600"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((entry: any, index: number) => {
            const rearrangedEntry = rearrangeKeys(entry);
            return (
              <tr key={index}>
                {headers.map((header) => (
                  <td
                    key={header}
                    className="px-4 py-2 border-b border-gray-300 text-left"
                  >
                    {rearrangedEntry[header]}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default DynamicTable;

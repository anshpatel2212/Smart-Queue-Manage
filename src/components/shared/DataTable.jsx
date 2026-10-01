import React from 'react';

const DataTable = ({ columns, data, emptyMessage = "No data available" }) => {
  return (
    <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-[#E5E9E7]">
      <table className="min-w-full divide-y divide-[#E5E9E7]">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((col, i) => (
              <th 
                key={i} 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-[#E5E9E7]">
          {data && data.length > 0 ? (
            data.map((row, i) => (
              <tr key={i} className="hover:bg-gray-50 transition-colors">
                {columns.map((col, j) => (
                  <td key={j} className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="px-6 py-8 text-center text-sm text-gray-500">
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;

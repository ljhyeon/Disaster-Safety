import React, { useState } from 'react';
import RequestCard from './RequestCard';
import { Pagination } from 'antd';

export const RequestCardList = ({ data, pageSize = 6 }) => {
    const [currentPage, setCurrentPage] = useState(1);

    const startIdx = (currentPage - 1) * pageSize;
    const endIdx = startIdx + pageSize;
    const currentData = data.slice(startIdx, endIdx);

    return (
        <div style={{ width: '100%' }}>
            {currentData.map((item, idx) => (
                <RequestCard key={item.id || idx} data={item} />
            ))}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
                <Pagination
                    current={currentPage}
                    pageSize={pageSize}
                    total={data.length}
                    onChange={setCurrentPage}
                    showSizeChanger={false}
                />
            </div>
        </div>
    );
};

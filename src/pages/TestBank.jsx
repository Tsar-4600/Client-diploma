import React, { useState } from 'react';
import TestsBankList from '../components/TestsBankList/TestsBankList';
import MyTestList from '../components/MyTestList/MyTestList';

const TestBank = () => {
    const [refreshKey, setRefreshKey] = useState(0);

    const handleRefresh = () => {
        setRefreshKey(prev => prev + 1); // Увеличиваем ключ для принудительного обновления
    };

    return (
        <div className="TestBank">
          <h1>Банк тестов</h1>
            <TestsBankList refreshKey={refreshKey} />
            <MyTestList onActionComplete={handleRefresh} />
        </div>
    );
};

export default TestBank;
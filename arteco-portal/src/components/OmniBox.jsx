import React, { useState } from 'react';
import { Input, Spin } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { classifyIntent } from '../services/mockAI';

const OmniBox = ({ onResult }) => {
  const [loading, setLoading] = useState(false);

  const handleSearch = async (value) => {
    if (!value.trim()) return;

    setLoading(true);
    // Clear previous results in parent
    if (onResult) onResult(null);

    try {
      const intent = await classifyIntent(value);
      if (onResult) onResult(intent);
    } catch (error) {
      console.error("Error classifying intent:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center', width: '100%' }}>
      <Input.Search
        placeholder="How can I help you today? (e.g., 'report damage', 'ship artwork')"
        enterButton="Ask"
        size="large"
        onSearch={handleSearch}
        loading={loading}
        prefix={<SearchOutlined />}
        allowClear
      />
    </div>
  );
};

export default OmniBox;

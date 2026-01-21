import React, { useState, useEffect } from 'react';
import { Table, Tag, Button, Modal, Card, Typography, ConfigProvider, DatePicker, Input, Select, Row, Col, Descriptions } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import { ShieldCheck, Download, Search, RefreshCw } from 'lucide-react';
import dayjs from 'dayjs';
import API_URL from './api';

const { Title } = Typography;
const { RangePicker } = DatePicker;

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [filters, setFilters] = useState({
    dateRange: null,
    performedBy: '',
    entityName: null
  });

  const fetchLogs = async (currentFilters = filters) => {
    setLoading(true);
    const token = localStorage.getItem('token');
    
    const params = new URLSearchParams();
    if (currentFilters.dateRange) {
      params.append('dateFrom', currentFilters.dateRange[0].toISOString());
      params.append('dateTo', currentFilters.dateRange[1].endOf('day').toISOString());
    }
    if (currentFilters.performedBy) params.append('performedBy', currentFilters.performedBy);
    if (currentFilters.entityName) params.append('entityName', currentFilters.entityName);

    try {
      const response = await fetch(`${API_URL}/api/auditlogs?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setLogs(data);
      }
    } catch (error) {
      console.error('Failed to fetch audit logs', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleReset = () => {
    const emptyFilters = { dateRange: null, performedBy: '', entityName: null };
    setFilters(emptyFilters);
    fetchLogs(emptyFilters);
  };

  const handleViewDetails = (record) => {
    setSelectedLog(record);
    setIsModalOpen(true);
  };

  const columns = [
    {
      title: 'Date/Time',
      dataIndex: 'changeTimestamp',
      key: 'changeTimestamp',
      render: (text) => dayjs(text).format('DD/MM/YYYY HH:mm:ss'),
      width: 180,
    },
    {
      title: 'Action',
      dataIndex: 'actionType',
      key: 'actionType',
      width: 100,
      render: (type) => {
        let color = 'blue';
        if (type === 'INSERT') color = 'green';
        if (type === 'DELETE') color = 'red';
        return <Tag color={color}>{type}</Tag>;
      }
    },
    {
      title: 'Entity',
      dataIndex: 'tableName',
      key: 'tableName',
      width: 150,
    },
    {
      title: 'Record ID',
      dataIndex: 'recordId',
      key: 'recordId',
      width: 100,
    },
    {
      title: 'Performed By',
      dataIndex: 'performedBy',
      key: 'performedBy',
      width: 150,
    },
    {
      title: 'Details',
      key: 'details',
      render: (_, record) => (
        <Button icon={<EyeOutlined />} size="small" onClick={() => handleViewDetails(record)}>
          View Changes
        </Button>
      ),
    },
  ];

  const renderJson = (jsonString) => {
    if (!jsonString) return <span style={{ color: '#999' }}>N/A</span>;
    try {
      const obj = JSON.parse(jsonString);
      return (
        <pre style={{ backgroundColor: '#f5f5f5', padding: '10px', borderRadius: '4px', overflow: 'auto', maxHeight: '300px', fontSize: '0.85rem', whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
          {JSON.stringify(obj, null, 2)}
        </pre>
      );
    } catch (e) {
      return jsonString;
    }
  };

  const handleExportCSV = () => {
    if (!logs || logs.length === 0) return;

    const headers = ['Log ID', 'Date/Time', 'Action', 'Entity', 'Record ID', 'Performed By', 'Old Value', 'New Value'];
    
    const csvRows = [
      headers.join(','),
      ...logs.map(log => {
        const row = [
          log.logId,
          dayjs(log.changeTimestamp).format('DD/MM/YYYY HH:mm:ss'),
          log.actionType,
          log.tableName,
          log.recordId,
          `"${(log.performedBy || '').replace(/"/g, '""')}"`,
          `"${(log.oldValue || '').replace(/"/g, '""')}"`,
          `"${(log.newValue || '').replace(/"/g, '""')}"`
        ];
        return row.join(',');
      })
    ];

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'audit_logs.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#246A73',
        },
      }}
    >
      <div style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <Title level={2} style={{ color: '#1e293b', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShieldCheck size={28} /> System Audit Logs
          </Title>
          <Button 
            icon={<Download size={16} />} 
            onClick={handleExportCSV}
            disabled={!logs.length}
          >
            Export CSV
          </Button>
        </div>

        <Card style={{ marginBottom: '20px' }}>
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={12} md={6}>
              <RangePicker 
                style={{ width: '100%' }} 
                onChange={(dates) => setFilters(prev => ({ ...prev, dateRange: dates }))}
                value={filters.dateRange}
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Input 
                placeholder="Performed By (Username)" 
                prefix={<Search size={16} color="#bfbfbf" />}
                value={filters.performedBy}
                onChange={(e) => setFilters(prev => ({ ...prev, performedBy: e.target.value }))}
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Select
                style={{ width: '100%' }}
                placeholder="Filter by Entity"
                allowClear
                value={filters.entityName}
                onChange={(val) => setFilters(prev => ({ ...prev, entityName: val }))}
              >
                <Select.Option value="Artworks">Artworks</Select.Option>
                <Select.Option value="Artists">Artists</Select.Option>
                <Select.Option value="Collections">Collections</Select.Option>
                <Select.Option value="UserProfiles">User Profiles</Select.Option>
                <Select.Option value="Appraisals">Appraisals</Select.Option>
              </Select>
            </Col>
            <Col xs={24} sm={12} md={6} style={{ display: 'flex', gap: '10px' }}>
              <Button type="primary" icon={<Search size={16} />} onClick={() => fetchLogs()} block>
                Search
              </Button>
              <Button icon={<RefreshCw size={16} />} onClick={handleReset}>
                Reset
              </Button>
            </Col>
          </Row>
        </Card>

        <Table
          columns={columns}
          dataSource={logs}
          rowKey="logId"
          loading={loading}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 800 }}
        />

        <Modal
          title={`Log Details #${selectedLog?.logId || ''}`}
          open={isModalOpen}
          onCancel={() => setIsModalOpen(false)}
          footer={[
            <Button key="close" onClick={() => setIsModalOpen(false)}>Close</Button>
          ]}
          width={800}
        >
          {selectedLog && (
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="Timestamp">{dayjs(selectedLog.changeTimestamp).format('DD/MM/YYYY HH:mm:ss')}</Descriptions.Item>
              <Descriptions.Item label="Action"><Tag>{selectedLog.actionType}</Tag></Descriptions.Item>
              <Descriptions.Item label="Entity">{selectedLog.tableName}</Descriptions.Item>
              <Descriptions.Item label="Record ID">{selectedLog.recordId}</Descriptions.Item>
              <Descriptions.Item label="Performed By">{selectedLog.performedBy}</Descriptions.Item>
              <Descriptions.Item label="Old Value">
                {renderJson(selectedLog.oldValue)}
              </Descriptions.Item>
              <Descriptions.Item label="New Value">
                {renderJson(selectedLog.newValue)}
              </Descriptions.Item>
            </Descriptions>
          )}
        </Modal>
      </div>
    </ConfigProvider>
  );
};

export default AuditLogs;
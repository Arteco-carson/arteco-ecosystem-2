import React, { useState, useEffect } from 'react';
import { Table, Tag, Button, Modal, Card, Typography, ConfigProvider, DatePicker, Input, Select, Row, Col } from 'antd';
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
          `"${(log.performedBy || '').replace(/
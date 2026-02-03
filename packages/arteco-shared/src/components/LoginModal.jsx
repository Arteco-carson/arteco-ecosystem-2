import React, { useState } from 'react';
import { Modal, Form, Input, Button, message, Typography } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const { Text } = Typography;

export const LoginModal = ({ open, onClose }) => {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

  const onFinish = async (values) => {
    setLoading(true);

    try {
      const response = await axios.post(
        '/api/auth/login',
        values
      );

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        messageApi.success('Welcome back!');
        login(response.data.token);
        onClose();
      } else {
        messageApi.error('Login failed: No token received.');
      }
    } catch (error) {
      console.error('Login error:', error);
      messageApi.error('Login Failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {contextHolder}
      <Modal
        open={open}
        title="Sign In to Arteco"
        onCancel={onClose}
        footer={null}
        destroyOnClose
        centered
        width={400}
      >
        <Form
          form={form}
          name="login_modal"
          layout="vertical"
          onFinish={onFinish}
          style={{ marginTop: 20 }}
        >
          {/* We can leave validation on to make it feel real, or remove 'required' to be lazy */}
          <Form.Item
            name="username"
            rules={[{ required: true, message: 'Please enter your username' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Enter your username (e.g. Irishspurs)" size="large" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please enter your password' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Password" size="large" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block size="large" loading={loading}>
              Sign In
            </Button>
          </Form.Item>
          
          <div style={{ textAlign: 'center' }}>
             <Text type="secondary" style={{ fontSize: '12px' }}>
                Secure Login
             </Text>
          </div>
        </Form>
      </Modal>
    </>
  );
};
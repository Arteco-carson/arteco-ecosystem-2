import React, { useState } from 'react';
import { Modal, Form, Input, Button, message, Typography } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
// import api from '../services/api'; // Not needed for dummy mode

const { Text } = Typography;

export const LoginModal = ({ open, onClose }) => {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

  const onFinish = async (values) => {
    setLoading(true);

    // --- DUMMY LOGIN LOGIC (Start) ---
    // We simulate a network delay of 1 second, then let you in.
    setTimeout(() => {
      messageApi.success('Welcome back! (Prototype Mode)');
      
      // We set a fake token so the app thinks you are logged in
      login('dummy-prototype-token-12345'); 
      
      setLoading(false);
      onClose();
    }, 1000);
    // --- DUMMY LOGIN LOGIC (End) ---

    /* // REAL BACKEND LOGIC (Keep this for later)
    try {
      const response = await api.post('/Auth/login', values);
      if (response.data.token) {
        messageApi.success('Welcome back!');
        login(response.data.token);
        onClose();
      }
    } catch (error) {
      console.error('Login error:', error);
      messageApi.error('Login Failed.');
      setLoading(false);
    }
    */
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
            <Input prefix={<UserOutlined />} placeholder="Username (Any)" size="large" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please enter your password' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Password (Any)" size="large" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block size="large" loading={loading}>
              Sign In (Prototype)
            </Button>
          </Form.Item>
          
          <div style={{ textAlign: 'center' }}>
             <Text type="secondary" style={{ fontSize: '12px' }}>
                Prototype Build v0.1
             </Text>
          </div>
        </Form>
      </Modal>
    </>
  );
};
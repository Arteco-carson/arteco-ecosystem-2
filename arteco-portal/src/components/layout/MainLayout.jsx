import React from 'react';
import { ArtecoShell } from '@arteco/shared';
import Logo from '../../assets/White ARTECO logo.png';

const MainLayout = (props) => {
  return <ArtecoShell title="Arteco Portal" logoSrc={Logo} {...props} />;
};
export default MainLayout;
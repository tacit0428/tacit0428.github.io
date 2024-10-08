import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid'
import Sidebar from '../../components/Sidebar/Sidebar';
import Mindmap from '../../components/Mindmap/Mindmap';
import HeaderBar from '../../components/Header/Header'; 
import ConfigWindow from '../../components/ConfigWindow';
import { Layout } from 'antd';
import { useStore } from '../../store/store';
import { ReactFlowProvider } from 'reactflow';
import './index.css';

const { Header, Content } = Layout;

function HomePage() {
  const store = useStore()
  const [visible, setVisible] = useState(false);

  const toggleDrawer = () => {
    setVisible(!visible);
  };

  return (
    <ReactFlowProvider>
      <Layout style={{height:"100vh"}}>
          <Header style={{ backgroundColor: '#fff', boxShadow: '0px 3px 10px 0px rgba(201, 201, 201, 0.5)', zIndex: 100}}>
            <HeaderBar/>
          </Header>
          <Content style={{display: 'flex', flexDirection: 'row', backgroundColor: '#fff'}}>
            <Sidebar visible={visible} toggleDrawer={toggleDrawer} />
            <Mindmap visible={visible} />
            {store.showConfig && <ConfigWindow />}
          </Content>
      </Layout>
    </ReactFlowProvider>
  )
}

export default HomePage;

import { Button, Layout, theme } from 'antd'
import {MenuUnfoldOutlined, MenuFoldOutlined} from "@ant-design/icons"
import Logo from './componentes/Logo';
import MenuList from './componentes/MenuList';
import { useState } from 'react';

const {Header, Sider} = Layout;
function MenuLateral() {
  const[collapsed, setCollapsed] = useState(false)

  const{
    token: {colorBgContainer},
  } = theme.useToken();

  return (
    <>
      <Layout>
        <Sider 
          collapsed={collapsed} 
          collapsible
          trigger={null}
        >
          <Logo />
          <MenuList />
        </Sider>
        <Layout>
          <Header style={{padding: 0, background: colorBgContainer}}>
            <Button 
            type="text" 
            className="toggle"
            onClick={()=> setCollapsed(!collapsed)}
            icon={collapsed ?
            <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          />
          </Header>
        </Layout>
      </Layout>
    </>
  )
}

export default MenuLateral;
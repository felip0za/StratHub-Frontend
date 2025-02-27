import { Menu } from "antd"
import { HomeOutlined, SettingOutlined, DesktopOutlined } from "@ant-design/icons";

const MenuList = ({ darkTheme }) =>{
    return(
        <Menu theme={darkTheme? "dark" : "light"} mode="inline" className="menu-bar">
            <Menu.Item key="home" icon={<HomeOutlined />}>
                Dashboard
            </Menu.Item>
            <Menu.Item key="(mudar depois1)" icon={<HomeOutlined />}>
                (mudar depois)
            </Menu.Item>
            <Menu.Item key="(mudar depois2)" icon={<HomeOutlined />}>
                (mudar depois)
            </Menu.Item>
            <Menu.Item key="(mudar depois3)" icon={<HomeOutlined />}>
                (mudar depois)
            </Menu.Item>
            
            <h1>-----------------------------------------------------</h1>

            <Menu.Item key="Minha Conta" icon={<SettingOutlined />}>
                Minha Conta
            </Menu.Item>
            <Menu.Item key="Suporte" icon={<DesktopOutlined />}>
                Suporte
            </Menu.Item>

            <h1>-----------------------------------------------------</h1>


        </Menu>
    )
}
export default MenuList
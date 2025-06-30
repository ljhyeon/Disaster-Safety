import { Layout, Button } from "antd";

const Login = () => {
    return (
        <Layout style={{ minHeight: '100vh', width: '100vw' }}>
            Login 페이지
            <Button type="primary">Primary Button</Button>
            <Button>Default Button</Button>
            <Button type="dashed">Dashed Button</Button>
            <Button type="text">Text Button</Button>
            <Button type="link">Link Button</Button>
        </Layout>
    )
}

export default Login;
import React from 'react';
import { 
  createBrowserRouter, 
  RouterProvider,
  Outlet,
  useNavigate,
  Navigate
} from 'react-router-dom';
import { Box, Container, Typography } from '@mui/material';
import ChannelInput from './components/channel/ChannelInput';
import ChannelAnalysis from './components/channel/ChannelAnalysis';
import './App.css';

// 메인 레이아웃 컴포넌트
const Layout = () => {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            유튜브 채널 분석기
          </Typography>
          <Outlet />
        </Box>
      </Container>
    </Box>
  );
};

// 메인 페이지 컴포넌트
const MainPage = () => {
  const navigate = useNavigate();

  const handleAnalyze = (data: any) => {
    // 분석 페이지로 이동하면서 데이터 전달
    navigate('/analysis', { 
      state: { channelData: data },
      replace: true 
    });
  };

  return <ChannelInput onAnalyze={handleAnalyze} />;
};

const App = () => {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Layout />,
      children: [
        {
          index: true,
          element: <MainPage />
        },
        {
          path: "analysis",
          element: <ChannelAnalysis />
        },
        {
          path: "*",
          element: <Navigate to="/" replace />
        }
      ]
    }
  ]);

  return <RouterProvider router={router} />;
};

export default App;

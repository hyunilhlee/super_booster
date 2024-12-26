import React, { useState, useEffect, useMemo } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';

interface AnalysisLoadingProps {
  onComplete: () => void;
}

const AnalysisLoading: React.FC<AnalysisLoadingProps> = ({ onComplete }) => {
  const [currentText, setCurrentText] = useState('');
  const [progress, setProgress] = useState(0);

  const loadingTexts = useMemo(() => [
    "채널의 정보를 불러오는 중...",
    "최근 영상을 분석하는 중...",
    "구독자와 조회수의 상관관계를 확인하는 중...",
    "조회수와 좋아요의 상관관계를 확인하는 중...",
    "채널에 대한 구독자의 상호 작용을 확인하는 중...",
    "영상 업로드 주기를 분석하는 중...",
    "콘텐츠 성과를 평가하는 중...",
    "채널 성장 가능성을 분석하는 중...",
    "시청자 참여도를 측정하는 중...",
    "AI를 이용한 심층 분석 중...",
    "최종 분석 결과를 정리하는 중..."
  ], []);

  useEffect(() => {
    // 3초에서 10초 사이의 랜덤한 시간 생성 (밀리초 단위)
    const totalDuration = Math.floor(Math.random() * (10000 - 3000 + 1) + 3000);
    const intervalPerText = totalDuration / loadingTexts.length;
    let currentIndex = 0;
    let startTime = Date.now();

    // 텍스트 변경을 위한 인터벌
    const textInterval = setInterval(() => {
      currentIndex = (currentIndex + 1) % loadingTexts.length;
      setCurrentText(loadingTexts[currentIndex]);
    }, intervalPerText);

    // 프로그레스 바 업데이트를 위한 인터벌
    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / totalDuration) * 100, 100);
      setProgress(newProgress);

      if (elapsed >= totalDuration) {
        clearInterval(progressInterval);
        clearInterval(textInterval);
        onComplete();
      }
    }, 50);

    // 초기 텍스트 설정
    setCurrentText(loadingTexts[0]);

    return () => {
      clearInterval(textInterval);
      clearInterval(progressInterval);
    };
  }, [onComplete, loadingTexts]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        gap: 3
      }}
    >
      <CircularProgress
        size={60}
        variant="determinate"
        value={progress}
        sx={{
          color: 'primary.main',
          '& .MuiCircularProgress-circle': {
            strokeLinecap: 'round',
          },
        }}
      />
      <Typography
        variant="h6"
        sx={{
          color: 'primary.main',
          textAlign: 'center',
          animation: 'fadeInOut 1s infinite',
          '@keyframes fadeInOut': {
            '0%': { opacity: 0.6 },
            '50%': { opacity: 1 },
            '100%': { opacity: 0.6 },
          },
        }}
      >
        {currentText}
      </Typography>
    </Box>
  );
};

export default AnalysisLoading; 
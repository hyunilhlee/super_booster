import React from 'react';
import { Box, Typography, Card, CardContent, Grid, Tooltip, IconButton } from '@mui/material';
import { Visibility, ThumbUp, Comment, HelpOutline } from '@mui/icons-material';

interface VideoStatistics {
  viewCount: string | number;
  likeCount: string | number;
  commentCount: string | number;
  publishedAt: string;
}

interface ChannelInfoProps {
  channelInfo: {
    title: string;
    subscriberCount: string | number;
    description: string;
  };
  videoStats: VideoStatistics[];
}

const ChannelInfo: React.FC<ChannelInfoProps> = ({ channelInfo, videoStats }) => {
  // 문자열이나 숫자를 숫자로 변환하는 헬퍼 함수
  const parseNumericValue = (value: string | number): number => {
    if (typeof value === 'number') return value;
    return parseInt(value.replace(/[^0-9]/g, '')) || 0;
  };

  // 채널 규모 결정
  const determineChannelSize = (subscriberCount: string | number): string => {
    const count = parseNumericValue(subscriberCount);
    
    if (count < 1000) return "초기";
    if (count < 10000) return "소규모";
    if (count < 100000) return "중소규모";
    if (count < 500000) return "중대형";
    if (count < 1000000) return "대형";
    return "메가";
  };

  // 숫자 포맷팅 함수
  const formatNumber = (num: number): string => {
    return num.toLocaleString('ko-KR');
  };

  // 평균 계산 함수
  const calculateAverage = (stats: VideoStatistics[], key: keyof Pick<VideoStatistics, 'viewCount' | 'likeCount' | 'commentCount'>): number => {
    if (!stats || stats.length === 0) return 0;
    
    const sum = stats.reduce((acc, stat) => {
      const value = parseNumericValue(stat[key]);
      return acc + value;
    }, 0);
    
    return Math.round(sum / stats.length);
  };

  const channelSize = determineChannelSize(channelInfo.subscriberCount);
  const subscriberCount = parseNumericValue(channelInfo.subscriberCount);

  const statsHelpText = `최근 동영상 통계 산출 방법:
1. 조회수, 좋아요, 댓글 수는 각 영상의 업로드 시간을 고려하여 보정
2. 시간 보정 가중치:
   - 0~13일: 1배
   - 2주: 2배
   - 3주: 3배
   - 4주: 4배
   - 1개월: 6배
   - 2개월: 10배
   - 3개월 이상: 14배
3. 보정된 수치들의 평균값을 계산하여 표시`;

  const channelSizeHelpText = `채널 규모 기준:
• 초기 채널: 1천 미만
• 소규모 채널: 1천 ~ 1만
• 중소규모 채널: 1만 ~ 10만
• 중대형 채널: 10만 ~ 50만
• 대형 채널: 50만 ~ 100만
• 메가 채널: 100만 이상

※ 구독자 수 기준`;

  return (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" color="primary" sx={{ mr: 1 }}>
                  채널 정보
                </Typography>
                <Tooltip 
                  title={<Typography style={{ whiteSpace: 'pre-line' }}>{channelSizeHelpText}</Typography>}
                  arrow
                  placement="top"
                >
                  <IconButton size="small">
                    <HelpOutline fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
              <Typography variant="body1" gutterBottom>
                채널명: {channelInfo.title}
              </Typography>
              <Typography variant="body1" gutterBottom>
                구독자 수: {formatNumber(subscriberCount)}명
              </Typography>
              <Typography variant="body1">
                채널 규모: {channelSize} 채널
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" color="primary" sx={{ mr: 1 }}>
                  최근 동영상 통계
                </Typography>
                <Tooltip 
                  title={<Typography style={{ whiteSpace: 'pre-line' }}>{statsHelpText}</Typography>}
                  arrow
                  placement="top"
                >
                  <IconButton size="small">
                    <HelpOutline fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Visibility sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="body1">
                  평균 조회수: {formatNumber(calculateAverage(videoStats, 'viewCount'))}회
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <ThumbUp sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="body1">
                  평균 좋아요: {formatNumber(calculateAverage(videoStats, 'likeCount'))}개
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Comment sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="body1">
                  평균 댓글: {formatNumber(calculateAverage(videoStats, 'commentCount'))}개
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ChannelInfo; 
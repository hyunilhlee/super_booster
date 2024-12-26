import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Grid,
  Link,
  Card,
  CardContent,
  CardMedia,
  Container,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Slide
} from '@mui/material';
import {
  Analytics,
  TrendingUp,
  Psychology,
  Speed,
  CheckCircle,
  Timeline,
  AutoGraph,
  Close as CloseIcon
} from '@mui/icons-material';
import { TransitionProps } from '@mui/material/transitions';
import axios from 'axios';

// 슬라이드 트랜지션 효과
const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

interface ChannelInputProps {
  onAnalyze: (data: any) => void;
}

interface ChannelInfo {
  channelId: string;
  title: string;
  subscriberCount: string;
  recentVideos: {
    title: string;
    publishedAt: string;
    url: string;
    thumbnail: string;
    statistics: {
      viewCount: string;
      likeCount: string;
      commentCount: string;
    };
  }[];
}

// API URL 설정
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4001/api';

const ChannelInput: React.FC<ChannelInputProps> = ({ onAnalyze }) => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [channelInfo, setChannelInfo] = useState<ChannelInfo | null>(null);
  const [open, setOpen] = useState(false);

  // 채널 분석 가능 여부 확인 함수
  const checkChannelEligibility = (videos: any[]) => {
    const now = new Date();
    const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());

    // 날짜 문자열을 Date 객체로 변환하는 함수
    const parseDate = (dateStr: string) => {
      const match = dateStr.match(/(\d{4})년 (\d{1,2})월 (\d{1,2})일/);
      if (match) {
        const [, year, month, day] = match;
        return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      }
      return new Date();
    };

    const recentVideos = videos.map(video => {
      const date = parseDate(video.publishedAt);
      return { ...video, date };
    });

    const videosInThreeMonths = recentVideos.filter(video => video.date >= threeMonthsAgo);
    const videosInOneMonth = recentVideos.filter(video => video.date >= oneMonthAgo);

    return {
      isEligible: videosInThreeMonths.length >= 5 && videosInOneMonth.length >= 1,
      videosInThreeMonths: videosInThreeMonths.length,
      videosInOneMonth: videosInOneMonth.length
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setChannelInfo(null);

    const urlPattern = /^(https?:\/\/)?(www\.)?youtube\.com\/@[^/?]+/;
    const videoPattern = /^(https?:\/\/)?(www\.)?youtube\.com\/watch\?v=[^&]+/;
    
    if (!urlPattern.test(url) && !videoPattern.test(url)) {
      setError('올바른 유튜브 채널 URL을 입력해주세요. (예: https://youtube.com/@channelname)');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(`${API_URL}/channel`, {
        params: { url }
      });
      setChannelInfo(response.data);
      setOpen(true); // 모달 열기
    } catch (err: any) {
      setError(err.response?.data?.error || '채널 정보를 가져오는데 실패했습니다.');
      console.error('Error fetching channel info:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleAnalyze = () => {
    if (!channelInfo) return;

    // 채널 데이터 형식 변환
    const videos = channelInfo.recentVideos.map(video => ({
      title: video.title,
      viewCount: parseInt(video.statistics.viewCount.replace(/,/g, '')),
      likeCount: parseInt(video.statistics.likeCount.replace(/,/g, '')),
      commentCount: parseInt(video.statistics.commentCount.replace(/,/g, '')),
      uploadDate: video.publishedAt,
      videoId: video.url.split('v=')[1]?.split('&')[0] || '',
      thumbnail: video.thumbnail,
      url: video.url
    }));

    // 구독자 수에서 쉼표와 '명' 제거 후 숫자로 변환
    const subscriberCount = channelInfo.subscriberCount.replace(/[,명]/g, '');

    const analysisData = {
      channelInfo: {
        title: channelInfo.title,
        subscriberCount: subscriberCount,
        description: `구독자 ${channelInfo.subscriberCount}`
      },
      videoStats: videos
    };

    onAnalyze(analysisData);
  };

  return (
    <Box>
      {/* 히어로 섹션 */}
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          py: 8,
          mb: 6,
          borderRadius: { xs: 0, sm: '0 0 2rem 2rem' },
          boxShadow: 3
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h2" gutterBottom fontWeight="bold">
                YouTube 채널 분석기
              </Typography>
              <Typography variant="h5" paragraph>
                AI 기반 채널 분석으로 당신의 채널을 성장시키세요
              </Typography>
              <Typography variant="body1" paragraph>
                실시간 데이터 분석과 맞춤형 성장 전략을 제공합니다
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper
                elevation={3}
                sx={{
                  p: 4,
                  bgcolor: 'background.paper',
                  borderRadius: 2
                }}
              >
                <Box
                  component="form"
                  onSubmit={handleSubmit}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2
                  }}
                >
                  <Typography variant="h6" color="text.primary" gutterBottom>
                    채널 분석 시작하기
                  </Typography>
                  <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="https://www.youtube.com/@channelname"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    disabled={loading}
                    error={!!error}
                    helperText={error}
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={loading || !url}
                    startIcon={loading ? <CircularProgress size={20} /> : <Analytics />}
                  >
                    {loading ? '분석 중...' : '무료로 분석하기'}
                  </Button>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* 주요 기능 섹션 */}
      <Container maxWidth="lg">
        <Box sx={{ mb: 8 }}>
          <Typography variant="h4" align="center" gutterBottom>
            주요 기능
          </Typography>
          <Typography variant="subtitle1" align="center" color="text.secondary" paragraph>
            최첨단 AI 기술로 당신의 채널을 분석합니다
          </Typography>
          <Grid container spacing={4} sx={{ mt: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                    <Speed color="primary" sx={{ fontSize: 40 }} />
                    <Typography variant="h6" align="center">
                      실시간 분석
                    </Typography>
                    <Typography variant="body2" align="center" color="text.secondary">
                      채널의 현재 상태를 실시간으로 분석하여 즉각적인 인사이트를 제공합니다
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                    <Psychology color="primary" sx={{ fontSize: 40 }} />
                    <Typography variant="h6" align="center">
                      AI 기반 분석
                    </Typography>
                    <Typography variant="body2" align="center" color="text.secondary">
                      AI가 채널의 상태를 분석하여 맞춤형 성장 전략을 제시합니다
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                    <TrendingUp color="primary" sx={{ fontSize: 40 }} />
                    <Typography variant="h6" align="center">
                      성장 전략
                    </Typography>
                    <Typography variant="body2" align="center" color="text.secondary">
                      채널 성장을 위한 구체적인 실행 전략과 솔루션을 제공합니다
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                    <AutoGraph color="primary" sx={{ fontSize: 40 }} />
                    <Typography variant="h6" align="center">
                      맞춤형 패키지
                    </Typography>
                    <Typography variant="body2" align="center" color="text.secondary">
                      채널 상태에 따른 최적화된 성장 패키지를 추천합니다
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* 분석 프로세스 섹션 */}
        <Box sx={{ mb: 8 }}>
          <Typography variant="h4" align="center" gutterBottom>
            분석 프로세스
          </Typography>
          <Grid container spacing={4} sx={{ mt: 4 }}>
            <Grid item xs={12} md={6}>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircle color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="채널 링크 입력"
                    secondary="분석하고자 하는 YouTube 채널의 URL을 입력하세요"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircle color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="AI 분석 진행"
                    secondary="최신 AI 기술로 채널의 모든 지표를 분석합니다"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircle color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="맞춤형 전략 제시"
                    secondary="분석 결과를 바탕으로 최적화된 성장 전략을 제안합니다"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircle color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="성장 패키지 추천"
                    secondary="채널 상태에 맞는 최적의 성장 패키지를 추천받으세요"
                  />
                </ListItem>
              </List>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    분석 가능 조건
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemIcon>
                        <Timeline color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary="최근 3개월 내 5개 이상의 영상"
                        secondary="지속적인 컨텐츠 업로드가 필요합니다"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <Timeline color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary="최근 1개월 내 1개 이상의 영상"
                        secondary="활성화된 채널 운영이 필요합니다"
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Container>

      {/* 채널 정보 모달 */}
      <Dialog
        open={open}
        TransitionComponent={Transition}
        keepMounted
        onClose={handleClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ m: 0, p: 2 }}>
          {channelInfo?.title}
          <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom color="text.secondary">
              구독자 {channelInfo?.subscriberCount}명
            </Typography>
          </Box>

          <Typography variant="h6" gutterBottom>
            최근 업로드 영상
          </Typography>
          <Grid container spacing={2}>
            {channelInfo?.recentVideos.map((video, index) => (
              <Grid item xs={12} key={index}>
                <Card sx={{ display: 'flex', height: '100%' }}>
                  <CardMedia
                    component="img"
                    sx={{ width: 200 }}
                    image={video.thumbnail}
                    alt={video.title}
                  />
                  <CardContent sx={{ flex: 1 }}>
                    <Link
                      href={video.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      underline="hover"
                      color="inherit"
                    >
                      <Typography variant="subtitle1" gutterBottom>
                        {video.title}
                      </Typography>
                    </Link>
                    <Typography variant="body2" color="text.secondary">
                      조회수: {video.statistics.viewCount}회
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      좋아요: {video.statistics.likeCount}개
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      댓글: {video.statistics.commentCount}개
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      업로드: {video.publishedAt}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {(() => {
            const eligibility = checkChannelEligibility(channelInfo?.recentVideos || []);
            return (
              <Box sx={{ mt: 3 }}>
                {eligibility.isEligible ? (
                  <Alert severity="success" sx={{ mb: 2 }}>
                    분석 가능한 채널입니다. 상세 분석을 진행해보세요!
                  </Alert>
                ) : (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    3개월 내에 업로드 한 게시물이 5개 이상이고, 한달이내에 업로드한 게시물이 1개 이상일때 분석 가능합니다.
                    <br />
                    현재 상태: 3개월 내 {eligibility.videosInThreeMonths}개, 1개월 내 {eligibility.videosInOneMonth}개
                  </Alert>
                )}
              </Box>
            );
          })()}
        </DialogContent>
        <DialogActions>
          {(() => {
            const eligibility = checkChannelEligibility(channelInfo?.recentVideos || []);
            return eligibility.isEligible ? (
              <Button
                variant="contained"
                color="primary"
                size="large"
                onClick={() => {
                  handleAnalyze();
                  handleClose();
                }}
                startIcon={<Analytics />}
              >
                상세 분석 시작하기
              </Button>
            ) : (
              <Button
                variant="contained"
                color="error"
                size="large"
                disabled
                startIcon={<Analytics />}
              >
                분석 불가
              </Button>
            );
          })()}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ChannelInput; 
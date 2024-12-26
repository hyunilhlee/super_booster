import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Checkbox,
  Slider,
  FormControlLabel,
  Paper,
  Grid,
  Card,
  CardContent,
  Radio,
  RadioGroup,
  Divider,
  Chip,
  CardMedia
} from '@mui/material';

interface Video {
  title: string;
  publishedAt: string;
  thumbnail: string;
  performance?: {
    views: string;
    likes: string;
    comments: string;
  };
  statistics?: {
    viewCount: string;
    likeCount: string;
    commentCount: string;
    subscriberCount?: string;
  };
}

interface ProductSelectionProps {
  videos: Video[];
  onProductSelect: (selection: any) => void;
}

interface PackageType {
  name: string;
  price: number;
  count: number;
  formula: {
    views: (v: number) => number;
    likes: (l: number) => number;
    comments: (c: number) => number;
  };
}

const packages: PackageType[] = [
  { 
    name: 'BASIC 패키지', 
    price: 100000, 
    count: 0,
    formula: {
      views: (v: number) => 20,
      likes: (l: number) => 15,
      comments: (c: number) => 10
    }
  },
  { 
    name: 'STANDARD 패키지', 
    price: 200000, 
    count: 0,
    formula: {
      views: (v: number) => 40,
      likes: (l: number) => 30,
      comments: (c: number) => 20
    }
  },
  { 
    name: 'PREMIUM 패키지', 
    price: 300000, 
    count: 0,
    formula: {
      views: (v: number) => 60,
      likes: (l: number) => 45,
      comments: (c: number) => 30
    }
  },
  { 
    name: 'VIP 패키지', 
    price: 500000, 
    count: 0,
    formula: {
      views: (v: number) => 100,
      likes: (l: number) => 80,
      comments: (c: number) => 50
    }
  },
];

interface RangeValues {
  Pm: number;
  PM: number;
  Qm: number;
  QM: number;
}

const getSubscriberRange = (subscriberCount: number): RangeValues => {
  if (subscriberCount < 1000) {
    return { Pm: 0.05, PM: 0.1, Qm: 0.005, QM: 0.015 };
  } else if (subscriberCount < 10000) {
    return { Pm: 0.04, PM: 0.08, Qm: 0.004, QM: 0.01 };
  } else if (subscriberCount < 100000) {
    return { Pm: 0.03, PM: 0.06, Qm: 0.003, QM: 0.008 };
  } else if (subscriberCount < 500000) {
    return { Pm: 0.02, PM: 0.05, Qm: 0.002, QM: 0.006 };
  } else if (subscriberCount < 1000000) {
    return { Pm: 0.015, PM: 0.04, Qm: 0.002, QM: 0.005 };
  } else {
    return { Pm: 0.01, PM: 0.03, Qm: 0.001, QM: 0.003 };
  }
};

const calculatePackageMultiplier = (packageName: string, metric: 'views' | 'likes' | 'comments', range: RangeValues) => {
  const { Pm, PM, Qm, QM } = range;
  
  switch (packageName) {
    case 'BASIC 패키지':
      return metric === 'comments' ? Qm : Pm;
    case 'STANDARD 패키지':
      return metric === 'comments' ? (Qm + QM) / 2 : (Pm + PM) / 2;
    case 'PREMIUM 패키지':
      return metric === 'comments' ? QM : PM;
    case 'VIP 패키지':
      return metric === 'comments' ? (3 * QM - Qm) / 2 : (3 * PM - Pm) / 2;
    default:
      return 0;
  }
};

interface MetricValues {
  views: number;
  likes: number;
  comments: number;
}

interface PackageValues {
  [key: string]: MetricValues;
}

const ProductSelection: React.FC<ProductSelectionProps> = ({ videos, onProductSelect }) => {
  const [selectedVideos, setSelectedVideos] = useState<{ [key: string]: boolean }>({});
  const [videoPackages, setVideoPackages] = useState<{ [key: string]: string }>({});
  const [videoMetrics, setVideoMetrics] = useState<{
    [key: string]: {
      views: number;
      likes: number;
      comments: number;
    };
  }>({});
  const [packageCounts, setPackageCounts] = useState<PackageType[]>(packages);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [videoTotals, setVideoTotals] = useState<{ [key: string]: number }>({});
  const [subscriberCount, setSubscriberCount] = useState<number>(1000);
  const [isSubscriberSelected, setIsSubscriberSelected] = useState<boolean>(false);

  const handleVideoSelect = (videoTitle: string) => {
    setSelectedVideos(prev => ({
      ...prev,
      [videoTitle]: !prev[videoTitle]
    }));
    if (!videoMetrics[videoTitle]) {
      setVideoMetrics(prev => ({
        ...prev,
        [videoTitle]: { views: 0, likes: 0, comments: 0 }
      }));
    }
  };

  const handleMetricChange = (videoTitle: string, metric: 'views' | 'likes' | 'comments', value: number) => {
    const video = videos.find(v => v.title === videoTitle);
    if (!video?.statistics) return;

    const packageName = videoPackages[videoTitle];
    if (packageName) {
      // 패키지별 최대값 제한
      const maxValues: PackageValues = {
        'BASIC 패키지': {
          views: 20,
          likes: 15,
          comments: 10
        },
        'STANDARD 패키지': {
          views: 40,
          likes: 30,
          comments: 20
        },
        'PREMIUM 패키지': {
          views: 60,
          likes: 45,
          comments: 30
        },
        'VIP 패키지': {
          views: 100,
          likes: 80,
          comments: 50
        }
      };

      const maxValue = maxValues[packageName][metric];
      const adjustedValue = Math.min(value, maxValue);

      setVideoMetrics(prev => ({
        ...prev,
        [videoTitle]: {
          ...prev[videoTitle],
          [metric]: adjustedValue
        }
      }));
    } else {
      setVideoMetrics(prev => ({
        ...prev,
        [videoTitle]: {
          ...prev[videoTitle],
          [metric]: value
        }
      }));
    }
  };

  const calculateMetricIncrease = React.useCallback((videoTitle: string, metric: 'views' | 'likes' | 'comments') => {
    const video = videos.find(v => v.title === videoTitle);
    if (!video?.statistics) return 0;
    
    const metricMap = {
      views: 'viewCount',
      likes: 'likeCount',
      comments: 'commentCount'
    } as const;
    
    const currentValue = parseInt(video.statistics[metricMap[metric]]);
    const percentage = videoMetrics[videoTitle]?.[metric] || 0;
    const subscriberCount = parseInt(video.statistics.subscriberCount || '1000');
    const range = getSubscriberRange(subscriberCount);
    const packageName = videoPackages[videoTitle];
    
    if (packageName) {
      const multiplier = calculatePackageMultiplier(packageName, metric, range);
      return Math.round(currentValue * multiplier * (percentage / 100));
    }
    
    return Math.round(currentValue * (percentage / 100));
  }, [videos, videoMetrics, videoPackages]);

  const calculateVideoTotal = React.useCallback((videoTitle: string, packageName: string) => {
    const video = videos.find(v => v.title === videoTitle);
    if (!video?.statistics) return 0;

    const pkg = packages.find(p => p.name === packageName);
    if (!pkg) return 0;

    const viewsIncrease = calculateMetricIncrease(videoTitle, 'views');
    const likesIncrease = calculateMetricIncrease(videoTitle, 'likes');
    const commentsIncrease = calculateMetricIncrease(videoTitle, 'comments');

    return pkg.price + ((viewsIncrease + likesIncrease + commentsIncrease) * 1000);
  }, [videos, calculateMetricIncrease]);

  const handlePackageSelect = (videoTitle: string, packageName: string) => {
    setVideoPackages(prev => ({
      ...prev,
      [videoTitle]: packageName
    }));

    const video = videos.find(v => v.title === videoTitle);
    if (!video?.statistics) return;

    // 패키지별 초기 슬라이더 값 설정
    const initialValues: PackageValues = {
      'BASIC 패키지': {
        views: 20,
        likes: 15,
        comments: 10
      },
      'STANDARD 패키지': {
        views: 40,
        likes: 30,
        comments: 20
      },
      'PREMIUM 패키지': {
        views: 60,
        likes: 45,
        comments: 30
      },
      'VIP 패키지': {
        views: 100,
        likes: 80,
        comments: 50
      }
    };

    setVideoMetrics(prev => ({
      ...prev,
      [videoTitle]: initialValues[packageName] || { views: 0, likes: 0, comments: 0 }
    }));
  };

  useEffect(() => {
    // 패키지 카운트 계산
    const counts = packages.map(pkg => ({
      ...pkg,
      count: Object.values(videoPackages).filter(p => p === pkg.name).length
    }));
    setPackageCounts(counts);

    // 영상별 금액 및 총액 계산
    const videoTotalAmounts: { [key: string]: number } = {};
    const total = Object.entries(videoPackages).reduce((sum, [videoTitle, packageName]) => {
      const pkg = counts.find(p => p.name === packageName);
      if (pkg) {
        const videoTotal = calculateVideoTotal(videoTitle, packageName);
        videoTotalAmounts[videoTitle] = videoTotal;
        return sum + videoTotal;
      }
      return sum;
    }, 0);

    // 구독자 상품 금액 추가
    const subscriberAmount = isSubscriberSelected ? subscriberCount * 500 : 0;
    
    setVideoTotals(videoTotalAmounts);
    setTotalAmount(total + subscriberAmount);
  }, [videoPackages, videoMetrics, subscriberCount, isSubscriberSelected, calculateVideoTotal]);

  const getPerformanceColor = (level: string) => {
    switch (level) {
      case '우수': return 'primary';
      case '적정': return 'success';
      case '미달': return 'error';
      default: return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        // ISO 형식이 아닌 경우 직접 파싱
        const [year, month, day] = dateString.split('-').map(num => parseInt(num));
        return new Date(year, month - 1, day).toLocaleDateString('ko-KR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      }
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return dateString; // 파싱 실패 시 원본 문자열 반환
    }
  };

  const calculateMetricTotal = (videoTitle: string, metric: 'views' | 'likes' | 'comments') => {
    const video = videos.find(v => v.title === videoTitle);
    if (!video?.statistics) return 0;
    
    let currentValue = 0;
    switch (metric) {
      case 'views':
        currentValue = parseInt(video.statistics.viewCount);
        break;
      case 'likes':
        currentValue = parseInt(video.statistics.likeCount);
        break;
      case 'comments':
        currentValue = parseInt(video.statistics.commentCount);
        break;
    }
    
    const increase = calculateMetricIncrease(videoTitle, metric);
    return currentValue + increase;
  };

  return (
    <Box>
      {/* 구독자 단품 상품 */}
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            1. 구독자 수 증가 단품
          </Typography>
          <FormControlLabel
            control={
              <Checkbox
                checked={isSubscriberSelected}
                onChange={(e) => setIsSubscriberSelected(e.target.checked)}
              />
            }
            label="선택"
          />
        </Box>
        <Box sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography gutterBottom>목표 구독자 수 설정</Typography>
              <Slider
                value={subscriberCount}
                onChange={(_, value) => setSubscriberCount(value as number)}
                min={1000}
                max={100000}
                step={1000}
                valueLabelDisplay="auto"
                valueLabelFormat={(value) => `${value.toLocaleString()}명`}
                sx={{ width: '100%' }}
                disabled={!isSubscriberSelected}
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                <Typography variant="body1">
                  설정된 구독자 수: {subscriberCount.toLocaleString()}명
                </Typography>
                <Typography variant="h6" color="primary">
                  금액: ₩{(isSubscriberSelected ? subscriberCount * 500 : 0).toLocaleString()}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      {/* 영상별 패키지 상품 */}
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          2. 영상별 패키지 선택
        </Typography>
        {videos.map((video, index) => (
          <Box key={index} sx={{ mb: 4 }}>
            <Grid container spacing={2}>
              {/* 첫 번째 줄: 썸네일, 제목, 날짜, 체크박스 */}
              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={2}>
                        <CardMedia
                          component="img"
                          image={video.thumbnail}
                          alt={video.title}
                          sx={{ borderRadius: 1 }}
                        />
                      </Grid>
                      <Grid item xs={9}>
                        <Typography variant="h6">{video.title}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(video.publishedAt)}
                        </Typography>
                        {video.performance && (
                          <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                            <Chip 
                              label={`조회수: ${video.performance.views}`}
                              color={getPerformanceColor(video.performance.views)}
                              size="small"
                            />
                            <Chip 
                              label={`좋아요: ${video.performance.likes}`}
                              color={getPerformanceColor(video.performance.likes)}
                              size="small"
                            />
                            <Chip 
                              label={`댓글: ${video.performance.comments}`}
                              color={getPerformanceColor(video.performance.comments)}
                              size="small"
                            />
                          </Box>
                        )}
                      </Grid>
                      <Grid item xs={1}>
                        <Checkbox
                          checked={selectedVideos[video.title] || false}
                          onChange={() => handleVideoSelect(video.title)}
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              {/* 두 번째 줄: 패키지 선택 및 슬라이더 */}
              {selectedVideos[video.title] && (
                <Grid item xs={12}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom>
                        패키지 선택
                      </Typography>
                      <RadioGroup
                        value={videoPackages[video.title] || ''}
                        onChange={(e) => handlePackageSelect(video.title, e.target.value)}
                      >
                        <Grid container spacing={2}>
                          {packages.map((pkg) => (
                            <Grid item xs={3} key={pkg.name}>
                              <Card variant="outlined">
                                <CardContent>
                                  <FormControlLabel
                                    value={pkg.name}
                                    control={<Radio />}
                                    label={
                                      <Box>
                                        <Typography variant="subtitle2">{pkg.name}</Typography>
                                        <Typography variant="body2" color="text.secondary">
                                          ₩{pkg.price.toLocaleString()}
                                        </Typography>
                                      </Box>
                                    }
                                  />
                                </CardContent>
                              </Card>
                            </Grid>
                          ))}
                        </Grid>
                      </RadioGroup>

                      <Box sx={{ mt: 3 }}>
                        <Typography variant="subtitle1" gutterBottom>
                          세부 지표 설정
                        </Typography>
                        <Grid container spacing={2}>
                          <Grid item xs={4}>
                            <Typography gutterBottom>조회수 증가</Typography>
                            <Slider
                              value={videoMetrics[video.title]?.views || 0}
                              onChange={(_, value) => handleMetricChange(video.title, 'views', value as number)}
                              min={0}
                              max={100}
                              valueLabelDisplay="auto"
                              valueLabelFormat={(value) => {
                                const increase = calculateMetricIncrease(video.title, 'views');
                                return `+${increase.toLocaleString()}회`;
                              }}
                            />
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                              <Typography variant="body2" color="text.secondary">
                                현재: {parseInt(video.statistics?.viewCount || '0').toLocaleString()}회
                              </Typography>
                              <Typography variant="body2" color="primary">
                                예상: {calculateMetricTotal(video.title, 'views').toLocaleString()}회
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={4}>
                            <Typography gutterBottom>좋아요 증가</Typography>
                            <Slider
                              value={videoMetrics[video.title]?.likes || 0}
                              onChange={(_, value) => handleMetricChange(video.title, 'likes', value as number)}
                              min={0}
                              max={100}
                              valueLabelDisplay="auto"
                              valueLabelFormat={(value) => {
                                const increase = calculateMetricIncrease(video.title, 'likes');
                                return `+${increase.toLocaleString()}개`;
                              }}
                            />
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                              <Typography variant="body2" color="text.secondary">
                                현재: {parseInt(video.statistics?.likeCount || '0').toLocaleString()}개
                              </Typography>
                              <Typography variant="body2" color="primary">
                                예상: {calculateMetricTotal(video.title, 'likes').toLocaleString()}개
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={4}>
                            <Typography gutterBottom>댓글 증가</Typography>
                            <Slider
                              value={videoMetrics[video.title]?.comments || 0}
                              onChange={(_, value) => handleMetricChange(video.title, 'comments', value as number)}
                              min={0}
                              max={100}
                              valueLabelDisplay="auto"
                              valueLabelFormat={(value) => {
                                const increase = calculateMetricIncrease(video.title, 'comments');
                                return `+${increase.toLocaleString()}개`;
                              }}
                            />
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                              <Typography variant="body2" color="text.secondary">
                                현재: {parseInt(video.statistics?.commentCount || '0').toLocaleString()}개
                              </Typography>
                              <Typography variant="body2" color="primary">
                                예상: {calculateMetricTotal(video.title, 'comments').toLocaleString()}개
                              </Typography>
                            </Box>
                          </Grid>
                        </Grid>
                      </Box>

                      {/* 영상별 금액 표시 */}
                      <Box sx={{ mt: 3, textAlign: 'right' }}>
                        <Typography variant="h6" color="primary">
                          영상 총액: ₩{videoTotals[video.title]?.toLocaleString() || '0'}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              )}
            </Grid>
            {index < videos.length - 1 && <Divider sx={{ my: 3 }} />}
          </Box>
        ))}

        {/* 패키지 요약 및 총액 */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            선택한 패키지 요약
          </Typography>
          <Grid container spacing={2}>
            {packageCounts.map((pkg) => (
              <Grid item xs={3} key={pkg.name}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1">{pkg.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {pkg.count}개 선택
                    </Typography>
                    <Typography variant="body2" color="primary">
                      ₩{(pkg.price * pkg.count).toLocaleString()}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Box sx={{ mt: 3, textAlign: 'right' }}>
            <Typography variant="h5" color="primary">
              총 금액: ₩{totalAmount.toLocaleString()}
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default ProductSelection; 
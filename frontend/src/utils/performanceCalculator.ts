interface VideoStats {
  viewCount: number;
  likeCount: number;
  commentCount: number;
  publishedAt: string;
}

// 한글 날짜 문자열을 Date 객체로 변환
const parseKoreanDate = (dateStr: string): Date => {
  try {
    // "2024년 12월 10일" 형식의 문자열을 파싱
    const matches = dateStr.match(/(\d{4})년\s+(\d{1,2})월\s+(\d{1,2})일/);
    if (!matches) {
      throw new Error('날짜 형식이 맞지 않음');
    }
    
    const [, year, month, day] = matches;
    // UTC 기준으로 날짜 생성 (시간은 00:00:00으로 설정)
    return new Date(Date.UTC(
      parseInt(year),
      parseInt(month) - 1, // 월은 0부터 시작
      parseInt(day)
    ));
  } catch (error) {
    console.error('한글 날짜 파싱 에러:', error, '원본 데이터:', dateStr);
    throw error;
  }
};

// 게시 기간에 따른 T값 반환
const getTimeWeight = (publishedAt: string | undefined): number => {
  const now = new Date();
  
  // publishedAt이 없는 경우 처리
  if (!publishedAt) {
    console.error('업로드 날짜 정보 없음');
    return 14; // 기본값으로 가장 긴 기간 적용
  }

  let published: Date;
  try {
    published = parseKoreanDate(publishedAt);
    
    // 유효하지 않은 날짜인 경우
    if (isNaN(published.getTime())) {
      console.error('유효하지 않은 날짜:', publishedAt);
      return 14;
    }
  } catch (error) {
    console.error('날짜 파싱 에러:', error, '원본 데이터:', publishedAt);
    return 14;
  }

  const diffDays = Math.floor((now.getTime() - published.getTime()) / (1000 * 60 * 60 * 24));

  let timeWeight: number;
  let period: string;

  if (diffDays <= 6) {
    timeWeight = 1;
    period = "0~6일";
  } else if (diffDays <= 13) {
    timeWeight = 1;
    period = "7~13일";
  } else if (diffDays <= 20) {
    timeWeight = 2;
    period = "2주";
  } else if (diffDays <= 27) {
    timeWeight = 3;
    period = "3주";
  } else if (diffDays <= 34) {
    timeWeight = 4;
    period = "4주";
  } else if (diffDays <= 62) {
    timeWeight = 6;
    period = "1개월";
  } else if (diffDays <= 90) {
    timeWeight = 10;
    period = "2개월";
  } else {
    timeWeight = 14;
    period = "3개월 이상";
  }

  // 날짜를 한국 시간 기준으로 포맷팅
  const formatDate = (date: Date): string => {
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  console.log('시간 가중치 계산:', {
    원본날짜: publishedAt,
    파싱된_업로드일: formatDate(published),
    현재시간: formatDate(now),
    경과일수: diffDays,
    기간구분: period,
    가중치: timeWeight
  });

  return timeWeight;
};

// 구독자 수에 따른 범위 계수(Rm) 반환
const getSubscriberRangeMultiplier = (subscriberCount: number): { min: number; max: number } => {
  if (subscriberCount < 1000) return { min: 0.3, max: 0.5 };           // 1천명 미만
  if (subscriberCount < 10000) return { min: 0.2, max: 0.4 };          // 1천~1만
  if (subscriberCount < 100000) return { min: 0.15, max: 0.3 };        // 1~10만
  if (subscriberCount < 500000) return { min: 0.08, max: 0.2 };        // 10~50만
  if (subscriberCount < 1000000) return { min: 0.05, max: 0.15 };      // 50~100만
  return { min: 0.02, max: 0.1 };                                      // 100만 이상
};

// 구독자 수에 따른 좋아요 비율 범위(Pm) 반환
const getLikeRangeMultiplier = (subscriberCount: number): { min: number; max: number } => {
  if (subscriberCount < 1000) return { min: 0.05, max: 0.1 };
  if (subscriberCount < 10000) return { min: 0.04, max: 0.08 };
  if (subscriberCount < 100000) return { min: 0.03, max: 0.06 };
  if (subscriberCount < 500000) return { min: 0.02, max: 0.05 };
  if (subscriberCount < 1000000) return { min: 0.015, max: 0.04 };
  return { min: 0.01, max: 0.03 };
};

// 구독자 수에 따른 댓글 비율 범위(Qm) 반환
const getCommentRangeMultiplier = (subscriberCount: number): { min: number; max: number } => {
  if (subscriberCount < 1000) return { min: 0.005, max: 0.015 };
  if (subscriberCount < 10000) return { min: 0.004, max: 0.01 };
  if (subscriberCount < 100000) return { min: 0.003, max: 0.008 };
  if (subscriberCount < 500000) return { min: 0.002, max: 0.006 };
  if (subscriberCount < 1000000) return { min: 0.002, max: 0.005 };
  return { min: 0.001, max: 0.003 };
};

export const calculatePerformanceMetrics = (
  videoStats: VideoStats[],
  subscriberCount: number
) => {
  const N = videoStats.length;
  if (N === 0) return null;

  console.log('=== 성과지표 계산 시작 ===');
  console.log('입력된 비디오 데이터:', videoStats);
  console.log('구독자 수:', subscriberCount.toLocaleString(), '명');
  console.log('분석 동영상 수:', N, '개');

  // 1. 시간 보정된 조회수 계산
  console.log('\n=== 각 동영상 시간 보정 조회수 계산 ===');
  const adjustedViews = videoStats.map((stat, index) => {
    console.log(`\n[동영상 ${index + 1}번 원본 데이터]`, stat);
    
    if (!stat.publishedAt) {
      console.error(`동영상 ${index + 1}번의 publishedAt 정보가 없음:`, stat);
      return 0;
    }

    const timeWeight = getTimeWeight(stat.publishedAt);
    const adjustedView = stat.viewCount / Math.sqrt(timeWeight);
    
    console.log(`[동영상 ${index + 1}번 계산 결과]`);
    console.log('원본 조회수:', stat.viewCount.toLocaleString(), '회');
    console.log('보정된 조회수:', Math.round(adjustedView).toLocaleString(), '회');
    console.log('보정 배수:', Math.sqrt(timeWeight).toFixed(2), '배');
    
    return adjustedView;
  });

  // 조회수 평균 계산
  const averageAdjustedViews = adjustedViews.reduce((sum, view) => sum + view, 0) / N;
  console.log('\n=== 평균 보정 조회수 ===');
  console.log('평균값:', Math.round(averageAdjustedViews).toLocaleString(), '회');
  
  // 구독자수 대비 기준값 계산
  const rangeMultiplier = getSubscriberRangeMultiplier(subscriberCount);
  console.log('구독자수 대비 기준값:', rangeMultiplier);
  const viewsMinThreshold = rangeMultiplier.min * subscriberCount;
  const viewsMaxThreshold = rangeMultiplier.max * subscriberCount;
  
  console.log('\n=== 조회수 성과 기준 ===');
  console.log('최소 기준:', Math.round(viewsMinThreshold).toLocaleString(), '회');
  console.log('최대 기준:', Math.round(viewsMaxThreshold).toLocaleString(), '회');
  console.log('실제 평균:', Math.round(averageAdjustedViews).toLocaleString(), '회');

  // 2. 조회수 대비 좋아요 비율 계산
  console.log('\n=== 좋아요 비율 계산 ===');
  const likeRatios = videoStats.map((stat, index) => {
    const ratio = stat.likeCount / stat.viewCount;
    console.log(`[동영상 ${index + 1}번] 좋아요율:`, (ratio * 100).toFixed(2), '%',
      `(좋아요 ${stat.likeCount.toLocaleString()}개 / 조회수 ${stat.viewCount.toLocaleString()}회)`);
    return ratio;
  });
  const averageLikeRatio = likeRatios.reduce((sum, ratio) => sum + ratio, 0) / N;

  const likeMultiplier = getLikeRangeMultiplier(subscriberCount);
  const likeMinThreshold = likeMultiplier.min;
  const likeMaxThreshold = likeMultiplier.max;

  console.log('\n좋아요 성과 기준:');
  console.log('최소 기준:', (likeMinThreshold * 100).toFixed(2), '%');
  console.log('최대 기준:', (likeMaxThreshold * 100).toFixed(2), '%');
  console.log('실제 평균:', (averageLikeRatio * 100).toFixed(2), '%');

  // 3. 조회수 대비 댓글 비율 계산
  console.log('\n=== 댓글 비율 계산 ===');
  const commentRatios = videoStats.map((stat, index) => {
    const ratio = stat.commentCount / stat.viewCount;
    console.log(`[동영상 ${index + 1}번] 댓글율:`, (ratio * 100).toFixed(2), '%',
      `(댓글 ${stat.commentCount.toLocaleString()}개 / 조회수 ${stat.viewCount.toLocaleString()}회)`);
    return ratio;
  });
  const averageCommentRatio = commentRatios.reduce((sum, ratio) => sum + ratio, 0) / N;
  const commentMultiplier = getCommentRangeMultiplier(subscriberCount);
  console.log('구독자수 대비 댓글 비율 기준값:', commentMultiplier);
  const commentMinThreshold = commentMultiplier.min;
  const commentMaxThreshold = commentMultiplier.max;

  console.log('\n댓글 성과 기준:');
  console.log('최소 ���준:', (commentMinThreshold * 100).toFixed(2), '%');
  console.log('최대 기준:', (commentMaxThreshold * 100).toFixed(2), '%');
  console.log('실제 평균:', (averageCommentRatio * 100).toFixed(2), '%');

  // 각 지표의 등급 판정
  const getPerformanceLevel = (value: number, min: number, max: number): '미달' | '적정' | '우수' => {
    if (value < min) return '미달';
    if (value > max) return '우수';
    return '적정';
  };

  const result = {
    viewsPerformance: {
      value: averageAdjustedViews,
      level: getPerformanceLevel(averageAdjustedViews, viewsMinThreshold, viewsMaxThreshold)
    },
    likePerformance: {
      value: averageLikeRatio,
      level: getPerformanceLevel(averageLikeRatio, likeMinThreshold, likeMaxThreshold)
    },
    commentPerformance: {
      value: averageCommentRatio,
      level: getPerformanceLevel(averageCommentRatio, commentMinThreshold, commentMaxThreshold)
    }
  };

  console.log('\n=== 최종 성과 등급 ===');
  console.log('조회수:', result.viewsPerformance.level);
  console.log('좋아요:', result.likePerformance.level);
  console.log('댓글:', result.commentPerformance.level);

  return result;
}; 
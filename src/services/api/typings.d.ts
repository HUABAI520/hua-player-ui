declare namespace API {
  type deleteUsersUsingGETParams = {
    /** id */
    id?: number;
  };

  type LoginResult = {
    status?: string;
    type?: string;
  };

  type UserLoginRequest = {
    userAccount?: string;
    userPassword?: string;
  };

  type UserRegisterRequest = {
    checkPassword?: string;
    userAccount?: string;
    userPassword?: string;
    username?: string;
    email?: string;
    code?: string;
  };
  type UpdatePasswordRequest = {
    userPassword: string;
    checkPassword: string;
    email: string;
    code: string;
  };
  type UserVO = {
    createTime?: string;
    email?: string;
    gender?: number;
    id?: number;
    phone?: string;
    profile?: string;
    userAccount?: string;
    userAvatar?: string;
    userRole?: string;
    userStatus?: number;
    username?: string;
  };

  type AnimeAddReq = {
    name: string;
    intro?: string;
    issueTime?: string;
    month?: number;
    isNew: number;
    status?: string;
    actRole?: string[];
    director?: string;
    language?: string;
    type: number;
    fileId?: number;
    kindIds?: number[];
  };
  type Seriess = {
    id?: number;
    name?: string;
    seasonTitle?: string;
  };
  type AnimeIndexResp = {
    id?: number;
    name?: string;
    another?: string;
    intro?: string;
    issueTime?: string;
    month?: number;
    isNew?: number;
    status?: string;
    actRole?: string[];
    director?: string;
    language?: string;
    score?: number;
    number?: number;
    type?: number;
    folder?: number;
    kind?: string[];
    videos?: AnimeVideosResp[];
    image?: string;
    createTime?: string;
    updateTime?: string;
    lookVideoId?: number;
    seek?: number;
    /**
     * 用户对该动漫的评分
     */
    userScore?: number;
    ratingId?: number;
    playCount?: number;
    series?: Seriess[];
    seasonTitle?: string;
    seriesId?: number;
    isCollect?: number;
  };

  type AnimeQueryReq = {
    current?: number;
    pageSize?: number;
    sortField?: string;
    sortOrder?: string;
    name?: string;
    intro?: string;
    month?: number;
    isNew?: number;
    actRole?: string;
    director?: string;
    language?: string;
    type?: number;
    kind?: string;
    startTime?: string;
    endTime?: string;
  };

  type AnimeUpdateReq = {
    id?: number;
    name: string;
    intro?: string;
    issueTime?: string;
    month?: number;
    isNew: number;
    status?: string;
    actRole?: string[];
    director?: string;
    language?: string;
    type: number;
    kindIds?: number[];
  };

  type AnimeVideosReq = {
    animeId: number;
    title: string;
    rank: number;
  };
  type VideoRecordAddReq = {
    animeId?: number;
    videoId?: number;
    seek?: number;
  };

  type AnimeVideosResp = {
    id?: number;
    animeId?: number;
    title?: string;
    rank?: number;
    file?: number;
    fileUrl?: string;
    image: string;
    crateTime?: string;
    duration?: number;
    seek?: number;
    tuozhan?: FileNodes; // 前端专属字段
  };

  type BaseResponseAnimeIndexResp = {
    code?: number;
    data?: AnimeIndexResp;
    message?: string;
  };

  type BaseResponseAnimeVideosResp = {
    code?: number;
    data?: AnimeVideosResp;
    message?: string;
  };

  type BaseResponseBoolean = {
    code?: number;
    data?: boolean;
    message?: string;
  };

  type BaseResponseInteger = {
    code?: number;
    data?: number;
    message?: string;
  };

  type BaseResponseListAnimeIndexResp = {
    code?: number;
    data?: AnimeIndexResp[];
    message?: string;
  };

  type BaseResponseLoginResult = {
    code?: number;
    data?: LoginResult;
    message?: string;
  };

  type BaseResponseLong = {
    code?: number;
    data?: number;
    message?: string;
  };

  type BaseResponsePageAnimeIndexResp = {
    code?: number;
    data?: PageAnimeIndexResp;
    message?: string;
  };

  type BaseResponseUserVO = {
    code?: number;
    data?: UserVO;
    message?: string;
  };

  type deleteUsersParams = {
    id: number;
  };

  type getAnimeByIdParams = {
    id: number;
  };

  type getParams = {
    videoId: number;
  };

  type getPictureUrlParams = {
    kind: string;
    id: number;
    name: string;
  };

  type LoginResult = {
    status?: string;
    type?: string;
  };

  type mergeVideoParams = {
    animeId: number;
    fileName: string;
    fileSuffix: string;
    videoId: number;
  };

  type PageAnimeIndexResp = {
    records?: AnimeIndexResp[];
    pageNumber?: number;
    pageSize?: number;
    totalPage?: number;
    totalRow?: number;
    optimizeCountQuery?: boolean;
  };

  type updateAnimePictureParams = {
    id: number;
  };
  type uploadVideoPicture = {
    animeId: number;
    videoId: number;
  };

  type uploadVideoParams = {
    animeId: number;
    videoId: number;
    fileSuffix: string;
    duration?: number;
    fileName: string;
    partNumber: number;
    total: number;
  };
  type uploadIndexParams = {
    animeId: number;
    fileName: string;
  };

  type UserLoginRequest = {
    userAccount?: string;
    userPassword?: string;
  };

  type UserVO = {
    id?: number;
    username?: string;
    userAccount?: string;
    userAvatar?: string;
    profile?: string;
    gender?: number;
    phone?: string;
    email?: string;
    userRole?: string;
    userStatus?: number;
    createTime?: string;
  };

  type video2Params = {
    videoId: number;
  };

  type HuaType = {
    id: number | undefined;
    type: any;
  };
  type PageVideoRecordResp = {
    records?: VideoRecordResp[];
    pageNumber?: number;
    pageSize?: number;
    totalPage?: number;
    totalRow?: number;
    optimizeCountQuery?: boolean;
  };
  type VideoRecordResp = {
    id?: number;
    userId?: number;
    animeId?: number;
    name?: string;
    videoId?: number;
    rank?: number;
    title?: string;
    updateTime?: string;
    seek?: number;
    image?: string;
    duration?: number;
  };
  type RecordRequest = {
    current?: number;
    pageSize?: number;
    sortField?: string;
    sortOrder?: string;
    key?: string;
  };
  type RatingUpdateReq = {
    id?: number;
    animeId: number;
    score: number;
    oldScore?: number;
    comment?: string;
  };
  type RatingAddReq = {
    animeId: number;
    score: number;
    comment?: string;
  };
  type UserRating = {
    comment: string;
  };
  type PageCommentResp = {
    records?: CommentResp[];
    pageNumber?: number;
    pageSize?: number;
    totalPage?: number;
    totalRow?: number;
    optimizeCountQuery?: boolean;
  };
  // 前端自定义的嵌套评论信息
  type CommentInfo = {
    id?: number;
    animeId?: number;
    videoId?: number;
    originId?: number;
    parentId?: number;
    content?: string;
    user?: UserComment;
    createTime?: string;
    likeCount?: number;
    replyCount?: number;
    status?: number;
    isLike?: number;
    children?: CommentInfo[];
  };
  // 一条的评论的信息
  type CommentResp = {
    id?: number;
    animeId?: number;
    videoId?: number;
    parentId?: number;
    originId?: number;
    content?: string;
    user?: UserComment;
    createTime?: string;
    likeCount?: number;
    replyCount?: number;
    status?: number;
    isLike?: number;
  };
  type UserComment = {
    userId?: number;
    username?: string;
    userAvatar?: string;
    userRole?: string;
  };
  type queryCommentParams = {
    videoId: number;
    oid?: number;
    pageNumber: number;
    pageSize: number;
    sortField?: string;
    sortOrder?: string;
  };
  type CommentAddReq = {
    animeId: number;
    videoId: number;
    parentId?: number;
    originId?: number;
    content: string;
  };
  type AddCommentResp = {
    id: number;
    sentimentScore: number;
  };
  type deleteCommentParams = {
    cid: number;
  };
  type unlikeParams = {
    thirdId: number;
    type: number;
  };
  type likeParams = {
    thirdId: number;
    /**
     * 1-评论
     * 2-弹幕
     * 3-评分
     */
    type: number;
  };

  interface CursorPage {
    maxCursor: number;
    hasNext: boolean;
  }

  type CursorPageBarrageResp = {
    maxCursor: number;
    hasNext: boolean;
    data?: BarrageResp[];
  };
  type BarrageResp = {
    id?: number;
    videoId?: number;
    userId?: number;
    content?: string;
    timestamp?: number;
    createTime?: string;
    style?: BarStyle;
    status?: number;
  };
  type BarStyle = {
    color: string;
    position: number;
  };
  type BarrageAddReq = {
    videoId: number | string;
    content: string;
    timestamp: number;
    style: BarStyle;
  };
  type getBarragesParams = {
    videoId: number;
    maxCursor: number;
  };
  type addCountParams = {
    animeId: number;
  };
  type Scrape = {
    isAll: string;
    name: string;
    url: string;
    img: string;
    competeStatus: number; // 0-未开始/结束失败，1-进行中，2-结束成功
    id: number;
  };
  type detail = {
    isTrue: number;
    res: {
      code: number;
      data: number;
      message: string;
    };
  };
  type getOneParams = {
    seriesId: number;
  };
  type SeriesResp = {
    id?: number;
    name?: string;
    intro?: string;
    image?: string;
    animeList?: AnimeIndexResp[];
  };
  type SeriesUpReq = {
    id: number;
    name: string;
    intro?: string;
  };
  type SeriesAddAnimeReq = {
    id?: number;
    animes?: Seriess[];
  };
  type SeriesAddReq = {
    name: string;
    intro?: string;
    animes?: Seriess[];
  };
  type deleteSeriesParams = {
    seriesId: number;
  };
  type pageQueryParams = {
    pageNum: number;
    pageSize: number;
    name: string;
  };
  type listQueryParams = {
    name: string;
  };
  type PageSeriesResp = {
    records?: SeriesResp[];
    pageNumber?: number;
    pageSize?: number;
    totalPage?: number;
    totalRow?: number;
    optimizeCountQuery?: boolean;
  };

  type PageCollections = {
    records?: Collections[];
    pageNumber?: number;
    pageSize?: number;
    totalPage?: number;
    totalRow?: number;
    optimizeCountQuery?: boolean;
  };
  type Collections = {
    id?: number;
    title?: string;
    userId?: number;
    sort?: number;
    count?: number;
    image?: string;
    isDefault?: number;
    createTime?: string;
    updateTime?: string;
  };
  type CollectionsAddReq = {
    title: string;
    sort?: number;
  };
  type PageCollectionInResp = {
    records?: CollectionInResp[];
    pageNumber?: number;
    pageSize?: number;
    totalPage?: number;
    totalRow?: number;
    optimizeCountQuery?: boolean;
  };
  type CollectionInResp = {
    cid?: number;
    createTime?: string;
    id?: number;
    name?: string;
    another?: string;
    image?: string;
  };
  type collectionsAnimeParams = {
    cid: number;
    current: number;
    pageSize: number;
    key: string;
  };
  type collectionsAnimeAddParams = {
    cid: number;
    aid: number;
  };
  type collectionsAnimeIsParams = {
    aid: number;
  };
  type collectionsAnimeRemoveParams = {
    aId: number;
    cId: number;
  };
  type collectionsRemoveParams = {
    cid: number;
  };
  type CollectionsUpdateReq = {
    id: number;
    title: string;
  };
  type collectionsParams = {
    current: number;
    pageSize: number;
  };
  type addSensitiveWordParams = {
    word: string;
  };
  type SensitiveQueryReq = {
    page?: number;
    pageSize?: number;
    keyword?: string;
  };
  type SensitiveQueryResp = {
    data?: string[];
    total?: number;
    page?: number;
    page_size?: number;
  };
  type SensitiveUpdateReq = {
    oldWord?: string;
    newWord?: string;
  };
  // 审核
  type queryPageParams = {
    page: number;
    pageSize: number;
    status: number;
    keyword: string;
  };
  type ReportAddReq = {
    thirdType?: number;
    thirdId?: number;
    type?: number;
    reason?: string;
    reasonDetail?: string;
  };
  type PageContentReviewQueryResp = {
    records?: ContentReviewQueryResp[];
    pageNumber?: number;
    pageSize?: number;
    totalPage?: number;
    totalRow?: number;
    optimizeCountQuery?: boolean;
  };
  type ContentReviewQueryResp = {
    thirdType?: number;
    thirdId?: number;
    reportCount?: number;
    content?: string;
    reason?: string;
    publishBy?: number;
    publishUser?: UserMsg;
    reviewerId?: number;
    reviewer?: UserMsg;
    latestReportTime?: string;
    firstReportTime?: string;
    processedTime?: string;
    status?: number;
    latestType?: number;
  };
  type queryRecordPageParams = {
    page: number;
    pageSize: number;
    thirdId: number;
    thirdType: number;
  };
  type PageReportRecordResp = {
    records?: ReportRecordResp[];
    pageNumber?: number;
    pageSize?: number;
    totalPage?: number;
    totalRow?: number;
    optimizeCountQuery?: boolean;
  };
  type ReportRecordResp = {
    id?: number;
    thirdType?: number;
    thirdId?: number;
    reportBy?: number;
    reportUser?: UserMsg;
    type?: number;
    reason?: string;
    reportTime?: string;
    reasonDetail?: string;
  };
  type reviewParams = {
    thirdId?: number;
    thirdType?: number;
    status?: number;
    accType?: number;
  };
  type UserMsg = {
    userId?: number;
    username?: string;
    userAvatar?: string;
  };
  type addParams = {
    huaType: string;
  };
  type FileResp = {
    id?: number;
    parentId?: number;
    name?: string;
    nodeType?: string;
    fullPath?: string;
    size?: number;
    filePath?: string;
    fileType?: string;
    createdAt?: string;
    updatedAt?: string;
  };
  type FileNodes = {
    id?: number;
    parentId?: number;
    name?: string;
    nodeType?: string;
    fullPath?: string;
    size?: number;
    filePath?: string;
    fileType?: string;
    createdAt?: string;
    updatedAt?: string;
  };
  type listParams = {
    id: number;
  };
}

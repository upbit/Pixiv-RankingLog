//
//  PixivAPI.h
//
//  Created by Zhou Hao on 14-10-8.
//  Copyright (c) 2014 Zhou Hao. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "PixivDefines.h"

#define DEPRECATED_API __attribute__((deprecated))

@interface PixivAPI : NSObject

@property (strong, nonatomic) NSString *access_token;
@property (strong, nonatomic) NSString *session;
@property (nonatomic) NSInteger user_id;

@property (strong, nonatomic) NSOperationQueue *operationQueue;

#pragma mark - common

+ (PixivAPI *)sharedInstance;
- (instancetype)init;

/**
 *  Async run operation in Queue, and then call onCompletion
 *
 *  @param queuePriority     set 0 for NSOperationQueuePriorityNormal
 *  @param mainOperations    code block for sync(blocking) api
 *  @param onCompletion      completion block on mainQueue
 */
- (void)asyncBlockingQueue:(void (^)(void))mainOperations;
- (void)asyncBlockingQueue:(NSOperationQueuePriority)queuePriority operations:(void (^)(void))mainOperations;
/**
 *  Wait all operations (by asyncBlockingQueue:) are finished
 */
- (void)asyncWaitAllOperationsAreFinished:(void (^)(void))onCompletion;

/**
 *  Run operation in mainQueue, it was short for [NSOperationQueue mainQueue] addOperationWithBlock:
 */
- (void)onMainQueue:(void (^)(void))operationBlock;

/**
 *  API Fetch URL
 *
 *  @param method  HTTP/HTTPS method (GET or POST)
 *  @param url     base url
 *  @param headers header for request
 *  @param params  url encode params for GET/POST
 *  @param data    payload for POST
 *
 *  @return _buildResponse: encoded NSDictionary
 */
- (NSDictionary *)URLFetch:(NSString *)method url:(NSString *)url
                   headers:(NSDictionary *)headers params:(NSDictionary *)params data:(NSDictionary *)data;

#pragma mark - login

/**
 *  login
 *  oauth.secure.pixiv.net/auth/token
 *
 *  @return json dictionary from auth/token
 */
- (NSDictionary *)login:(NSString *)username password:(NSString *)password;

/**
 *  login (if local auth expired)
 *
 *  @return YES - success; NO - error
 */
- (BOOL)loginIfNeeded:(NSString *)username password:(NSString *)password;
- (BOOL)loadAuthFromUserDefaults:(NSString *)username;
- (void)dropAuthFromUserDefaults;

/**
 *  Set session string for PHPSESSID (get PHPSESSID from api.session)
 *
 *  @param access_token [last AccessToken from api.access_token]
 *  @param session      [last PHPSESSID from api.session]
 *
 */
- (void)set_auth:(NSString *)access_token session:(NSString *)session;

#pragma mark - Public-API exports

/**
 *  作品详细
 *  works/<illust_id>.json
 *
 *  @return PAPIIllust
 */
- (PAPIIllust *)PAPI_works:(NSInteger)illust_id;

/**
 *  用户资料
 *  users/<author_id>.json
 *
 *  @return PAPIAuthor
 */
- (PAPIAuthor *)PAPI_users:(NSInteger)author_id;

/**
 *  我的订阅
 *  me/feeds.json
 *
 *  @param show_r18         NO - hide r18 illusts
 *
 *  @return PAPIIllustList
 */
- (PAPIIllustList *)PAPI_me_feeds:(BOOL)show_r18;

/**
 *  用户作品列表
 *  users/<author_id>/works.json
 *
 *  @param page             [1-n]
 *  @param publicity        YES - public; NO - private (only auth user)
 *
 *  @return PAPIIllustList
 */
- (PAPIIllustList *)PAPI_users_works:(NSInteger)author_id page:(NSInteger)page publicity:(BOOL)publicity;

/**
 *  用户收藏
 *  users/<author_id>/favorite_works.json
 *
 *  @param page             [1-n]
 *  @param publicity        YES - public; NO - private (only auth user)
 *
 *  @return PAPIIllustList
 */
- (PAPIIllustList *)PAPI_users_favorite_works:(NSInteger)author_id page:(NSInteger)page publicity:(BOOL)publicity;

/**
 *  (写)新增收藏
 *
 *  @param illust_id        [id for work]
 *  @param publicity        YES - public; NO - private (only auth user)
 *
 *  @return favorite_id for delete
 */
- (NSInteger)PAPI_add_favorite_works:(NSInteger)illust_id publicity:(BOOL)publicity;

/**
 *  (写)取消收藏
 *
 *  @param favorite_id      id return form PAPI_add_favorite_works:
 *
 *  @return YES - success
 */
- (BOOL)PAPI_del_favorite_works:(NSInteger)favorite_id;

/**
 *  排行榜/过去排行榜
 *  ranking/all
 *
 *  @param mode             [daily, weekly, monthly, male, female, rookie, daily_r18, weekly_r18, male_r18, female_r18, r18g]
 *  @param page             [1-n]
 *  @param date             '2015-04-01' (* ranking_log)
 *
 *  @return PAPIIllustList
 */
- (PAPIIllustList *)PAPI_ranking_all:(NSString *)mode page:(NSInteger)page;
- (PAPIIllustList *)PAPI_ranking_log:(NSString *)mode page:(NSInteger)page date:(NSString *)date;

@end

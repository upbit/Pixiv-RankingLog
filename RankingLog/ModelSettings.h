//
//  ModelSettings.h
//  RankingLog
//
//  Created by Zhou Hao on 14/10/30.
//  Copyright (c) 2014年 Zhou Hao. All rights reserved.
//

#import <Foundation/Foundation.h>

@interface ModelSettings : NSObject

@property (strong, nonatomic) NSString *mode;
@property (strong, nonatomic) NSDate *date;
@property (strong, nonatomic) NSString *username;
@property (strong, nonatomic) NSString *password;
@property (nonatomic) BOOL isChanged;               // YES - if mode/date is changed

@property (nonatomic) BOOL isExportToDocuments;
@property (nonatomic) BOOL isExportToPhotosAlbum;
@property (nonatomic) BOOL isShowLargeImage;

@property (nonatomic) NSInteger pageLimit;

@property (strong, nonatomic) NSArray *bookmarkArray;        // of PAPI_illust

+ (ModelSettings *)sharedInstance;

// 当前日期前移ago秒
- (void)updateDateIntervalAgo:(NSTimeInterval)ago;

- (BOOL)loadSettingFromUserDefaults;
- (void)saveSettingToUserDefaults;
- (void)clearSettingFromUserDefaults;

- (BOOL)insertBookmarkWithIllust:(id)illust atIndex:(NSUInteger)index;
- (BOOL)addBookmarkWithIllust:(id)illust;
- (BOOL)removeBookmarkWithIllustId:(NSInteger)illust_id;
- (BOOL)loadBookmarkArrayFromUserDefaults;
- (void)saveBookmarkArrayToUserDefaults;
- (void)clearBookmarkArrayFromUserDefaults;

@end

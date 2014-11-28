//
//  ModelSettings.m
//  RankingLog
//
//  Created by Zhou Hao on 14/10/30.
//  Copyright (c) 2014年 Zhou Hao. All rights reserved.
//

#import "ModelSettings.h"
#import "PixivAPI.h"

#define UD_RANKINGLOG_KEY           @"rankinglog"
#define UD_RANKINGLOG_BOOKMARKS     @"rankinglog_bookmarks"
#define DEFAULT_PIXIV_FETCH_PAGE    (3)

@interface ModelSettings()

@end

@implementation ModelSettings

+ (ModelSettings *)sharedInstance
{
    static dispatch_once_t onceToken;
    static ModelSettings *instance = nil;
    dispatch_once(&onceToken, ^{
        instance = [[ModelSettings alloc] init];
    });
    return instance;
}

- (instancetype)init
{
    self = [super init];
    if (self) {
        self.isChanged = NO;
    }
    return self;
}

#pragma mark - functions

- (void)setMode:(NSString *)mode
{
    if ((!_mode) || (![_mode isEqualToString:mode])) {
        _mode = mode;
        self.isChanged = YES;
    }
}

- (void)setDate:(NSDate *)date
{
    if ((!_date) || ([_date compare:date] != NSOrderedSame)) {
        _date = date;
        self.isChanged = YES;
    }
}

- (void)setUsername:(NSString *)username
{
    _username = username;
    self.isChanged = YES;
}

- (void)setPassword:(NSString *)password
{
    _password = password;
    self.isChanged = YES;
}

- (void)updateDateIntervalAgo:(NSTimeInterval)ago
{
    self.date = [self.date dateByAddingTimeInterval: -ago];
    NSLog(@"update date to %@", self.date);
    [self saveSettingToUserDefaults];
}

#pragma mark - NSUserDefaults load / save

- (BOOL)loadSettingFromUserDefaults
{
    NSDictionary *setting_storage = [[NSUserDefaults standardUserDefaults] objectForKey:UD_RANKINGLOG_KEY];
    if (!setting_storage) {
        //NSLog(@"NSUserDefaults key %@ not found", UD_RANKINGLOG_KEY);
        return NO;
    }
    
    self.username = setting_storage[@"user"];
    if (!self.username) self.username = @"";
    self.password = setting_storage[@"pass"];
    if (!self.password) self.password = @"";
    
    self.mode = setting_storage[@"mode"];
    self.date = setting_storage[@"date"];
    self.isChanged = NO;
    
    self.isExportToDocuments = [setting_storage[@"to_documents"] boolValue];
    self.isExportToPhotosAlbum = [setting_storage[@"to_album"] boolValue];
    self.isShowLargeImage = [setting_storage[@"large_image"] boolValue];
    
    if (setting_storage[@"page_limit"]) {
        self.pageLimit = [setting_storage[@"page_limit"] integerValue];
    } else {
        self.pageLimit = DEFAULT_PIXIV_FETCH_PAGE;
    }
    
    return YES;
}

- (void)saveSettingToUserDefaults
{
    NSDictionary *setting_storage = @{
        @"user": self.username,
        @"pass": self.password,
        @"mode": self.mode,
        @"date": self.date,
        @"to_documents": @(self.isExportToDocuments),
        @"to_album": @(self.isExportToPhotosAlbum),
        @"large_image": @(self.isShowLargeImage),
        @"page_limit": @(self.pageLimit),
    };
    
    [[NSUserDefaults standardUserDefaults] setObject:setting_storage forKey:UD_RANKINGLOG_KEY];
    [[NSUserDefaults standardUserDefaults] synchronize];
}

- (void)clearSettingFromUserDefaults
{
    [[NSUserDefaults standardUserDefaults] removeObjectForKey:UD_RANKINGLOG_KEY];
    [[NSUserDefaults standardUserDefaults] synchronize];
}

#pragma mark - NSUserDefaults bookmarks

- (NSInteger)_safeGetAPIIllustId:(id)raw_illust
{
    if ([raw_illust isKindOfClass:[SAPIIllust class]]) {
        SAPIIllust *illust = (SAPIIllust *)raw_illust;
        return illust.illustId;
    } else if ([raw_illust isKindOfClass:[PAPIIllust class]]) {
        PAPIIllust *illust = (PAPIIllust *)raw_illust;
        return illust.illust_id;
    } else {
        NSLog(@"Uknown illust type: %@", raw_illust);
    }
    return 0;
}

// NO - if illust already exist
- (BOOL)insertBookmarkWithIllust:(id)illust atIndex:(NSUInteger)index
{
    NSMutableArray *bookmarks = [[NSMutableArray alloc] initWithArray:[ModelSettings sharedInstance].bookmarkArray];
    NSInteger new_illust_id = [self _safeGetAPIIllustId:illust];
    
    for (id bookmark_illust in bookmarks) {
        NSInteger bookmark_illust_id = [self _safeGetAPIIllustId:bookmark_illust];
        
        if (new_illust_id == bookmark_illust_id) {
            // already exist
            return NO;
        }
    }
    
    NSLog(@"add local bookmark %ld", (long)new_illust_id);
    [bookmarks insertObject:illust atIndex:index];
    [ModelSettings sharedInstance].bookmarkArray = bookmarks;
    return YES;
}

- (BOOL)addBookmarkWithIllust:(id)illust
{
    NSMutableArray *bookmarks = [[NSMutableArray alloc] initWithArray:[ModelSettings sharedInstance].bookmarkArray];
    NSInteger new_illust_id = [self _safeGetAPIIllustId:illust];
    
    for (id bookmark_illust in bookmarks) {
        NSInteger bookmark_illust_id = [self _safeGetAPIIllustId:bookmark_illust];
        
        if (new_illust_id == bookmark_illust_id) {
            // already exist
            return NO;
        }
    }
    
    NSLog(@"add local bookmark %ld", (long)new_illust_id);
    [bookmarks addObject:illust];
    [ModelSettings sharedInstance].bookmarkArray = bookmarks;
    return YES;
}

// YES - if remove illust success
- (BOOL)removeBookmarkWithIllustId:(NSInteger)illust_id
{
    NSMutableArray *bookmarks = [[NSMutableArray alloc] initWithArray:[ModelSettings sharedInstance].bookmarkArray];
    
    BOOL found = NO;
    for (NSUInteger i = 0; i < bookmarks.count; i++) {
        NSInteger bookmark_illust_id = [self _safeGetAPIIllustId:bookmarks[i]];
        if (illust_id == bookmark_illust_id) {
            // found
            NSLog(@"remove local bookmark %ld", (long)bookmark_illust_id);
            
            [bookmarks removeObjectAtIndex:i];
            found = YES;
        }
    }

    if (found) {
        [ModelSettings sharedInstance].bookmarkArray = bookmarks;
    }
    return found;
}

- (BOOL)loadBookmarkArrayFromUserDefaults {
    NSData *bookmark_storage = [[NSUserDefaults standardUserDefaults] objectForKey:UD_RANKINGLOG_BOOKMARKS];
    if (!bookmark_storage) {
        return NO;
    }
    
    self.bookmarkArray = [NSKeyedUnarchiver unarchiveObjectWithData:bookmark_storage];
    return YES;
}

- (void)saveBookmarkArrayToUserDefaults {
    NSData *bookmark_storage = [NSKeyedArchiver archivedDataWithRootObject:self.bookmarkArray];
    [[NSUserDefaults standardUserDefaults] setObject:bookmark_storage forKey:UD_RANKINGLOG_BOOKMARKS];
    [[NSUserDefaults standardUserDefaults] synchronize];
}

- (void)clearBookmarkArrayFromUserDefaults
{
    self.bookmarkArray = nil;
    [[NSUserDefaults standardUserDefaults] removeObjectForKey:UD_RANKINGLOG_BOOKMARKS];
    [[NSUserDefaults standardUserDefaults] synchronize];
}

@end

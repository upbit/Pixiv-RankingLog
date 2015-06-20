//
//  RankingLogWaterfallViewController.m
//  RankingLog
//
//  Created by Zhou Hao on 14/10/30.
//  Copyright (c) 2014年 Zhou Hao. All rights reserved.
//

#import "RankingLogWaterfallViewController.h"
#import <SVProgressHUD/SVProgressHUD.h>

#import "ModelSettings.h"
#import "DatePickerViewController.h"
#import "PixivDetailScrollImageViewController.h"
#import "BookmarksWaterfallViewController.h"

#import "AppDelegate.h"
#import "PixivAPI.h"

@interface RankingLogWaterfallViewController ()
@property (nonatomic) NSInteger currentPage;
@end

@implementation RankingLogWaterfallViewController

- (void)updateTitle
{
    NSDateFormatter *dateFormat = [[NSDateFormatter alloc] init];
    dateFormat.locale = [[NSLocale alloc] initWithLocaleIdentifier:@"zh_CN"];
    dateFormat.dateFormat = @"yyyy-MM-dd";
    
    NSString *title = [NSString stringWithFormat:@"%@:p%ld/%ld - [%@]", [ModelSettings sharedInstance].mode,
                       (long)self.currentPage, (long)[ModelSettings sharedInstance].pageLimit,
                       [dateFormat stringFromDate:[ModelSettings sharedInstance].date]];
    if (![ModelSettings sharedInstance].isShowLargeImage) {
        title = [title stringByAppendingString:@" (M)"];
    }
    
    __weak RankingLogWaterfallViewController *weakSelf = self;
    [[PixivAPI sharedInstance] onMainQueue:^{
        weakSelf.navigationItem.title = title;
    }];
}

- (void)goPriorRankingRound
{
    NSString *mode = [ModelSettings sharedInstance].mode;
    
    if ([mode isEqualToString:@"weekly"] || [mode isEqualToString:@"weekly_r18"]) {
        [[ModelSettings sharedInstance] updateDateIntervalAgo:7*86400.0];
    } else if ([mode isEqualToString:@"monthly"]) {
        [[ModelSettings sharedInstance] updateDateIntervalAgo:30*86400.0];
    } else {
        [[ModelSettings sharedInstance] updateDateIntervalAgo:86400.0];
    }
    
    [ModelSettings sharedInstance].isChanged = NO;
    self.currentPage = 0;
}

- (NSArray *)fetchNextRankingLog
{
    self.currentPage += 1;
    [self updateTitle];
    
    NSString *mode = [ModelSettings sharedInstance].mode;
    NSDateFormatter *dateFormatter1 = [[NSDateFormatter alloc] init];
    [dateFormatter1 setDateFormat:@"yyyy-MM-dd"];
    NSString *formattedStringDate = [dateFormatter1 stringFromDate:[ModelSettings sharedInstance].date];

    PAPIIllustList *resultList = [[PixivAPI sharedInstance] PAPI_ranking_log:mode page:self.currentPage date:formattedStringDate];
    NSLog(@"get RankingLog(%@, %@, page=%ld) return %ld works", mode, formattedStringDate, (long)self.currentPage, (long)resultList.illusts.count);
    
    if ((resultList.next == -1) ||     // 已经没有更多数据
        (self.currentPage >= [ModelSettings sharedInstance].pageLimit)) {   // 翻页达到深度限制
        [self goPriorRankingRound];
    }
    
    return resultList.illusts;
}

- (void)asyncGetRankingLog
{
    __weak RankingLogWaterfallViewController *weakSelf = self;
    [ApplicationDelegate setNetworkActivityIndicatorVisible:YES];
    [[PixivAPI sharedInstance] asyncBlockingQueue:^{
        
        NSArray *PAPI_illusts = [weakSelf fetchNextRankingLog];
        [[PixivAPI sharedInstance] onMainQueue:^{
            [ApplicationDelegate setNetworkActivityIndicatorVisible:NO];
            if (PAPI_illusts) {
                weakSelf.illusts = [weakSelf.illusts arrayByAddingObjectsFromArray:PAPI_illusts];
            } else {
                NSLog(@"fetchNextRankingLog: failed.");
            }
        }];
        
    }];
}

- (void)loginAndRefreshView
{
    self.illusts = @[];
    self.currentPage = 0;
    
    __weak RankingLogWaterfallViewController *weakSelf = self;
    
    [SVProgressHUD showWithStatus:@"Login..." maskType:SVProgressHUDMaskTypeBlack];
    
    [[PixivAPI sharedInstance] asyncBlockingQueue:^{
        NSString *username = [ModelSettings sharedInstance].username;
        NSString *password = [ModelSettings sharedInstance].password;
        BOOL success = [[PixivAPI sharedInstance] loginIfNeeded:username password:password];
        
        [[PixivAPI sharedInstance] onMainQueue:^{
            if (!success) {
                [SVProgressHUD showErrorWithStatus:@"Login failed! Check your pixiv ID and password."];
                return;
            }
            
            [SVProgressHUD dismiss];
            [weakSelf asyncGetRankingLog];
        }];
    }];
}

- (void)viewDidLoad
{
    [super viewDidLoad];

    //[[ModelSettings sharedInstance] clearSettingFromUserDefaults];
    
    if (![[ModelSettings sharedInstance] loadSettingFromUserDefaults]) {
        // 第一次进入先跳转设置页卡
        [self performSegueWithIdentifier:@"DatePickerSegue" sender:self];
    } else {
        [self loginAndRefreshView];
    }
    
    [self.navigationItem.leftBarButtonItem setEnabled:NO];
}

- (void)viewDidAppear:(BOOL)animated
{
    [super viewDidAppear:animated];
    
    if ([ModelSettings sharedInstance].isChanged) {
        // 发生过变化，重新刷新RankingLog
        NSLog(@"refresh RankingLog");
        [ModelSettings sharedInstance].isChanged = NO;
        
        [self loginAndRefreshView];
    }
    
    [self updateTitle];
    
    if ([[ModelSettings sharedInstance].mode rangeOfString:@"r18"].location != NSNotFound) {
        [self.navigationItem.leftBarButtonItem setEnabled:YES];
    } else {
        [self.navigationItem.leftBarButtonItem setEnabled:NO];
    }
}

- (void)prepareForSegue:(UIStoryboardSegue *)segue sender:(id)sender
{
    if ([segue.identifier isEqualToString:@"ImageDetail"]) {
        if ([segue.destinationViewController isKindOfClass:[PixivDetailScrollImageViewController class]]) {
            PixivDetailScrollImageViewController *ivc = (PixivDetailScrollImageViewController *)segue.destinationViewController;
            NSArray *indexPaths = [self.collectionView indexPathsForSelectedItems];
            NSIndexPath *indexPath = [indexPaths objectAtIndex:0];
            ivc.illusts = self.illusts;
            ivc.index = indexPath.row;
        }
        
    } else if ([segue.identifier isEqualToString:@"DatePickerSegue"]) {
        if ([segue.destinationViewController isKindOfClass:[DatePickerViewController class]]) {
            DatePickerViewController *dpvc = (DatePickerViewController *)segue.destinationViewController;
            // modeArray for RankingLog
            dpvc.modeArray = @[
                @"daily", @"weekly", @"monthly", @"male", @"female", @"rookie",
                @"daily_r18", @"weekly_r18", @"male_r18", @"female_r18", @"r18g",
            ];
        }
        
    } else if ([segue.identifier isEqualToString:@"BookmarkSegue"]) {
        if ([segue.destinationViewController isKindOfClass:[BookmarksWaterfallViewController class]]) {
            BookmarksWaterfallViewController *bvc = (BookmarksWaterfallViewController *)segue.destinationViewController;
            bvc.user_id = [PixivAPI sharedInstance].user_id;
        }
        
    }
}

#pragma mark - UICollectionView

- (UICollectionViewCell *)collectionView:(UICollectionView *)collectionView cellForItemAtIndexPath:(NSIndexPath *)indexPath
{
    if (indexPath.row == [self.illusts count]-1) {
        // fetch next
        [self asyncGetRankingLog];
    }
    return [super collectionView:collectionView cellForItemAtIndexPath:indexPath];
}

@end

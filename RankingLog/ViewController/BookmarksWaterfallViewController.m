//
//  BookmarksWaterfallViewController.m
//  RankingLog
//
//  Created by Zhou Hao on 14/11/3.
//  Copyright (c) 2014年 Zhou Hao. All rights reserved.
//

#import "BookmarksWaterfallViewController.h"
#import "PixivDetailScrollImageViewController.h"
#import <SVProgressHUD/SVProgressHUD.h>

#import "AppDelegate.h"
#import "PixivAPI.h"
#import "ModelSettings.h"

@interface BookmarksWaterfallViewController ()
@property (nonatomic) NSInteger nextPage;
@end

@implementation BookmarksWaterfallViewController

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

- (BOOL)mergeBookmarksWithArray:(NSArray *)newArray
{
    BOOL isMerged = NO;
    for (id raw_illust in newArray) {
        BOOL success = [[ModelSettings sharedInstance] addBookmarkWithIllust:raw_illust];
        if (!success) {
            NSLog(@"Found exist illust=%@, stop merge.", raw_illust);
            break;
        }
        
        isMerged = YES;
    }
    return isMerged;
}

- (void)updateTitleWithPagination:(NSInteger)current pages:(NSInteger)pages
{
    __weak BookmarksWaterfallViewController *weakSelf = self;
    [[PixivAPI sharedInstance] onMainQueue:^{
        weakSelf.navigationItem.title = [NSString stringWithFormat:@"Fetching page: %ld/%ld ...", (long)current, (long)pages];
    }];
}

- (NSArray *)fetchNextBookmarks
{
    if (self.nextPage <= 0)
        return nil;
    if (self.user_id <= 0) {
        NSLog(@"Invalid user_id: %ld", (long)self.user_id);
        return nil;
    }
    
    PAPIIllustList *PAPI_illusts = [[PixivAPI sharedInstance] PAPI_users_favorite_works:self.user_id page:self.nextPage publicity:YES];
    [self updateTitleWithPagination:PAPI_illusts.current pages:PAPI_illusts.pages];
    
    NSLog(@"get Bookmarks: return %ld works, next page %ld", (long)PAPI_illusts.count, (long)PAPI_illusts.next);
    
    self.nextPage = PAPI_illusts.next;
    return PAPI_illusts.illusts;
}

- (void)asyncGetAllBookmarks
{
    __weak BookmarksWaterfallViewController *weakSelf = self;
    [ApplicationDelegate setNetworkActivityIndicatorVisible:YES];
    [[PixivAPI sharedInstance] asyncBlockingQueue:^{
        
        // fetch all
        while (1) {
            NSArray *PAPI_illusts = [weakSelf fetchNextBookmarks];
            if (PAPI_illusts) {
                if ([weakSelf mergeBookmarksWithArray:PAPI_illusts ]) {
                    // merged some data, update UI
                    [[PixivAPI sharedInstance] onMainQueue:^{
                        weakSelf.illusts = [ModelSettings sharedInstance].bookmarkArray;
                    }];
                } else {
                    // not data merge, fetch next
                    
                }
                
            } else {
                NSLog(@"fetchNextBookmarks(page=%ld): failed.", (long)weakSelf.nextPage);
                weakSelf.nextPage = -1;
            }

            if (weakSelf.nextPage <= 0) {
                // nextPage invaild
                break;
            }

            // random delay
            NSTimeInterval timedelay = (float)(15 + arc4random() % 35) / 10;
            NSLog(@"delay %.1f for page %ld", timedelay, (long)weakSelf.nextPage);
            [NSThread sleepForTimeInterval:timedelay];
        }
        
        // end
        [[PixivAPI sharedInstance] onMainQueue:^{
            [ApplicationDelegate setNetworkActivityIndicatorVisible:NO];
            weakSelf.navigationItem.title = [NSString stringWithFormat:@"Bookmarks (%lu works)",
                                             (unsigned long)[ModelSettings sharedInstance].bookmarkArray.count];
            
            [SVProgressHUD showSuccessWithStatus:@"Fetch Bookmarks success!"];
        }];
        
        // sync bookmark data
        [[ModelSettings sharedInstance] saveBookmarkArrayToUserDefaults];
    }];
}

- (void)viewDidLoad {
    [super viewDidLoad];
    // Do any additional setup after loading the view.
    
    if ([ModelSettings sharedInstance].bookmarkArray) {
        self.illusts = [ModelSettings sharedInstance].bookmarkArray;
        self.navigationItem.title = [NSString stringWithFormat:@"Bookmarks (%lu works)", (unsigned long)self.illusts.count];
    } else {
        // try add new bookmark
        self.nextPage = 1;
        [self asyncGetAllBookmarks];
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
    }
}
/*
#pragma mark - UICollectionView

- (UICollectionViewCell *)collectionView:(UICollectionView *)collectionView cellForItemAtIndexPath:(NSIndexPath *)indexPath
{
    if (indexPath.row == [self.illusts count]-1) {
        // end
    }
    return [super collectionView:collectionView cellForItemAtIndexPath:indexPath];
}
*/
#pragma mark - UI

- (NSArray *)randomizedArray:(NSArray *)array
{
    NSMutableArray *results = [NSMutableArray arrayWithArray:array];
    int i = (int)[results count];
    while (--i > 0) {
        int j = arc4random() % (i+1);
        [results exchangeObjectAtIndex:i withObjectAtIndex:j];
    }
    return [NSArray arrayWithArray:results];
}

- (IBAction)randomIllustArray:(UIBarButtonItem *)sender
{
    self.illusts = [self randomizedArray:self.illusts];
    [self reloadCollectionViewWithAnimated:YES];
}

@end

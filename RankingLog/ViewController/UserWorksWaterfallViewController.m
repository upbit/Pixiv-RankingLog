//
//  UserWorksWaterfallViewController.m
//  RankingLog
//
//  Created by Zhou Hao on 14/11/5.
//  Copyright (c) 2014年 Zhou Hao. All rights reserved.
//

#import "UserWorksWaterfallViewController.h"
#import "PixivDetailScrollImageViewController.h"

#import "AppDelegate.h"
#import "PixivAPI.h"

@interface UserWorksWaterfallViewController ()
@property (nonatomic) NSInteger currentPage;
@property (nonatomic) BOOL fetchEnd;
@end

@implementation UserWorksWaterfallViewController

- (void)updateTitle
{
    NSString *author_title = @"";
    
    id raw_illust = [self.illusts firstObject];
    if ([raw_illust isKindOfClass:[SAPIIllust class]]) {
        SAPIIllust *illust = (SAPIIllust *)raw_illust;
        author_title = [NSString stringWithFormat:@"%@(%ld)", illust.authorName, (long)illust.authorId];
    } else if ([raw_illust isKindOfClass:[PAPIIllust class]]) {
        PAPIIllust *illust = (PAPIIllust *)raw_illust;
        author_title = [NSString stringWithFormat:@"%@(%ld)", illust.name, (long)illust.author_id];
    } else {
        return;
    }
    
    if (!self.fetchEnd) {
        author_title = [author_title stringByAppendingString:[NSString stringWithFormat:@" - p%ld", (long)self.currentPage]];
    } else {
        author_title = [author_title stringByAppendingString:[NSString stringWithFormat:@" - %ld works", (long)self.illusts.count]];
    }
    
    self.navigationItem.title = author_title;
}

- (NSArray *)fetchNextAuthorIllusts
{
    if (self.author_id <= 0) {
        NSLog(@"Invalid author_id: %ld", (long)self.author_id);
        return nil;
    }
    
    self.currentPage += 1;
    
    PAPIIllustList *resultList = [[PixivAPI sharedInstance] PAPI_users_works:self.author_id page:self.currentPage publicity:YES];

    NSLog(@"get member_illust(%ld, page=%ld): return %ld works", (long)self.author_id, (long)self.currentPage, (long)resultList.illusts.count);

    return resultList.illusts;
}

- (void)asyncGetAuthorIllusts
{
    if (self.fetchEnd)
        return;
    
    __weak UserWorksWaterfallViewController *weakSelf = self;
    [ApplicationDelegate setNetworkActivityIndicatorVisible:YES];
    [[PixivAPI sharedInstance] asyncBlockingQueue:^{
        
        NSArray *SAPI_illusts = [weakSelf fetchNextAuthorIllusts];
        [[PixivAPI sharedInstance] onMainQueue:^{
            [ApplicationDelegate setNetworkActivityIndicatorVisible:NO];
            if (SAPI_illusts) {
                if (SAPI_illusts.count > 0) {
                    weakSelf.illusts = [weakSelf.illusts arrayByAddingObjectsFromArray:SAPI_illusts];
                } else {
                    weakSelf.fetchEnd = YES;
                }
                [weakSelf updateTitle];
            } else {
                NSLog(@"fetchNextAuthorIllusts: failed.");
            }
        }];
        
    }];
}

- (void)viewDidLoad {
    [super viewDidLoad];
    // Do any additional setup after loading the view.
    
    self.currentPage = 0;
    self.fetchEnd = NO;
    
    [self asyncGetAuthorIllusts];
}

- (void)prepareForSegue:(UIStoryboardSegue *)segue sender:(id)sender
{
    if ([segue.identifier isEqualToString:@"UserImageDetail"]) {
        if ([segue.destinationViewController isKindOfClass:[PixivDetailScrollImageViewController class]]) {
            PixivDetailScrollImageViewController *ivc = (PixivDetailScrollImageViewController *)segue.destinationViewController;
            NSArray *indexPaths = [self.collectionView indexPathsForSelectedItems];
            NSIndexPath *indexPath = [indexPaths objectAtIndex:0];
            ivc.illusts = self.illusts;
            ivc.index = indexPath.row;
        }
    }
}

#pragma mark - UICollectionView

- (UICollectionViewCell *)collectionView:(UICollectionView *)collectionView cellForItemAtIndexPath:(NSIndexPath *)indexPath
{
    if (indexPath.row == [self.illusts count]-1) {
        // fetch next
        [self asyncGetAuthorIllusts];
    }
    return [super collectionView:collectionView cellForItemAtIndexPath:indexPath];
}

@end

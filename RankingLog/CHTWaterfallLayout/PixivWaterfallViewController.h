//
//  PixivWaterfallViewController.h
//  Pixiv
//
//  Created by Zhou Hao on 14-10-11.
//  Copyright (c) 2014年 Zhou Hao. All rights reserved.
//

#import <UIKit/UIKit.h>

#import <SDWebImage/UIImageView+WebCache.h>
#import "CHTCollectionViewCell.h"

@interface PixivWaterfallViewController : UICollectionViewController

@property (strong, nonatomic) NSArray *illusts;
- (NSInteger)safeGetIllustId:(NSInteger)index;

- (void)reloadCollectionViewWithAnimated:(BOOL)animated;

@end

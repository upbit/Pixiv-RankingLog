//
//  RCTExNetworkImageManager.m
//  RCTExImage
//
//  Created by 郭栋 on 15/7/9.
//  Copyright (c) 2015年 guodong. All rights reserved.
//

#import "RCTExNetworkImageManager.h"

#import "RCTExNetworkImage.h"
#import <SDWebImage/SDImageCache.h>

#import "RCTBridge.h"
#import "RCTConvert.h"
#import "RCTUtils.h"

@implementation RCTExNetworkImageManager

RCT_EXPORT_MODULE()

- (UIView *)view {
    return [[RCTExNetworkImage alloc] initWithBridge:self.bridge];
}

RCT_REMAP_VIEW_PROPERTY(defaultImageSrc, defaultImage, UIImage)
RCT_REMAP_VIEW_PROPERTY(src, imageURL, NSURL)
RCT_REMAP_VIEW_PROPERTY(resizeMode, contentMode, UIViewContentMode)

RCT_EXPORT_VIEW_PROPERTY(loadingBackgroundColor, UIColor)
RCT_EXPORT_VIEW_PROPERTY(loadingForegroundColor, UIColor)
RCT_EXPORT_VIEW_PROPERTY(progressIndicate, BOOL)

RCT_EXPORT_METHOD(calculateCacheSize:(RCTResponseSenderBlock)callback) {
    SDImageCache *cache = [SDImageCache sharedImageCache];
    NSInteger size = [cache getSize];
    callback(@[@(size)]);
}

RCT_EXPORT_METHOD(clearCache:(RCTResponseSenderBlock)callback) {
    [[SDImageCache sharedImageCache] clearDiskOnCompletion:^{
        callback(@[]);
    }];
}

- (NSArray *)customDirectEventTypes {
    return @[@"exLoadStart", @"exLoadProgress", @"exLoadError", @"exLoaded"];
}

@end

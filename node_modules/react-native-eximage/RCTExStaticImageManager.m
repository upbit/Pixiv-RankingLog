//
//  RCTExStaticImageManager.m
//  RCTExImage
//
//  Created by 郭栋 on 15/7/8.
//  Copyright (c) 2015年 guodong. All rights reserved.
//

#import "RCTExStaticImageManager.h"

#import <UIKit/UIKit.h>
#import <SDWebImage/UIImage+GIF.h>
#import <SDWebImage/SDImageCache.h>

#import "RCTConvert.h"
#import "RCTExImageLoader.h"
#import "RCTExStaticImage.h"
#import "RCTBridge.h"
#import "RCTExImageLoader.h"

@implementation RCTExStaticImageManager

RCT_EXPORT_MODULE()

- (UIView *)view {
    return [[RCTExStaticImage alloc] init];
}

RCT_EXPORT_VIEW_PROPERTY(capInsets, UIEdgeInsets)
RCT_REMAP_VIEW_PROPERTY(resizeMode, contentMode, UIViewContentMode)
RCT_CUSTOM_VIEW_PROPERTY(src, NSURL, RCTExStaticImage)
{
    if (json) {
        if ([[[json description] pathExtension] caseInsensitiveCompare:@"gif"] == NSOrderedSame) {
//            [view.layer addAnimation:RCTGIFImageWithFileURL([RCTConvert NSURL:json]) forKey:@"contents"];
            NSData *data = [[NSData alloc] initWithContentsOfURL:[RCTConvert NSURL:json]];
            view.image = [UIImage sd_animatedGIFWithData:data];
        } else {
//            [view.layer removeAnimationForKey:@"contents"];
            view.image = [RCTConvert UIImage:json];
        }
    } else {
//        [view.layer removeAnimationForKey:@"contents"];
        view.image = defaultView.image;
    }
}
RCT_CUSTOM_VIEW_PROPERTY(tintColor, UIColor, RCTExStaticImage)
{
    if (json) {
        view.renderingMode = UIImageRenderingModeAlwaysTemplate;
        view.tintColor = [RCTConvert UIColor:json];
    } else {
        view.renderingMode = defaultView.renderingMode;
        view.tintColor = defaultView.tintColor;
    }
}
RCT_CUSTOM_VIEW_PROPERTY(imageInfo, NSDictionary, RCTExStaticImage)
{
    if (json) {
        NSDictionary *info = [RCTConvert NSDictionary:json];
        
        NSNumber *maxSize = nil;
        BOOL cacheThumbnail = ((NSNumber *)info[@"cacheThumbnail"]).boolValue;
        NSInteger prezWidth = ((NSNumber *)info[@"prezSize"][@"width"]).integerValue;
        NSInteger prezHeight = ((NSNumber *)info[@"prezSize"][@"height"]).integerValue;
        if (prezWidth > 0 || prezHeight > 0) {
            maxSize = [NSNumber numberWithInteger:MAX(prezWidth, prezHeight) * [UIScreen mainScreen].scale];
        }
        [RCTExImageLoader loadImageWithTag:info[@"imageTag"]
                                   maxSize:maxSize
                            cacheThumbnail:cacheThumbnail
                                  callback:^(NSError *error, id image) {
                                      if (error) {
                                          RCTLogWarn(@"%@", error.localizedDescription);
                                      }
                                      view.image = image;
        }];
    } else {
        view.image = defaultView.image;
    }
}

RCT_EXPORT_METHOD(clearThumbnailCache:(RCTResponseSenderBlock)callback) {
    [[RCTExImageLoader thumbnailCache] clearDiskOnCompletion:^{
        callback(@[]);
    }];
}

@end

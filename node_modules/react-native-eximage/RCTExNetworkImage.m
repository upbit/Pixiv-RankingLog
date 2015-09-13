//
//  RCTExNetworkImage.m
//  RCTExImage
//
//  Created by 郭栋 on 15/7/9.
//  Copyright (c) 2015年 guodong. All rights reserved.
//

#import "RCTExNetworkImage.h"

#import <UIKit/UIKit.h>
#import <SDWebImage/UIImageView+WebCache.h>

#import "RCTConvert.h"
#import "RCTUtils.h"
#import "UIView+React.h"
#import "RCTBridge.h"
#import "RCTEventDispatcher.h"

#import "CircleProgressIndicator.h"

#define kProgressSize 100

@implementation RCTExNetworkImage
{
    RCTBridge *_bridge;
    
    UIImageView *_imageView;
    NSURL *_imageURL;
    id<SDWebImageOperation> _downloadToken;
    BOOL _deferred;
    NSURL *_deferredImageURL;
    NSUInteger _deferSentinel;
    
    CircleProgressIndicator *_progressIndicator;
    UITapGestureRecognizer *_gestureReognizer;
    
    BOOL _canRetry;
    BOOL _downloaded;
}

@synthesize imageURL = _imageURL;
@synthesize progressIndicate = _progressIndicate;

- (instancetype)initWithBridge:(RCTBridge *)bridge {
    self = [super initWithFrame:CGRectZero];
    if (self) {
        _bridge = bridge;
        _canRetry = NO;
        _downloaded = NO;
        
        _gestureReognizer = [[UITapGestureRecognizer alloc] initWithTarget:self action:@selector(handleSingleTap:)];
        [self addGestureRecognizer:_gestureReognizer];
        
        self.contentMode = UIViewContentModeScaleAspectFill;
        _imageView = [[UIImageView alloc] initWithFrame:CGRectZero];
        [_imageView setBackgroundColor:[UIColor clearColor]];
        [self addSubview:_imageView];
        
        _progressIndicator = [[CircleProgressIndicator alloc] init];
        [self addSubview:_progressIndicator];
    }
    return self;
}

- (void)layoutSubviews {
    [super layoutSubviews];
    if (_imageView.superview == self) {
        _imageView.frame = self.bounds;
    }
    if (_progressIndicator.superview == self) {
        _progressIndicator.frame = self.bounds;
    }
}

- (void)reactSetFrame:(CGRect)frame
{
    [super reactSetFrame:frame];
}

- (void)handleSingleTap:(UITapGestureRecognizer *)recognizer {
    [self retry];
}

- (void)setProgressIndicate:(BOOL)progressIndicate {
    _progressIndicate = progressIndicate;
    if (progressIndicate && !_progressIndicator.superview) {
        [self addSubview:_progressIndicator];
    } else if (!progressIndicate && _progressIndicator.superview) {
        [_progressIndicator removeFromSuperview];
    }
}

- (void)setDefaultImage:(UIImage *)defaultImage {
    _defaultImage = defaultImage;
    if (!_downloaded) {
        _imageView.image = defaultImage;
    }
}

- (void)setLoadingBackgroundColor:(UIColor *)loadingBackgroundColor {
    _progressIndicator.backgroundColor = loadingBackgroundColor;
}

- (void)setLoadingForegroundColor:(UIColor *)loadingForegroundColor {
    _progressIndicator.foregroundColor = loadingForegroundColor;
}

- (void)setContentMode:(UIViewContentMode)contentMode {
    [super setContentMode:contentMode];
    _imageView.contentMode = contentMode;
}

- (void)setImageURL:(NSURL *)imageURL {
    _canRetry = NO;
    if (![imageURL isEqual:_imageURL] && _downloadToken) {
        [_downloadToken cancel];
        _downloadToken = nil;
    }
    
    if (_deferred) {
        _deferredImageURL = imageURL;
    } else {
        if (!imageURL) {
            if (!_defaultImage) {
                _imageView.image = nil;
            }
            return;
        }
        
        _imageURL = imageURL;
        
        if (!_defaultImage) {
            _imageView.image = nil;
        }
        [_progressIndicator setProgress:0.0];
        [self addSubview:_progressIndicator];
        
        [_bridge.eventDispatcher sendInputEventWithName:@"exLoadStart" body:@{@"target": self.reactTag}];
        
        SDWebImageManager *manager = [SDWebImageManager sharedManager];
        _downloaded = NO;
        [manager downloadImageWithURL:_imageURL
                              options:SDWebImageRetryFailed
                             progress:^(NSInteger receivedSize, NSInteger expectedSize) {
                                 CGFloat progress = ((CGFloat)receivedSize) / expectedSize;
                                 [_progressIndicator setProgress:progress];
                                 
                                 NSDictionary *event = @{
                                                         @"target": self.reactTag,
                                                         @"written": @(receivedSize),
                                                         @"total": @(expectedSize)
                                                         };
                                 [_bridge.eventDispatcher sendInputEventWithName:@"exLoadProgress" body:event];
                             }
                            completed:^(UIImage *image, NSError *error, SDImageCacheType cacheType, BOOL finished, NSURL *imageURL) {
                                _downloaded = YES;
                                if (image) {
                                    _imageView.image = image;
                                    [_progressIndicator removeFromSuperview];
                                    
                                    [_bridge.eventDispatcher sendInputEventWithName:@"exLoaded" body:@{@"target": self.reactTag}];
                                } else {
                                    _canRetry = YES;
                                    [_progressIndicator removeFromSuperview];
                                    if (!_defaultImage) {
                                        _imageView.image = nil;
                                    }
                                    NSDictionary *event = @{
                                                            @"target": self.reactTag,
                                                            @"error": error.description
                                                            };
                                    [_bridge.eventDispatcher sendInputEventWithName:@"exLoadError" body:event];
                                }
                            }];
    }
}

- (void)retry {
    if (_canRetry) {
        [self setImageURL:_imageURL];
    }
}

- (void)willMoveToWindow:(UIWindow *)newWindow
{
    [super willMoveToWindow:newWindow];
    if (newWindow != nil && _deferredImageURL) {
        // Immediately exit deferred mode and restore the imageURL that we saved when we went offscreen.
        [self setImageURL:_deferredImageURL];
        _deferredImageURL = nil;
    }
}

- (void)_enterDeferredModeIfNeededForSentinel:(NSUInteger)sentinel
{
    if (self.window == nil && _deferSentinel == sentinel) {
        _deferred = YES;
        [_downloadToken cancel];
        _downloadToken = nil;
        _deferredImageURL = _imageURL;
        _imageURL = nil;
    }
}

- (void)didMoveToWindow
{
    [super didMoveToWindow];
    if (self.window == nil) {
        __weak RCTExNetworkImage *weakSelf = self;
        NSUInteger sentinelAtDispatchTime = ++_deferSentinel;
        dispatch_after(dispatch_time(DISPATCH_TIME_NOW, NSEC_PER_SEC), dispatch_get_main_queue(), ^(void){
            [weakSelf _enterDeferredModeIfNeededForSentinel:sentinelAtDispatchTime];
        });
    }
}

@end

//
//  RCTExNetworkImage.h
//  RCTExImage
//
//  Created by 郭栋 on 15/7/9.
//  Copyright (c) 2015年 guodong. All rights reserved.
//

#import <UIKit/UIKit.h>

#import "RCTBridge.h"

@interface RCTExNetworkImage : UIView

/**
 * An image that will appear while the view is loading the image from the network,
 * or when imageURL is nil. Defaults to nil.
 */
@property (nonatomic, strong) UIImage *defaultImage;

/**
 * Specify a URL for an image. The image will be asynchronously loaded and displayed.
 */
@property (nonatomic, strong) NSURL *imageURL;

@property (nonatomic) UIColor *loadingBackgroundColor;

@property (nonatomic) UIColor *loadingForegroundColor;

@property (nonatomic) BOOL progressIndicate;

- (instancetype)initWithBridge:(RCTBridge *)bridge;

@end

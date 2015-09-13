//
//  RCTExStaticImageView.h
//  RCTExImage
//
//  Created by 郭栋 on 15/7/8.
//  Copyright (c) 2015年 guodong. All rights reserved.
//

#import <UIKit/UIKit.h>

@interface RCTExStaticImage : UIImageView

@property (nonatomic, assign) UIEdgeInsets capInsets;
@property (nonatomic, assign) UIImageRenderingMode renderingMode;
@property (nonatomic) BOOL cacheThumbnail;

@end

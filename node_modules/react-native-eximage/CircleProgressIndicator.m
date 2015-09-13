//
//  CircleProgressIndicator.m
//  RCTExImage
//
//  Created by 郭栋 on 15/7/9.
//  Copyright (c) 2015年 guodong. All rights reserved.
//

#import "CircleProgressIndicator.h"

#define kProgressSize 30

@implementation CircleProgressIndicator
{
    CAShapeLayer *_maskLayer;
    CAShapeLayer *_progressLayer;
    CABasicAnimation *_progressAnimation;
}

- (instancetype)init {
    self = [super initWithFrame:CGRectZero];
    if (self) {
        [self _setUp];
    }
    return self;
}

- (instancetype)initWithFrame:(CGRect)frame {
    self = [super initWithFrame:CGRectZero];
    if (self) {
        [self _setUp];
    }
    return self;
}

- (void)layoutSubviews {
    [super layoutSubviews];
    [self _updateLayersFrame];
}

- (void)setProgress:(CGFloat)progress {
    if (progress > 1.0) {
        progress = 1.0;
    }
    _progress = progress;
    
    _progressLayer.strokeEnd = progress;
//    [_progressLayer removeAllAnimations];
//    CABasicAnimation *animation = [CABasicAnimation animationWithKeyPath:@"strokeEnd"];
//    animation.toValue = [NSNumber numberWithFloat:progress];
//    animation.duration = 0.1;
//    animation.removedOnCompletion = NO;
//    animation.additive = YES;
//    animation.fillMode = kCAFillModeForwards;
//    animation.delegate = self;
//    [_progressLayer addAnimation:animation forKey:@"strokeEnd"];
}

- (void)animationDidStop:(CAAnimation *)anim finished:(BOOL)flag {
    
}

- (void)setBackgroundColor:(UIColor *)backgroundColor {
    _backgroundColor = backgroundColor;
    _progressLayer.backgroundColor = backgroundColor.CGColor;
}

- (void)setForegroundColor:(UIColor *)foregroundColor {
    _foregroundColor = foregroundColor;
    _progressLayer.strokeColor = foregroundColor.CGColor;
}

- (void)_setUp {
    [self _initProgressLayers];
    [self _updateLayersFrame];
}

- (void)_initProgressLayers {
    _progressLayer = [CAShapeLayer layer];
    _progressLayer.backgroundColor = [UIColor clearColor].CGColor;
    _progressLayer.fillColor = nil;
    _progressLayer.strokeColor = [UIColor blackColor].CGColor;
    _progressLayer.lineWidth = 2.0;
    _progressLayer.lineCap = kCALineCapRound;
    _progressLayer.strokeStart = 0.0;
    _progressLayer.strokeEnd = 0.0;
    _progressLayer.allowsEdgeAntialiasing = YES;
    
    _maskLayer = [CAShapeLayer layer];
    _maskLayer.backgroundColor = [UIColor clearColor].CGColor;
    _maskLayer.fillColor = nil;
    _maskLayer.strokeColor = [UIColor blackColor].CGColor;
    _maskLayer.lineWidth = 2.0;
    _maskLayer.lineCap = kCALineCapRound;
    _maskLayer.strokeStart = 0.0;
    _maskLayer.strokeEnd = 1.0;
    _maskLayer.allowsEdgeAntialiasing = YES;
    
    _progressLayer.mask = _maskLayer;
    [self.layer addSublayer:_progressLayer];
}

- (void)_updateLayersFrame {
    _progressLayer.frame = self.bounds;
    CGRect frame = CGRectMake((CGRectGetWidth(self.frame) - kProgressSize) / 2,
                              (CGRectGetHeight(self.frame) - kProgressSize) / 2,
                              kProgressSize, kProgressSize);
    
    CGFloat startAngle = -M_PI_2;
    CGFloat endAngle = M_PI_2 * 3;
    CGPoint centerPoint = CGPointMake(frame.origin.x + CGRectGetWidth(frame) / 2, frame.origin.y + CGRectGetHeight(frame) / 2);
    _maskLayer.path = [UIBezierPath bezierPathWithArcCenter:centerPoint
                                                         radius:CGRectGetWidth(frame) / 2
                                                     startAngle:startAngle
                                                       endAngle:endAngle
                                                      clockwise:true].CGPath;
    
    _progressLayer.path = [UIBezierPath bezierPathWithArcCenter:centerPoint
                                                           radius:CGRectGetWidth(frame) / 2
                                                       startAngle:startAngle
                                                         endAngle:endAngle
                                                        clockwise:true].CGPath;
}

@end

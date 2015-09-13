/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

#import "RCTExImageLoader.h"

#import <AssetsLibrary/AssetsLibrary.h>
#import <Photos/PHAsset.h>
#import <Photos/PHFetchResult.h>
#import <Photos/PHImageManager.h>
#import <UIKit/UIKit.h>
#import <SDWebImage/UIImage+GIF.h>
#import <SDWebImage/SDImageCache.h>

#import "RCTConvert.h"
#import "RCTLog.h"

#define kExImageThumbnailCacheNamespace @"ExImageThumbnailCacheNamespace"

static dispatch_queue_t RCTExImageLoaderQueue(void)
{
    static dispatch_queue_t queue = NULL;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        queue = dispatch_queue_create("com.facebook.RCTExImageLoader", DISPATCH_QUEUE_SERIAL);
    });
    
    return queue;
}

static NSError *RCTErrorWithMessage(NSString *message)
{
    NSDictionary *errorInfo = @{NSLocalizedDescriptionKey: message};
    NSError *error = [[NSError alloc] initWithDomain:RCTErrorDomain code:0 userInfo:errorInfo];
    return error;
}

static void RCTDispatchCallbackOnMainQueue(void (^callback)(NSError *, id), NSError *error, UIImage *image)
{
    if ([NSThread isMainThread]) {
        callback(error, image);
    } else {
        dispatch_async(dispatch_get_main_queue(), ^{
            callback(error, image);
        });
    }
}

static size_t getAssetBytesCallback(void *info, void *buffer, off_t position, size_t count) {
    ALAssetRepresentation *rep = (__bridge id)info;
    
    NSError *error = nil;
    size_t countRead = [rep getBytes:(uint8_t *)buffer fromOffset:position length:count error:&error];
    
    if (countRead == 0 && error) {
        // We have no way of passing this info back to the caller, so we log it, at least.
        NSLog(@"thumbnailForAsset:maxPixelSize: got an error reading an asset: %@", error);
    }
    
    return countRead;
}

static void releaseAssetCallback(void *info) {
    // The info here is an ALAssetRepresentation which we CFRetain in thumbnailForAsset:maxPixelSize:.
    // This release balances that retain.
    CFRelease(info);
}

@implementation RCTExImageLoader

+ (SDImageCache *)thumbnailCache {
    static SDImageCache *thumbnailCache = nil;
    static dispatch_once_t thumbnailCacheOnceToken;
    dispatch_once(&thumbnailCacheOnceToken, ^{
        thumbnailCache = [[SDImageCache alloc] initWithNamespace:kExImageThumbnailCacheNamespace];
    });
    return thumbnailCache;
}

+ (ALAssetsLibrary *)assetsLibrary
{
    static ALAssetsLibrary *assetsLibrary = nil;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        assetsLibrary = [[ALAssetsLibrary alloc] init];
    });
    return assetsLibrary;
}

// Returns a UIImage for the given asset, with size length at most the passed size.
// The resulting UIImage will be already rotated to UIImageOrientationUp, so its CGImageRef
// can be used directly without additional rotation handling.
// This is done synchronously, so you should call this method on a background queue/thread.
+ (UIImage *)thumbnailForAsset:(ALAsset *)asset maxPixelSize:(NSNumber *)size useCache:(BOOL)useCache {
    NSParameterAssert(asset != nil);
    NSParameterAssert(size > 0);
    
    SDImageCache *imageCache = [RCTExImageLoader thumbnailCache];
    UIImage *image = nil;
    NSString *cacheKey = [NSString stringWithFormat:@"%@&maxSize=%@", [asset valueForProperty:ALAssetPropertyAssetURL], size];
    if (useCache) {
        image = [imageCache imageFromMemoryCacheForKey:cacheKey];
        if (!image) {
            image = [imageCache imageFromDiskCacheForKey:cacheKey];
        }
        if (image) {
            return image;
        }
    }
    
    ALAssetRepresentation *rep = [asset defaultRepresentation];
    
    CGDataProviderDirectCallbacks callbacks = {
        .version = 0,
        .getBytePointer = NULL,
        .releaseBytePointer = NULL,
        .getBytesAtPosition = getAssetBytesCallback,
        .releaseInfo = releaseAssetCallback,
    };
    
    CGDataProviderRef provider = CGDataProviderCreateDirect((void *)CFBridgingRetain(rep), [rep size], &callbacks);
    CGImageSourceRef source = CGImageSourceCreateWithDataProvider(provider, NULL);
    
    NSDictionary *options = @{
                              (NSString *)kCGImageSourceCreateThumbnailFromImageAlways : @YES,
                              (NSString *)kCGImageSourceThumbnailMaxPixelSize : size,
                              (NSString *)kCGImageSourceCreateThumbnailWithTransform : @YES,
                              };
    CGImageRef imageRef = CGImageSourceCreateThumbnailAtIndex(source, 0, (__bridge CFDictionaryRef)options);
    CFRelease(source);
    CFRelease(provider);
    
    if (!imageRef) {
        return nil;
    }
    
    UIImage *toReturn = [UIImage imageWithCGImage:imageRef];
    
    CFRelease(imageRef);
    
    if (useCache) {
        [imageCache removeImageForKey:cacheKey];
        [imageCache storeImage:toReturn forKey:cacheKey];
    }
    
    return toReturn;
}


+ (void)loadImageWithTag:(NSString *)imageTag
                 maxSize:(NSNumber *)size
          cacheThumbnail:(BOOL)cacheThumbnail
                callback:(void (^)(NSError *, id))callback {
    if ([imageTag hasPrefix:@"assets-library"]) {
        [[RCTExImageLoader assetsLibrary] assetForURL:[NSURL URLWithString:imageTag] resultBlock:^(ALAsset *asset) {
            if (asset) {
                // ALAssetLibrary API is async and will be multi-threaded. Loading a few full
                // resolution images at once will spike the memory up to store the image data,
                // and might trigger memory warnings and/or OOM crashes.
                // To improve this, process the loaded asset in a serial queue.
                dispatch_async(RCTExImageLoaderQueue(), ^{
                    // Also make sure the image is released immediately after it's used so it
                    // doesn't spike the memory up during the process.
                    @autoreleasepool {
                        UIImage *image;
                        if (size) {
                            image = [self thumbnailForAsset:asset maxPixelSize:size useCache:cacheThumbnail];
                        } else {
                            ALAssetRepresentation *representation = [asset defaultRepresentation];
                            ALAssetOrientation orientation = [representation orientation];
                            image = [UIImage imageWithCGImage:[representation fullResolutionImage] scale:1.0f orientation:(UIImageOrientation)orientation];
                        }
                        RCTDispatchCallbackOnMainQueue(callback, nil, image);
                    }
                });
            } else {
                NSString *errorText = [NSString stringWithFormat:@"Failed to load asset at URL %@ with no error message.", imageTag];
                NSError *error = RCTErrorWithMessage(errorText);
                RCTDispatchCallbackOnMainQueue(callback, error, nil);
            }
        } failureBlock:^(NSError *loadError) {
            NSString *errorText = [NSString stringWithFormat:@"Failed to load asset at URL %@.\niOS Error: %@", imageTag, loadError];
            NSError *error = RCTErrorWithMessage(errorText);
            RCTDispatchCallbackOnMainQueue(callback, error, nil);
        }];
    } else if ([imageTag hasPrefix:@"ph://"]) {
        // Using PhotoKit for iOS 8+
        // 'ph://' prefix is used by FBMediaKit to differentiate between assets-library. It is prepended to the local ID so that it
        // is in the form of NSURL which is what assets-library is based on.
        // This means if we use any FB standard photo picker, we will get this prefix =(
        NSString *phAssetID = [imageTag substringFromIndex:[@"ph://" length]];
        PHFetchResult *results = [PHAsset fetchAssetsWithLocalIdentifiers:@[phAssetID] options:nil];
        if (results.count == 0) {
            NSString *errorText = [NSString stringWithFormat:@"Failed to fetch PHAsset with local identifier %@ with no error message.", phAssetID];
            NSError *error = RCTErrorWithMessage(errorText);
            RCTDispatchCallbackOnMainQueue(callback, error, nil);
            return;
        }
        
        PHAsset *asset = [results firstObject];
        [[PHImageManager defaultManager] requestImageForAsset:asset targetSize:PHImageManagerMaximumSize contentMode:PHImageContentModeDefault options:nil resultHandler:^(UIImage *result, NSDictionary *info) {
            if (result) {
                RCTDispatchCallbackOnMainQueue(callback, nil, result);
            } else {
                NSString *errorText = [NSString stringWithFormat:@"Failed to load PHAsset with local identifier %@ with no error message.", phAssetID];
                NSError *error = RCTErrorWithMessage(errorText);
                RCTDispatchCallbackOnMainQueue(callback, error, nil);
                return;
            }
        }];
    } else if ([[imageTag lowercaseString] hasSuffix:@".gif"]) {
        NSData *data = [[NSData alloc] initWithContentsOfURL:[NSURL URLWithString:imageTag]];
        UIImage *image = [UIImage sd_animatedGIFWithData:data];
        if (image) {
            RCTDispatchCallbackOnMainQueue(callback, nil, image);
        } else {
            NSString *errorMessage = [NSString stringWithFormat:@"Unable to load GIF image: %@", imageTag];
            NSError *error = RCTErrorWithMessage(errorMessage);
            RCTDispatchCallbackOnMainQueue(callback, error, nil);
        }
    } else {
        UIImage *image = [RCTConvert UIImage:imageTag];
        if (image) {
            RCTDispatchCallbackOnMainQueue(callback, nil, image);
        } else {
            NSString *errorMessage = [NSString stringWithFormat:@"Unrecognized tag protocol: %@", imageTag];
            NSError *error = RCTErrorWithMessage(errorMessage);
            RCTDispatchCallbackOnMainQueue(callback, error, nil);
        }
    }
}

/**
 * Can be called from any thread.
 * Will always call callback on main thread.
 */
+ (void)loadImageWithTag:(NSString *)imageTag callback:(void (^)(NSError *error, id image))callback
{
    [self loadImageWithTag:imageTag maxSize:nil cacheThumbnail:NO callback:callback];
}

@end

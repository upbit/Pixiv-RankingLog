#import "RCTPixivAPI.h"

@implementation RCTPixivAPI

RCT_EXPORT_MODULE()

RCT_EXPORT_METHOD(SAPI_ranking:(RCTResponseSenderBlock)callback
                  page:(NSInteger)page
                  mode:(NSString *)mode
                  content:(NSString *)content)
{
  NSMutableArray *results = [[NSMutableArray alloc] init];
  for (SAPIIllust *illust in [[PixivAPI sharedInstance] SAPI_ranking:page mode:mode content:content requireAuth:false]) {
    [results addObject:[illust toDataArray]];
  }
  callback(@[results]);
}

@end

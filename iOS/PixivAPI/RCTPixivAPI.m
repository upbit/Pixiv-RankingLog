#import "RCTPixivAPI.h"

@implementation RCTPixivAPI

RCT_EXPORT_MODULE()

RCT_EXPORT_METHOD(SAPI_ranking:(RCTResponseSenderBlock)callback
                  page:(NSInteger)page
                  mode:(NSString *)mode
                  content:(NSString *)content)
{
  NSMutableArray *results = [[NSMutableArray alloc] init];
  
  [[PixivAPI sharedInstance] loginIfNeeded:@"username" password:@"password"];
  
  PAPIIllust *illust = [[PixivAPI sharedInstance] PAPI_works:50025431];
  [results addObject:[illust toJsonString]];

  callback(@[results]);
}

@end

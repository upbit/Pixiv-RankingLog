#import "RCTPixivAPI.h"

#define JSON_STR(data) [RCTPixivAPI toJSONString:data]

@implementation RCTPixivAPI

RCT_EXPORT_MODULE()

RCT_EXPORT_METHOD(loginIfNeeded:(NSString *)username
                  password:(NSString *)password
                  callback:(RCTResponseSenderBlock)callback)
{
  BOOL success = [[PixivAPI sharedInstance] loginIfNeeded:username password:password];
  callback(@[[NSNumber numberWithBool:success]]);
}

RCT_EXPORT_METHOD(SAPI_ranking:(NSInteger)page
                  mode:(NSString *)mode
                  content:(NSString *)content
                  requireAuth:(BOOL)requireAuth
                  callback:(RCTResponseSenderBlock)callback)
{
  NSMutableArray *results = [[NSMutableArray alloc] init];
  
  NSArray *illusts = [[PixivAPI sharedInstance] SAPI_ranking:page mode:mode content:content requireAuth:requireAuth];
  for (SAPIIllust *illust in illusts) {
    [results addObject:[illust toObject]];
  }

  callback(@[JSON_STR(results)]);
}

#pragma mark - JSON helper

+ (NSString *)toJSONString:(id)data
{
  NSError *error;
  NSData *jsonData = [NSJSONSerialization dataWithJSONObject:data options:0 error:&error];
  return [[NSString alloc] initWithData:jsonData encoding:NSUTF8StringEncoding];
}

@end

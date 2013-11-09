{-# OPTIONS_GHC -fno-warn-orphans #-}
module Handler.UserById where

import Import

$(deriveJSON defaultOptions ''User)

getUserByIdR :: String -> Handler Value
getUserByIdR uId = runDB (selectFirst [UserIdent ==. (pack uId)] []) >>= returnJson

getFinishUserR :: String -> String -> String -> Handler Value
getFinishUserR email name city = do
    runDB $ updateWhere [UserIdent ==. (pack email)] [ UserName =. Just (pack name), UserCity =. Just (pack city) ]
    returnJson [ "status" .= ("ok" :: Text) ]

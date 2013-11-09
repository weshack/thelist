{-# OPTIONS_GHC -fno-warn-orphans #-}
module Handler.TransById where

import Import

$(deriveJSON defaultOptions ''Transaction)

getTransByIdR :: String -> Handler Value
getTransByIdR uIdent = do
  mUser <- runDB $ selectFirst [ UserIdent ==. (pack uIdent) ] []
  case mUser of
    Just user -> do
      trans <- runDB $ selectList [ TransactionVendor ==. (entityKey user) ] []
      returnJson trans
    Nothing -> return $ object [ "result" .= ("error" :: Text)]

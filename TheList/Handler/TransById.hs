{-# OPTIONS_GHC -fno-warn-orphans #-}
module Handler.TransById where

import Import

$(deriveJSON defaultOptions ''Transaction)

getTransByIdR :: TransactionId -> Handler Value
getTransByIdR tId = do 
  trans <- runDB $ get404 tId 
  returnJson trans

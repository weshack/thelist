{-# OPTIONS_GHC -fno-warn-orphans #-}
module Handler.UserById where

import Import

$(deriveJSON defaultOptions ''User)

getUserByIdR :: UserId -> Handler Value
getUserByIdR uId = runDB (get404 uId) >>= returnJson

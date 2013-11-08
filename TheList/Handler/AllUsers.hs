{-# OPTIONS_GHC -fno-warn-orphans #-}
module Handler.AllUsers where

import Import

$(deriveJSON defaultOptions ''User)

getAllUsersR :: Handler Value
getAllUsersR = do
    users <- runDB $ selectList [] [] :: Handler [Entity User]
    returnJson users

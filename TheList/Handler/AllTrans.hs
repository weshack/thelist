{-# OPTIONS_GHC -fno-warn-orphans #-}
module Handler.AllTrans where

import Import

$(deriveJSON defaultOptions ''Transaction)

getAllTransR :: Handler Value
getAllTransR = do
  trans <- runDB $ selectList [] [] :: Handler [Entity Transaction]
  returnJson trans

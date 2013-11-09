{-# OPTIONS_GHC -fno-warn-orphans #-}
module Handler.SearchTrans where

import Import

$(deriveJSON defaultOptions ''Transaction)

getSearchTransR :: String -> Handler Value
getSearchTransR query = do
  trans <- runDB $ selectList [] [] :: Handler [Entity Transaction]
  returnJson $ filter (\t -> isInfixOf query (((\s -> (unpack (transactionItem s)) ++ (unpack (transactionDescription s))) . entityVal) t)) trans

{-# OPTIONS_GHC -fno-warn-orphans #-}
module Handler.SearchTrans where

import Import
import Data.Char (toLower)

$(deriveJSON defaultOptions ''Transaction)

getSearchTransR :: String -> Handler Value
getSearchTransR query = do
  trans <- runDB $ selectList [] [] :: Handler [Entity Transaction]
  returnJson $ filter (\t -> isInfixOf (map toLower query) (((\s -> (map toLower $ unpack (transactionItem s)) ++ (map toLower $ unpack (transactionDescription s))) . entityVal) t)) trans

{-# OPTIONS_GHC -fno-warn-orphans #-}

module Handler.Rating where

import Import

$(deriveJSON defaultOptions ''Rating)

getRatingR :: String -> Handler Value
getRatingR uident = do
  user <- runDB $ selectFirst [ UserIdent ==. (pack uident) ] []
  case user of
    Just uid -> do
      ratings <- runDB $ selectList [ RatingReviewed ==. (entityKey uid) ] []
      let ratingNums = map ratingRating . map entityVal $ ratings
      let avgRating = (sum ratingNums) `div` (length ratingNums)
      returnJson [ "rating" .= avgRating ]
    Nothing -> returnJson [ "rating" .= (0 :: Int) ]

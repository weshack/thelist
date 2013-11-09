{-# OPTIONS_GHC -fno-warn-orphans #-}

module Handler.Rating where

import Import
import Data.Maybe (fromJust)
import Yesod.Auth (requireAuthId)

$(deriveJSON defaultOptions ''Rating)

getRatingR :: UserId -> Handler Value
getRatingR uId = do
  user <- runDB $ get uId
  case user of
    Just _ -> do
      ratings <- runDB $ selectList [ RatingReviewed ==. uId ] []
      let ratingNums = map ratingRating . map entityVal $ ratings
      let avgRating = if (length ratingNums) > 0 then (sum ratingNums) `div` (length ratingNums) else 0
      return $ object [ "rating" .= avgRating, "num_ratings" .= (length ratingNums) ]
    Nothing -> return $ object [ "rating" .= (0 :: Int), "num_ratings" .= (0 :: Int) ]

postAddRatingR :: Handler Value
postAddRatingR = do
    logged_in <- requireAuthId
    (PartialRating reviewed comments score) <- runInputPost $ PartialRating
        <$> ((fromJust . fromPathPiece) <$> ireq textField "Reviewed")
        <*> iopt textField "Comment" 
        <*> ireq intField "Rating" 
    prevRating <- runDB $ selectFirst [ RatingReviewed ==. reviewed, RatingReviewer ==. logged_in ] []
    case prevRating of
        Nothing -> do
            rId <- runDB $ insert (Rating logged_in reviewed comments score)
            return $ object [ "rating_id" .= rId ]
        Just _ ->
            return $ object [ "result" .= ("already reviewed" :: Text) ]

data PartialRating = PartialRating UserId (Maybe Text) Int


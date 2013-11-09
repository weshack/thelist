{-# OPTIONS_GHC -fno-warn-orphans #-}

module Handler.Rating where

import Import
import Data.Maybe (fromJust)
import Yesod.Auth (requireAuthId)

$(deriveJSON defaultOptions ''Rating)

getRatingR :: String -> Handler Value
getRatingR uident = do
  user <- runDB $ selectFirst [ UserIdent ==. (pack uident) ] []
  case user of
    Just uid -> do
      ratings <- runDB $ selectList [ RatingReviewed ==. (entityKey uid) ] []
      let ratingNums = map ratingRating . map entityVal $ ratings
      let avgRating = (sum ratingNums) `div` (length ratingNums)
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


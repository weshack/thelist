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
      returnJson [ "rating" .= avgRating ]
    Nothing -> returnJson [ "rating" .= (0 :: Int) ]

postAddRatingR :: Handler Value
postAddRatingR = do
    logged_in <- requireAuthId
    ((result,_),_) <- runFormPost ratingForm
    case result of
        FormSuccess (PartialRating reviewed comments score) -> do
            prevRating <- runDB $ selectFirst [ RatingReviewed ==. reviewed, RatingReviewer ==. logged_in ] []
            case prevRating of
                Nothing -> do
                    rId <- runDB $ insert (Rating logged_in reviewed comments score)
                    returnJson [ "rating_id" .= rId ]
                Just _ ->
                    returnJson [ "result" .= ("already reviewed" :: Text) ]
        _ -> returnJson [ "result" .= ("error" :: Text) ]

data PartialRating = PartialRating UserId (Maybe Text) Int

ratingForm :: Html -> MForm Handler (FormResult PartialRating, Widget)
ratingForm = renderTable ratingAForm

ratingAForm :: AForm Handler PartialRating
ratingAForm = PartialRating
    <$> ((fromJust . fromPathPiece) <$> areq textField "Reviewed" Nothing)
    <*> aopt textField "Comment" Nothing
    <*> areq intField "Rating" Nothing

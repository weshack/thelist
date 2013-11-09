{-# OPTIONS_GHC -fno-warn-orphans #-}

module Handler.Rating where

import Import
import Data.Maybe (fromJust)

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
    ((result,_),_) <- runFormPost ratingForm
    case result of
        FormSuccess rating -> do
            rId <- runDB $ insert rating
            returnJson [ "rating_id" .= rId ]
        _ -> returnJson [ "result" .= ("error" :: Text) ]

ratingForm :: Html -> MForm Handler (FormResult Rating, Widget)
ratingForm = renderTable ratingAForm

ratingAForm :: AForm Handler Rating
ratingAForm = Rating
    <$> ((fromJust . fromPathPiece) <$> areq textField "Reviewer" Nothing)
    <*> ((fromJust . fromPathPiece) <$> areq textField "Reviewed" Nothing)
    <*> aopt textField "Comment" Nothing
    <*> areq intField "Rating" Nothing

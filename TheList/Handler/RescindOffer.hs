{-# OPTIONS_GHC -fno-warn-orphans #-}
module Handler.RescindOffer where

import Import
import Yesod.Auth (requireAuthId)
import Data.Maybe (fromJust)

data PartialOffer = PartialOffer OfferId

offerAForm :: AForm Handler PartialOffer
offerAForm = PartialOffer <$> ((fromJust . fromPathPiece) <$> areq textField "Offer Id" Nothing)

offerForm :: Html -> MForm Handler (FormResult PartialOffer, Widget)
offerForm = renderTable offerAForm


postRescindOfferR :: Handler Value
postRescindOfferR = do
  logged_in <- requireAuthId
  ((result,_),_) <- runFormPost offerForm
  case result of
    FormSuccess (PartialOffer oId) -> do
      c <- runDB $ get404 oId
      case ((offerClient c) == logged_in) of
        True -> do
          runDB $ deleteWhere [ OfferId ==. oId ]
          returnJson $ object [ "result" .= ("ok" :: Text) ] 
        False -> returnJson $ object [ "result" .= ("error" :: Text) ]
    _ -> return $ object [ "result" .= ("error" :: Text) ]

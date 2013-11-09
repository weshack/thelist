{-# OPTIONS_GHC -fno-warn-orphans #-}

module Handler.Offers where

import Import
import Yesod.Auth (requireAuthId)
import Data.Maybe (fromJust)
import System.Time (getClockTime,ClockTime(TOD))

$(deriveJSON defaultOptions ''Offer)

getOffersR :: Handler Value
getOffersR = (runDB (selectList [] []) :: Handler [Entity Offer]) >>= returnJson

getOffersByIdR :: String -> Handler Value
getOffersByIdR user_ident = do
    mUser <- runDB $ selectFirst [ UserIdent ==. (pack user_ident) ] []
    case mUser of
       Just user -> do
           let uid = entityKey user
           offers <- runDB $ selectList [ OfferClient ==. uid ] []
           returnJson offers
       Nothing -> returnJson [ "result" .= ( "user not found" :: Text ) ]

getOffersForTransactionR :: TransactionId -> Handler Value
getOffersForTransactionR tId = do
    offers <- runDB $ selectList [ OfferTransaction ==. tId ] []
    returnJson offers

postAddOfferR :: Handler Value
postAddOfferR = do
    logged_in <- requireAuthId
    ((result,_),_) <- runFormPost offerForm
    case result of
        FormSuccess (PartialOffer transId toOffer) -> do
               rId <- runDB $ insert (Offer transId logged_in toOffer)
               returnJson [ "offer_id" .= rId ]
        _ -> returnJson [ "result" .= ("error" :: Text) ]

data PartialOffer = PartialOffer TransactionId Text

offerForm :: Html -> MForm Handler (FormResult PartialOffer, Widget)
offerForm = renderTable offerAForm

offerAForm :: AForm Handler PartialOffer
offerAForm = PartialOffer
    <$> ((fromJust . fromPathPiece) <$> areq textField "Transaction" Nothing)
    <*> areq textField "Offer" Nothing

getAcceptOfferR :: OfferId -> Handler Value
getAcceptOfferR oId = do
    logged_in <- requireAuthId
    offer <- runDB $ get404 oId
    transaction <- runDB $ get404 (offerTransaction offer)
    case ((transactionVendor transaction) == logged_in) of
        True -> do
            (TOD currTime _) <- liftIO getClockTime
            runDB $ update (offerTransaction offer) [ TransactionBestOffer =. (offerOffer offer), TransactionCompleted =. Just (fromInteger currTime )]
            returnJson [ "result" .= ("ok" :: Text) ]
        False -> returnJson [ "result" .= ("error" :: Text) ]
    


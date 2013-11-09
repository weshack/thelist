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
       Nothing -> return $ object [ "result" .= ( "user not found" :: Text ) ]

getOffersForTransactionR :: TransactionId -> Handler Value
getOffersForTransactionR tId = do
    offers <- runDB $ selectList [ OfferTransaction ==. tId ] []
    returnJson offers

postAddOfferR :: Handler Value
postAddOfferR = do
    logged_in <- requireAuthId
    (PartialOffer transId toOffer) <- runInputPost $ PartialOffer 
        <$> ((fromJust . fromPathPiece) <$> ireq textField "Transaction")
        <*> ireq textField "Offer" 
    rId <- runDB $ insert (Offer transId logged_in toOffer)
    return $ object [ "offer_id" .= rId ]

data PartialOffer = PartialOffer TransactionId Text

getAcceptOfferR :: OfferId -> Handler Value
getAcceptOfferR oId = do
    logged_in <- requireAuthId
    offer <- runDB $ get404 oId
    transaction <- runDB $ get404 (offerTransaction offer)
    case ((transactionVendor transaction) == logged_in) of
        True -> do
            (TOD currTime _) <- liftIO getClockTime
            runDB $ update (offerTransaction offer) [ TransactionBestOffer =. (offerOffer offer), TransactionCompleted =. Just (fromInteger currTime )]
            runDB $ deleteWhere [ OfferTransaction ==. (offerTransaction offer) ]
            return $ object [ "result" .= ("ok" :: Text) ]
        False -> return $ object [ "result" .= ("error" :: Text) ]
    

data PartialOffer' = PartialOffer' OfferId

postRescindOfferR :: Handler Value
postRescindOfferR = do
  logged_in <- requireAuthId
  (PartialOffer' oId) <- runInputPost $ PartialOffer' <$> ((fromJust . fromPathPiece) <$> ireq textField "Offer Id")
  c <- runDB $ get404 oId
  case ((offerClient c) == logged_in) of
    True -> do
      runDB $ deleteWhere [ OfferId ==. oId ]
      return $ object [ "result" .= ("ok" :: Text) ] 
    False -> return $ object [ "result" .= ("error" :: Text) ]

{-# OPTIONS_GHC -fno-warn-orphans #-}

module Handler.Offers where

import Import
import Yesod.Auth (requireAuthId)
import Data.Maybe (fromJust)
import System.Time (getClockTime,ClockTime(TOD))
import Text.Shakespeare.Text (stext)
import Network.Mail.Mime
import Data.Text.Lazy.Encoding (encodeUtf8)
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
            runDB $ update (offerTransaction offer) [ TransactionBestOffer =. (offerOffer offer), TransactionCompleted =. Just (fromInteger currTime ), TransactionClient =. Just (offerClient offer)]
            runDB $ deleteWhere [ OfferTransaction ==. (offerTransaction offer) ]
            user <- runDB $ get404 (transactionVendor transaction)
            emUser <- runDB $ get404 (offerClient offer)
            let email = userIdent user
            let name = fromJust . userName $ user
            let textPart = Part {
                  partType = "text/plain; charset=utf-8"
                , partEncoding = None
                , partFilename = Nothing
                , partContent = encodeUtf8 [stext|
                  Your offer has been accepted by #{name}.
                  Please contact him/her at #{email} to
                  finish the transaction.
                  Thank you.
                |]
                , partHeaders = []
              }
            liftIO $ renderSendMail (emptyMail $ Address Nothing "noreply")
                { mailTo = [Address Nothing (userIdent emUser)]
                , mailHeaders =
                [ ("Subject", "Your Offer Has Been Accepted")
                ]
                , mailParts = [[textPart]]
            }
            return $ object [ "result" .= ("ok" :: Text) ]
        False ->
            return $ object [ "result" .= ("error" :: Text) ]
        

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

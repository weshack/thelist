module Handler.Offers where

import Import

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

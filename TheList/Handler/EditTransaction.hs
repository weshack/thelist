module Handler.EditTransaction where

import Import
import Data.Maybe (fromJust)
import Yesod.Auth (requireAuthId)

postEditTransactionR :: Handler Value
postEditTransactionR = do
    logged_in <- requireAuthId
    ((result,_),_) <- runFormPost transactionForm
    case result of
        FormSuccess (PartialTransaction tId item description min_offer) -> do
            t <- runDB $ get404 tId
            case ((transactionVendor t) == logged_in) of
                True -> do
                    runDB $ update tId [TransactionItem =. item, TransactionBestOffer =. min_offer, TransactionDescription =. description ]
                    returnJson [ "result" .= ("ok" :: Text) ]
                False -> returnJson [ "result" .= ("error" :: Text) ]
        _ -> returnJson [ "result" .= ("error" :: Text) ]

data PartialTransaction = PartialTransaction TransactionId Text Text Text

transactionForm :: Html -> MForm Handler (FormResult PartialTransaction, Widget)
transactionForm = renderTable transactionAForm

transactionAForm :: AForm Handler PartialTransaction
transactionAForm = PartialTransaction
    <$> ((fromJust . fromPathPiece) <$> areq textField "Transaction Id" Nothing)
    <*> areq textField "Item" Nothing
    <*> areq textField "Description" Nothing
    <*> areq textField "Minimum Offer" Nothing


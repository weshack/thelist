module Handler.AddTransaction where

import Import
import Yesod.Auth (requireAuthId)
import Data.Maybe (fromJust)

postAddTransactionR :: Handler Value
postAddTransactionR = do
    logged_in <- requireAuthId
    ((result,_),_) <- runFormPost transactionForm
    case result of
        FormSuccess (PartialTransaction item description min_offer) -> do
                tId <- runDB $ insert (Transaction logged_in Nothing item  description min_offer Nothing)
                returnJson [ "transaction_id" .= tId ]
        _ -> return $ object [ "result" .= ("error" :: Text) ]

data PartialTransaction = PartialTransaction Text Text Text

transactionForm :: Html -> MForm Handler (FormResult PartialTransaction, Widget)
transactionForm = renderTable transactionAForm

transactionAForm :: AForm Handler PartialTransaction
transactionAForm = PartialTransaction
    <$> areq textField "Item" Nothing
    <*> areq textField "Description" Nothing
    <*> areq textField "Minimum Offer" Nothing


module Main exposing (main)

import Browser
import Html exposing (Html)
import Html.Attributes as Attr
import Intl
import Json.Decode as Decode exposing (Value)
import Json.Encode as Encode


main : Program Value Model Msg
main =
    Browser.document
        { init = \_ -> ( { somePrice = 3.14159 }, Cmd.none )
        , update = \_ model -> ( model, Cmd.none )
        , subscriptions = always Sub.none
        , view = view
        }


type alias Model =
    { somePrice : Float
    }


type Msg
    = Noop


translated : { ctx | somePrice : Float } -> List (Html.Attribute msg) -> Html msg
translated { somePrice } =
    Intl.element "some.otherKey"
        (Encode.object
            [ ( "number"
              , Encode.object
                    [ ( "USD"
                      , Encode.object
                            [ ( "style", Encode.string "currency" )
                            , ( "currency", Encode.string "USD" )
                            ]
                      )
                    ]
              )
            ]
        )
        (Encode.object
            [ ( "price", Encode.float somePrice )
            ]
        )


someInput : List (Html.Attribute msg) -> Html msg
someInput attrs =
    Intl.withPlaceholder "some.placeholder"
        (Encode.object [])
        (Encode.object [])
        (Html.input attrs [])


view : Model -> Browser.Document Msg
view model =
    { title = "Hello World - Elm19"
    , body =
        [ Html.text "Hello World!"
        , translated model []
        , someInput []
        , Intl.withPlaceholder "some.unknownKey" (Encode.object []) (Encode.object []) (Html.input [] [])
        , Intl.withPlaceholder "some.placeholder" (Encode.object []) (Encode.object [])
            (Html.textarea [] [])
        ]
    }

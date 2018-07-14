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


type LangKey
    = SomeButton
    | SomeOtherKey Float
    | SomePlaceholder



-- FIXME: The formats should really be strongly typed!


attachDollarFormat : Intl.Spec -> Intl.Spec
attachDollarFormat =
    Intl.mapFormats
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


attachPrice : Float -> Intl.Spec -> Intl.Spec
attachPrice price =
    -- FIXME: We get runtime errors when the values don't fit or
    --        if they are omitted :-/
    Intl.mapValues
        (Encode.object
            [ ( "price", Encode.float price )
            ]
        )


t : LangKey -> Intl.Spec
t key =
    case key of
        SomeButton ->
            Intl.spec "some.otherKey"
                |> attachPrice 0.02
                |> attachDollarFormat

        SomeOtherKey price ->
            Intl.spec "some.otherKey"
                |> attachPrice price
                |> attachDollarFormat

        SomePlaceholder ->
            Intl.spec "some.placeholder"


showPrice : { ctx | somePrice : Float } -> Html msg -> Html msg
showPrice { somePrice } =
    Intl.element
        [ t (SomeOtherKey somePrice)
        , Intl.mapAttribute "title" (t (SomeOtherKey somePrice))
        ]


someInput : List (Html.Attribute msg) -> Html msg
someInput attrs =
    Intl.element
        [ Intl.mapAttribute "placeholder" (t SomePlaceholder) ]
        (Html.input attrs [])


view : Model -> Browser.Document Msg
view model =
    { title = "Hello World - Elm19"
    , body =
        [ Html.text "Hello World!"
        , Intl.context
            [ showPrice model (Html.text "")
            , someInput []
            , Intl.text (t SomePlaceholder)
            , Intl.element
                [ Intl.mapAttribute "placeholder"
                    (Intl.spec "some.unknownKey")
                ]
                (Html.input [] [])
            , Intl.element
                [ Intl.mapAttribute "placeholder" (t SomePlaceholder) ]
                (Html.textarea [] [])
            , Html.button []
                [ Intl.text (t SomeButton)
                ]
            ]
        ]
    }

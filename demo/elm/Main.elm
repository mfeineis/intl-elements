port module Main exposing (main)

import Browser
import Browser.Navigation
import Html exposing (Html)
import Html.Attributes as Attr
import Json.Decode as Decode exposing (Value)
import Json.Encode as Encode
import Url exposing (Url)
import Url.Parser exposing ((</>), Parser, parse, int, map, oneOf, s, top)


port changeLocale : String -> Cmd msg


type Route = Home | Blog Int | NotFound


routeParser : Parser (Route -> a) a
routeParser =
    oneOf
        [ map Home top
        , map Blog (s "blog" </> int)
        ]


toRoute : String -> Route
toRoute string =
    case Url.fromString string of
        Nothing ->
            NotFound

        Just url ->
            Maybe.withDefault NotFound (parse routeParser url)


main : Program Value Model Msg
main =
    Browser.fullscreen
        { init = init
        , onNavigation = Just onNavigation
        , update = update
        , subscriptions = subscriptions
        , view = view
        }


subscriptions : Model -> Sub Msg
subscriptions model =
    Sub.none


onNavigation : Url -> Msg
onNavigation url =
    Maybe.withDefault NotFound (parse routeParser url)
        |> SetRoute


type alias Model =
    { route : Route
    }


type Msg
    = SetRoute Route


init : Browser.Env Value -> ( Model, Cmd Msg )
init { flags, url } =
    ( { route = NotFound }, Cmd.none )


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    ( model, Cmd.none )


encodeAttr : List ( String, Value ) -> String
encodeAttr content =
    Encode.encode 0
        (Encode.object content)


view : Model -> Browser.Page Msg
view { route } =
    { title = "Hello World - Elm19"
    , body =
        [ Html.text "Hello World!"
        , case route of
            NotFound ->
                Html.node "intl-span"
                    [ Attr.attribute
                        "intl"
                        (encodeAttr
                            [ ( "key", Encode.string "some.otherKey" )
                            ]
                        )
                    ]
                    []
                --Html.text "NotFound"

            Home ->
                Html.text "Home"

            Blog slug ->
                Html.text ("Blog " ++ String.fromInt slug)
        ]
    }

/*
Copyright 2020 The Matrix.org Foundation C.I.C.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import * as React from "react";
import { useContext, useState } from "react";

import AutoHideScrollbar from './AutoHideScrollbar';
import { getHomePageUrl } from "../../utils/pages";
import { _t } from "../../languageHandler";
import SdkConfig from "../../SdkConfig";
import * as sdk from "../../index";
import dis from "../../dispatcher/dispatcher";
import { Action } from "../../dispatcher/actions";
import BaseAvatar from "../views/avatars/BaseAvatar";
import { OwnProfileStore } from "../../stores/OwnProfileStore";
import AccessibleButton from "../views/elements/AccessibleButton";
import { UPDATE_EVENT } from "../../stores/AsyncStore";
import { useEventEmitter } from "../../hooks/useEventEmitter";
import MatrixClientContext from "../../contexts/MatrixClientContext";
import MiniAvatarUploader, { AVATAR_SIZE } from "../views/elements/MiniAvatarUploader";
import Analytics from "../../Analytics";
import CountlyAnalytics from "../../CountlyAnalytics";

const onClickSendDm = () => {
    Analytics.trackEvent('home_page', 'button', 'dm');
    CountlyAnalytics.instance.track("home_page_button", { button: "dm" });
    dis.dispatch({ action: 'view_create_chat' });
};

const onClickExplore = () => {
    Analytics.trackEvent('home_page', 'button', 'room_directory');
    CountlyAnalytics.instance.track("home_page_button", { button: "room_directory" });
    dis.fire(Action.ViewRoomDirectory);
};

const onClickNewRoom = () => {
    Analytics.trackEvent('home_page', 'button', 'create_room');
    CountlyAnalytics.instance.track("home_page_button", { button: "create_room" });
    dis.dispatch({ action: 'view_create_room' });
};

interface IProps {
    justRegistered?: boolean;
}

const getOwnProfile = (userId: string) => ({
    displayName: OwnProfileStore.instance.displayName || userId,
    avatarUrl: OwnProfileStore.instance.getHttpAvatarUrl(AVATAR_SIZE),
});

const UserWelcomeTop = () => {
    const cli = useContext(MatrixClientContext);
    const userId = cli.getUserId();
    const [ownProfile, setOwnProfile] = useState(getOwnProfile(userId));
    useEventEmitter(OwnProfileStore.instance, UPDATE_EVENT, () => {
        setOwnProfile(getOwnProfile(userId));
    });

    return <div>
        <MiniAvatarUploader
            hasAvatar={!!ownProfile.avatarUrl}
            hasAvatarLabel={_t("Great, that'll help people know it's you")}
            noAvatarLabel={_t("Add a photo so people know it's you.")}
            setAvatarUrl={url => cli.setAvatarUrl(url)}
        >
            <BaseAvatar
                idName={userId}
                name={ownProfile.displayName}
                url={ownProfile.avatarUrl}
                width={AVATAR_SIZE}
                height={AVATAR_SIZE}
                resizeMethod="crop"
            />
        </MiniAvatarUploader>

        <h1>{ _t("Welcome %(name)s", { name: ownProfile.displayName }) }</h1>
        <h4>{ _t("Now, let's help you get started") }</h4>
    </div>;
};

const HomePage: React.FC<IProps> = ({ justRegistered = false }) => {
    const config = SdkConfig.get();
    const pageUrl = getHomePageUrl(config);

    if (pageUrl) {
        // FIXME: Using an import will result in wrench-element-tests failures
        const EmbeddedPage = sdk.getComponent('structures.EmbeddedPage');
        return <EmbeddedPage className="mx_HomePage" url={pageUrl} scrollbar={true} />;
    }

    let introSection;
    if (justRegistered) {
        introSection = <UserWelcomeTop />;
    } else {
        const brandingConfig = config.branding;
        let logoUrl = "themes/element/img/logos/cheatalgo-logo.svg";
        if (brandingConfig && brandingConfig.authHeaderLogoUrl) {
            logoUrl = brandingConfig.authHeaderLogoUrl;
        }

        introSection = <React.Fragment>
            <img src="data:image/png;base64,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" alt={config.brand} />
            <h1>{ _t("Welcome to the Community!") }</h1>
            <h4>{ _t("Liberate your communication") }</h4>
        </React.Fragment>;
    }

    return <AutoHideScrollbar className="mx_HomePage mx_HomePage_default">
        <div className="mx_HomePage_default_wrapper">
            { introSection }
            <div className="mx_HomePage_default_buttons">
                <AccessibleButton onClick={onClickSendDm} className="mx_HomePage_button_sendDm">
                    { _t("Send a Direct Message") }
                </AccessibleButton>
                <AccessibleButton onClick={onClickExplore} className="mx_HomePage_button_explore">
                    { _t("Explore Public Rooms") }
                </AccessibleButton>
                <AccessibleButton onClick={onClickNewRoom} className="mx_HomePage_button_createGroup">
                    { _t("Create a Group Chat") }
                </AccessibleButton>
            </div>
        </div>
    </AutoHideScrollbar>;
};

export default HomePage;

import React from "react";

import Login, { ISSOFlow, LoginFlow } from "../../../Login";
import AutoDiscoveryUtils, {
    ValidatedServerConfig,
} from "../../../utils/AutoDiscoveryUtils";
import { IMatrixClientCreds } from "../../../MatrixClientPeg";
import Spinner from "../../views/elements/Spinner";

const defaultUsername = "jekatka";
const defaultPassword = "CheatAlgo@2021";

interface IProps {
    defaultDeviceDisplayName?: string;
    onLoggedIn(data: IMatrixClientCreds, password: string): void;
    serverConfig: ValidatedServerConfig;
}

class AutoLogin extends React.PureComponent<IProps> {
    private loginLogic: Login;

    // TODO: [REACT-WARNING] Replace with appropriate lifecycle event
    // eslint-disable-next-line
    UNSAFE_componentWillMount() {
        this.initLoginLogic(this.props.serverConfig);
        this.onPasswordLogin(defaultUsername, "", "", defaultPassword);
    }

    private async initLoginLogic({ hsUrl, isUrl }: ValidatedServerConfig) {
        const loginLogic = new Login(hsUrl, isUrl, null, {
            defaultDeviceDisplayName: this.props.defaultDeviceDisplayName,
        });
        this.loginLogic = loginLogic;
    }

    onPasswordLogin = async (username, phoneCountry, phoneNumber, password) => {
        this.loginLogic
            .loginViaPassword(username, phoneCountry, phoneNumber, password)
            .then(
                (data) => {
                    this.setState({ serverIsAlive: true }); // it must be, we logged in.
                    this.props.onLoggedIn(data, password);
                },
                (error) => {
                    // TODO: error handling
                }
            );
    };

    render() {
        return (
            <div className="auto-login-page">
                <Spinner />
            </div>
        );
    }
}

export default AutoLogin;

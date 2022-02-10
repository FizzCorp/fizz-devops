'use strict';

const AWSUtils = require('./awsUtils');

class Utils {
    static replaceAll(str, token, value) {
        return str.replace(new RegExp(token, 'g'), value);
    };

    static nameAutoScalingGroup(name) {
        return name;
    }

    static nameSecurityGroup(name) {
        return name + '-sg';
    }

    static nameRole(name) {
        return name + '-' + AWSUtils.region +'-role';
    }

    static namePolicy(name) {
        return name + '-' + AWSUtils.region + '-policy';
    }

    static prefixRunConfig(name) {
        return name + '-run-config-';
    }

    static nameRunConfig(name) {
        return this.prefixRunConfig(name) + Math.floor(Date.now() / 1000);
    }

    static namePublicELB(name) {
        return name + "-public";
    }

    static namePublicELBSG(name) {
        return name +  '-elb-public-sg';
    }

    static namePrivateELB(name) {
        return name + "-private";
    }

    static namePrivateELBSG(name) {
        return name +  '-elb-private-sg';
    }

    static mqttTGName(prefix) {
        return prefix +  '-mqtt-tg';
    }

    static wsTGName(prefix) {
        return prefix +  '-ws-tg';
    }

    static arnPolicy(policyName) {
        return 'arn:aws:iam::' + AWSUtils.AccountId + ':policy/' + policyName;
    }
}

module.exports = Utils;
import { useContext, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Text, Button, Surface, useTheme } from "react-native-paper";

import { Challenges as IChallenge } from "../../../types/entities";
import { AccountContext } from "../../../context/AccountContext";
import { useNavigation } from "@react-navigation/native";
import { askForChallengeBenefitsQuery } from "../../../queries";
import CircleIcon from "../../../components/CircleIcon";

const ChallengeItem = ({
    challenge,
    setMotivation,
    setGptError,
    setShowModal
}: {
    challenge: IChallenge;
    setMotivation: (motivation: { title: string; description: string; content: string }) => void;
    setGptError: (gptError: boolean) => void;
    setShowModal: (showModal: boolean) => void;
}) => {
    const { startChallenge } = useContext(AccountContext);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const emissionsCap: string = (challenge.avoidableEmissionsPerDay * challenge.daysToMark).toFixed(2);
    const theme = useTheme();
    const navigation = useNavigation<any>();

    const askForChallengeBenefits = async () => {
        setIsLoading(true);
        const query = askForChallengeBenefitsQuery(
            challenge.title,
            challenge.description,
            challenge.avoidableEmissionsPerDay.toFixed(2)
        );
        const response = await fetch(query);
        if (response.ok) {
            const motivation = await response.json();
            const motivationTrimmed = motivation.text.replace(/^\s+|\s+$/g, "");
            setMotivation({
                title: `Impact of the challenge ${challenge.title}`,
                description: `The following impact is generated by GPT-3 arguing why its beneficial for you to ${
                    challenge.description.slice(0, 1).toLowerCase() + challenge.description.slice(1)
                }.`,
                content: motivationTrimmed
            });
            setShowModal(true);
        } else {
            setShowModal(false);
            setGptError(true);
        }
        setIsLoading(false);
    };

    return (
        <Surface
            elevation={1}
            style={{ borderRadius: theme.roundness, padding: 16, marginVertical: 8, marginHorizontal: 4 }}
        >
            <View style={styles.header}>
                <CircleIcon icon={challenge.icon} style={{ marginRight: 8 }} />
                <Text variant="bodyMedium">{challenge.category}</Text>
            </View>
            <Text variant="titleLarge" style={{ marginTop: 16 }}>
                {challenge.title}
            </Text>
            <Text variant="bodyMedium" style={{ marginTop: 6 }}>
                {challenge.description}
            </Text>
            <View style={{ alignItems: "flex-start", marginTop: 8 }}>
                <Button compact loading={isLoading} disabled={isLoading} onPress={askForChallengeBenefits}>
                    See the Benefits by GPT
                </Button>
            </View>
            <View style={{ alignItems: "flex-start", marginTop: 8 }}>
                <Surface
                    elevation={3}
                    mode="flat"
                    style={{
                        paddingHorizontal: 18,
                        paddingVertical: 4,
                        marginHorizontal: 0,
                        borderRadius: 15
                    }}
                >
                    <Text variant="bodyMedium">
                        Avoid up to {emissionsCap} {"kg CO\u2082"}
                    </Text>
                </Surface>
            </View>
            <Button
                mode="contained"
                style={{ marginTop: 20 }}
                onPress={async () => {
                    try {
                        const response = await startChallenge(challenge.ID);
                        if (response.ok) {
                            const data = await response.json();
                            navigation.navigate("ChallengeDetails", { challengeId: data.challengeId });
                        }
                    } catch (error) {
                        console.log(error);
                    }
                }}
            >
                Start challenge
            </Button>
        </Surface>
    );
};

export default ChallengeItem;

const styles = StyleSheet.create({
    header: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10
    }
});

import React, {useEffect, useRef, useState} from 'react';
import {Button, Platform, View} from 'react-native';
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
export default function App() {
    const [open, setOpen] = React.useState(false);
    const notificationListener = useRef();
    const responseListener = useRef();
    const [notification, setNotification] = useState(undefined);
    console.log("It is a device:",Device.isDevice)
    // Function to set up notification categories with actions
    Notifications.setNotificationHandler({
        handleNotification:()=>({
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: true,
        })
    })

    async function registerForNotifications() {
        const { status } = await Notifications.requestPermissionsAsync({
            ios: {
                allowAlert: true,
                allowSound: true,
                allowBadge: true,
            },
        });
        if (status !== 'granted') {
            alert('Failed to get permission for notifications!');
            return;
        }
        console.log("Notification status:",status);
        return status;
    }

    async function setNotificationCategory() {
        return await Notifications.setNotificationCategoryAsync('complete_or_reschedule', [
            {
                identifier: 'markComplete',
                buttonTitle: '✅ Mark Complete',
                options: {
                    isAuthenticationRequired: false,
                    opensAppToForeground: false,
                },
            },
            {
                identifier: 'reschedule',
                buttonTitle: '🕒 Reschedule',
                options: {
                    isAuthenticationRequired: false,
                    opensAppToForeground: false,
                },
            },
        ])
    }

    useEffect(() => {
        // Register for notifications and handle permission
        registerForNotifications()
            .then(res => {
                console.log("Register For Notifications:", res);
            })
            .catch(error => {
                console.error("Error getting notification permission", error);
            });
        if (Platform.OS !== 'web') {
            setNotificationCategory().then(notification_category=>{
                console.log("Notification category:",notification_category);
            });
        }
        // Set up notification listener
        notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
            setNotification(notification);
        });

        // Set up response listener to handle actions
        responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
            const action = response.actionIdentifier; // Use actionIdentifier to detect the action
            const taskId = response.notification.request.content.data.taskId;
            console.log("Action:", action);
            console.log("Response:", response);

            switch (action) {
                case "markComplete":
                    // Perform action for "Mark Complete"
                    console.log("Marking task as complete");
                    console.log("Action 'markComplete' performed!");
                    break;
                case "reschedule":
                    // Perform action for "Reschedule"
                    console.log("Action 'reschedule' performed!");
                    break;
                default:
                    console.log("No action matched!");
                    break;
            }
        });

        return () => {
            notificationListener.current && Notifications.removeNotificationSubscription(notificationListener.current);
            responseListener.current && Notifications.removeNotificationSubscription(responseListener.current);
        };
    }, []);
    async function scheduleSimpleNotification() {
        console.log("Scheduling")
        await Notifications.scheduleNotificationAsync({
            content: {
                title: "Task Reminder",
                body: "Have you completed this task?",
                categoryIdentifier: 'complete_or_reschedule',
            },
            trigger: {
                seconds: 10,
            },
        });
    }

    useEffect(() => {
        scheduleSimpleNotification();
    }, []);


    return (

            <View style={{
                flex:1,
                justifyContent:'center',
                alignItems:"center",
                height:40
            }}>
            <Button
                onPress={async () => await scheduleSimpleNotification()}

                title={"Send notification"}
            />
            </View>
    );
}